import { useContext, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { UserContext } from "../context/UserContext";
import { getUserFriendlyErrorMessage } from "../utils/errorMessages";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập đầy đủ email và mật khẩu.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await login({ email, password });
      router.replace("/(tabs)/profile");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: getUserFriendlyErrorMessage(error, "login"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.brand}>BookStore</Text>
          <Text style={styles.welcome}>Chào mừng trở lại</Text>
          <Text style={styles.title}>Đăng nhập</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={22} color="#7E8792" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="vidu@email.com"
                placeholderTextColor="#98A2AE"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={22} color="#7E8792" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#98A2AE"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword((value) => !value)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#7E8792"
                />
              </Pressable>
            </View>

            <Pressable
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Đăng nhập</Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Chưa có tài khoản?</Text>
              <Pressable onPress={() => router.push("/register")}>
                <Text style={styles.footerLink}>Đăng ký</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  flex: {
    flex: 1,
  },
  content: {
    marginTop: 32,
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 44,
    paddingBottom: 32,
  },
  brand: {
    fontSize: 40,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#1363D1",
    textAlign: "center",
  },
  welcome: {
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
    fontSize: 20,
    color: "#5F6874",
  },
  title: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: "#1E242C",
  },
  form: {
    marginTop: 56,
    gap: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4C5663",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF0F6",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    minHeight: 66,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#364152",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#136AE1",
    minHeight: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#136AE1",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  footerText: {
    fontSize: 16,
    color: "#5F6874",
  },
  footerLink: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1363D1",
  },
});
