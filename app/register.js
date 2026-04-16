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

function AuthInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  trailing,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={22} color="#7E8792" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#98A2AE"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
        />
        {trailing}
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useContext(UserContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng điền đầy đủ các trường bắt buộc.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu chưa khớp",
        text2: "Vui lòng kiểm tra lại phần xác nhận mật khẩu.",
      });
      return;
    }

    if (!acceptedTerms) {
      Toast.show({
        type: "error",
        text1: "Chưa đồng ý điều khoản",
        text2: "Bạn cần đồng ý điều khoản và chính sách bảo mật.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await register({ fullName, email, password });
      Toast.show({
        type: "success",
        text1: "Đăng ký thành công",
        text2: "Tài khoản của bạn đã sẵn sàng.",
      });
      router.replace("/(tabs)/profile");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Đăng ký thất bại",
        text2:
          error.response?.data?.message ||
          "Không thể tạo tài khoản. Kiểm tra lại endpoint backend.",
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
          <Text style={styles.welcome}>Chào mừng bạn</Text>
          <Text style={styles.title}>Tạo tài khoản mới</Text>

          <View style={styles.form}>
            <AuthInput
              label="Họ và tên"
              icon="person"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nguyễn Văn A"
              autoCapitalize="words"
            />

            <AuthInput
              label="Email"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="vidu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthInput
              label="Mật khẩu"
              icon="lock-closed"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              trailing={
                <Pressable onPress={() => setShowPassword((value) => !value)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#7E8792"
                  />
                </Pressable>
              }
            />

            <AuthInput
              label="Xác nhận mật khẩu"
              icon="shield-checkmark"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showConfirmPassword}
              trailing={
                <Pressable onPress={() => setShowConfirmPassword((value) => !value)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#7E8792"
                  />
                </Pressable>
              }
            />

            <Pressable
              style={styles.termsRow}
              onPress={() => setAcceptedTerms((value) => !value)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms ? (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                ) : null}
              </View>
              <Text style={styles.termsText}>
                Tôi đồng ý với <Text style={styles.termsLink}>điều khoản</Text> và{" "}
                <Text style={styles.termsLink}>chính sách bảo mật</Text> của BookStore.
              </Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Đăng ký</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc đăng ký bằng</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton}>
                <Text style={styles.googleMark}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color="#2456D5" />
                <Text style={styles.socialText}>Facebook</Text>
              </Pressable>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
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
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 32,
  },
  brand: {
    fontSize: 40,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#1363D1",
    textAlign: "center",
    paddingTop : 30
  },
  welcome: {
    marginTop: 5,
    marginBottom: 5,
    textAlign: "center",
    fontSize: 20,
    color: "#5F6874",
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: "#1E242C",
  },
  form: {
    marginTop: 48,
    gap: 18,
  },
  fieldGroup: {
    gap: 10,
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
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#A8B2BF",
    backgroundColor: "#F4F7FA",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#136AE1",
    borderColor: "#136AE1",
  },
  termsText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#5F6874",
  },
  termsLink: {
    color: "#1363D1",
    fontWeight: "800",
  },
  primaryButton: {
    marginTop: 10,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D5DCE5",
  },
  dividerText: {
    fontSize: 16,
    color: "#5F6874",
  },
  socialRow: {
    flexDirection: "row",
    gap: 14,
  },
  socialButton: {
    flex: 1,
    minHeight: 74,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    shadowColor: "#111827",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  googleMark: {
    fontSize: 26,
    fontWeight: "900",
    color: "#EA4335",
  },
  socialText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E242C",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 26,
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
