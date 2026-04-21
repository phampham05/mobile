import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { CartProvider } from "../context/CartContext";
import { UserProvider } from "../context/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <CartProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#1E88E5",
            },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ title: "Chỉnh sửa hồ sơ" }} />
          <Stack.Screen
            name="profile/change-password"
            options={{ title: "Đổi mật khẩu" }}
          />
          <Stack.Screen name="legal/terms" options={{ title: "Điều khoản sử dụng" }} />
          <Stack.Screen
            name="legal/privacy"
            options={{ title: "Chính sách bảo mật" }}
          />
          {/* <Stack.Screen name="modal" options={{ presentation: "modal" }} /> */}
        </Stack>
        <Toast />
      </CartProvider>
    </UserProvider>
  );
}
