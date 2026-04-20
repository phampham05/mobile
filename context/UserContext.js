import { createContext, useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import {
  changePasswordRequest,
  fetchMyInfoRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "../services/authService";

export const UserContext = createContext();

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const TOKEN_KEY = "token";

const getStorage = () => {
  if (Platform.OS === "web") {
    return {
      getItem: async (key) => localStorage.getItem(key),
      setItem: async (key, value) => localStorage.setItem(key, value),
      removeItem: async (key) => localStorage.removeItem(key),
    };
  }

  return AsyncStorage;
};

const pickProfileValue = (...values) => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
      continue;
    }

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return "";
};

const normalizeUser = (data = {}, fallback = {}) => ({
  id: data.id ?? fallback.id ?? "",
  name: pickProfileValue(data.fullName, data.name, fallback.name),
  email: pickProfileValue(data.email, fallback.email),
  phone: pickProfileValue(data.phone, fallback.phone),
  address: pickProfileValue(data.address, fallback.address),
  avatar: fallback.avatar ?? DEFAULT_AVATAR,
});

export const UserProvider = ({ children }) => {
  const storage = getStorage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(async () => storage.getItem(TOKEN_KEY), [storage]);

  const saveToken = useCallback(async (token) => {
    if (token) {
      await storage.setItem(TOKEN_KEY, token);
    }
  }, [storage]);

  const clearToken = useCallback(async () => {
    await storage.removeItem(TOKEN_KEY);
  }, [storage]);

  const fetchUser = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const token = await getToken();

      if (!token) {
        setUser(null);
        return null;
      }

      const data = await fetchMyInfoRequest();
      let normalizedUser;

      setUser((currentUser) => {
        normalizedUser = normalizeUser(data, currentUser ?? {});
        return normalizedUser;
      });

      return normalizedUser;
    } catch (error) {
      console.log("Loi lay thong tin user:", error.response?.data || error.message);
      await clearToken();
      setUser(null);
      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [clearToken, getToken]);

  // Bootstrap auth state once on mount from persisted token.
  useEffect(() => {
    const bootstrapUser = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        if (!token) {
          setUser(null);
          return;
        }

        const data = await fetchMyInfoRequest();
        setUser((currentUser) => normalizeUser(data, currentUser ?? {}));
      } catch (error) {
        console.log("Loi khoi tao user:", error.response?.data || error.message);
        await clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapUser();
  }, [clearToken, getToken]);

  const login = useCallback(async ({ email, password }) => {
    try {
      setLoading(true);

      const data = await loginRequest({ email, password });
      const token = data.token;

      if (!data.authenticated || !token) {
        throw new Error("Dang nhap that bai");
      }

      await saveToken(token);

      const fetchedUser = await fetchUser();
      const resolvedUser = fetchedUser ?? normalizeUser({}, { email });

      setUser(resolvedUser);

      return { success: true, user: resolvedUser };
    } catch (error) {
      console.log("Loi dang nhap:", error.response?.data || error.message);
      await clearToken();
      setUser(null);
      setLoading(false);
      throw error;
    }
  }, [clearToken, fetchUser, saveToken]);

  const register = useCallback(async ({ fullName, email, password, dob }) => {
    try {
      setLoading(true);

      await registerRequest({ fullName, email, password, dob });
      return await login({ email, password });
    } catch (error) {
      console.log("Loi dang ky:", error.response?.data || error.message);
      await clearToken();
      setUser(null);
      setLoading(false);
      throw error;
    }
  }, [clearToken, login]);

  const updateUser = useCallback(async (updatedData) => {
    try {
      const payload = {
        fullName: updatedData.name,
        phone: updatedData.phone,
        address: updatedData.address,
      };

      if (updatedData.password?.trim()) {
        payload.password = updatedData.password.trim();
      }

      const optimisticUser = {
        ...(user ?? {}),
        name: updatedData.name ?? user?.name ?? "",
        phone: updatedData.phone ?? user?.phone ?? "",
        address: updatedData.address ?? user?.address ?? "",
      };

      setUser(optimisticUser);

      const response = await api.put("/users/me", payload);
      const data = response?.data?.result ?? response?.data ?? {};
      const nextUser = normalizeUser(data, optimisticUser);

      setUser(nextUser);

      try {
        const refreshedUser = await fetchUser();
        return refreshedUser ?? nextUser;
      } catch {
        return nextUser;
      }
    } catch (error) {
      console.log("Loi cap nhat ho so:", error.response?.data || error.message);
      throw error;
    }
  }, [fetchUser, user]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await changePasswordRequest(currentPassword, newPassword);
      return true;
    } catch (error) {
      console.log("Loi doi mat khau:", error.response?.data || error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = await getToken();

      if (token) {
        await logoutRequest(token);
      }
    } catch (error) {
      console.log("Loi dang xuat:", error.response?.data || error.message);
    } finally {
      await clearToken();
      setUser(null);
      setLoading(false);
    }
  }, [clearToken, getToken]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        fetchUser,
        login,
        register,
        updateUser,
        changePassword,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
