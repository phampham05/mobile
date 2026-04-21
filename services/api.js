import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  queue = [];
};

// REQUEST
api.interceptors.request.use(async (config) => {
  let token;

  if (Platform.OS === "web") {
    token = localStorage.getItem("token");
  } else {
    token = await AsyncStorage.getItem("token");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE (REFRESH LOGIC)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        let refreshToken;

        if (Platform.OS === "web") {
          refreshToken = localStorage.getItem("refresh_token");
        } else {
          refreshToken = await AsyncStorage.getItem("refresh_token");
        }

        const res = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
          { token: refreshToken }
        );

        const newToken = res.data.result.token;

        if (Platform.OS === "web") {
          localStorage.setItem("token", newToken);
        } else {
          await AsyncStorage.setItem("token", newToken);
        }

        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);

        if (Platform.OS === "web") {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
        } else {
          await AsyncStorage.clear();
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;