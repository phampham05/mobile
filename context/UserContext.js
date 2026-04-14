import { createContext, useEffect, useState } from "react";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const getToken = async () => {
    if (Platform.OS === "web") {
      return localStorage.getItem("token");
    }
    return await AsyncStorage.getItem("token");
  };

  // Lấy thông tin người dùng
  const fetchUser = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get("/users/my-info");
      const data = response.data.result;

      setUser({
        id: data.id,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        avatar:
          data.avatar ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      });
    } catch (error) {
      console.log("Lỗi lấy thông tin user:", error.response?.data);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hồ sơ
  const updateUser = async (updatedData) => {
    try {
      let response;

      // Nếu có ảnh mới (local URI) → gửi multipart/form-data
      if (updatedData.avatar && updatedData.avatar.startsWith("file")) {
        const formData = new FormData();
        formData.append("fullName", updatedData.name);
        formData.append("email", updatedData.email);
        formData.append("phone", updatedData.phone);
        formData.append("address", updatedData.address);

        formData.append("avatar", {
          uri: updatedData.avatar,
          name: "avatar.jpg",
          type: "image/jpeg",
        });

        response = await api.put("/users/me", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.put("/users/me", {
          fullName: updatedData.name,
          email: updatedData.email,
          phone: updatedData.phone,
          address: updatedData.address,
          avatar: updatedData.avatar,
        });
      }

      const data = response.data.result;

      setUser({
        id: data.id,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        avatar:
          data.avatar ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      });

      return true;
    } catch (error) {
      console.log("Lỗi cập nhật hồ sơ:", error.response?.data);
      throw error;
    }
  };

  // Đổi mật khẩu
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return true;
    } catch (error) {
      console.log("Lỗi đổi mật khẩu:", error.response?.data);
      throw error;
    }
  };

  // Đăng xuất
  const logout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("token");
    } else {
      await AsyncStorage.removeItem("token");
    }
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        fetchUser,
        updateUser,
        changePassword,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};