import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { UserContext } from "../../context/UserContext";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

const PHONE_REGEX = /^(0|\+84)\d{9}$/;

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  error,
  editable = true,
  icon,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, multiline && styles.multilineWrapper, !editable && styles.readOnlyWrapper]}>
        {icon ? <Ionicons name={icon} size={20} color="#7E8792" /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#98A2AE"
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          style={[styles.input, multiline && styles.multilineInput, !editable && styles.readOnlyInput]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function validateFullName(name) {
  if (!name.trim()) {
    return "Vui lòng nhập họ và tên.";
  }

  if (name !== name.trim()) {
    return "Họ và tên không được có khoảng trắng ở đầu hoặc cuối.";
  }

  return null;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useContext(UserContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return;

    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setAddress(user.address ?? "");
  }, [user]);

  const validate = () => {
    const nextErrors = {};
    const fullNameError = validateFullName(name);

    if (fullNameError) {
      nextErrors.name = fullNameError;
    }

    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
      nextErrors.phone = "Số điện thoại không hợp lệ.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      await updateUser({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      Alert.alert("Cập nhật thành công", "Thông tin hồ sơ đã được lưu.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Không thể cập nhật hồ sơ",
        getUserFriendlyErrorMessage(error, "updateProfile")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.noticeContainer}>
        <Ionicons name="person-circle-outline" size={72} color="#9CA3AF" />
        <Text style={styles.noticeText}>Vui lòng đăng nhập.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name?.trim()?.charAt(0)?.toUpperCase() || "U"}</Text>
            </View>
            <Text style={styles.avatarName}>{user.name || "Người dùng"}</Text>
            <Text style={styles.avatarHint}>
              Bạn có thể cập nhật tên, số điện thoại và địa chỉ tại đây.
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Họ và tên"
              value={name}
              onChangeText={setName}
              placeholder="Nguyễn Văn A"
              icon="person-outline"
              error={errors.name}
            />

            <FormField
              label="Email"
              value={user.email ?? ""}
              placeholder="email@example.com"
              icon="mail-outline"
              editable={false}
            />

            <FormField
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              placeholder="0901234567"
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
            />

            <FormField
              label="Địa chỉ"
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ của bạn"
              icon="location-outline"
              multiline
              error={errors.address}
            />

            <Pressable
              style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FB",
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  noticeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FB",
    paddingHorizontal: 24,
  },
  noticeText: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  avatarCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DCE4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1149D8",
  },
  avatarName: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#171B23",
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: "#6B7280",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  inputWrapper: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#EEF2F8",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  multilineWrapper: {
    minHeight: 110,
    alignItems: "flex-start",
    paddingTop: 16,
  },
  readOnlyWrapper: {
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  multilineInput: {
    minHeight: 78,
    textAlignVertical: "top",
  },
  readOnlyInput: {
    color: "#6B7280",
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
  },
  saveButton: {
    marginTop: 4,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#1149D8",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.75,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
});
