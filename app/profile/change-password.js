import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useContext, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../../context/UserContext";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const { changePassword } = useContext(UserContext);

  const validate = () => {
    const nextErrors = {};

    if (!currentPassword.trim()) {
      nextErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    } else if (newPassword === currentPassword) {
      nextErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại.";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      await changePassword(currentPassword, newPassword);

      Alert.alert("Thành công", "Mật khẩu đã được cập nhật.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error) {
      Alert.alert("Không thể đổi mật khẩu", getUserFriendlyErrorMessage(error, "changePassword"));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Text style={styles.required}>*</Text> Mật khẩu hiện tại
        </Text>
        <View
          style={[
            styles.passwordContainer,
            focusField === "current" && styles.passwordContainerFocused,
          ]}
        >
          <TextInput
            placeholder="Nhập mật khẩu hiện tại"
            placeholderTextColor="gray"
            style={styles.input}
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            onFocus={() => setFocusField("current")}
            onBlur={() => setFocusField(null)}
          />
          <TouchableOpacity onPress={() => setShowCurrentPassword((value) => !value)}>
            <Ionicons
              name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {errors.currentPassword ? <Text style={styles.error}>{errors.currentPassword}</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Text style={styles.required}>*</Text> Mật khẩu mới
        </Text>
        <View
          style={[
            styles.passwordContainer,
            focusField === "new" && styles.passwordContainerFocused,
          ]}
        >
          <TextInput
            placeholder="Nhập mật khẩu mới"
            placeholderTextColor="gray"
            style={styles.input}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            onFocus={() => setFocusField("new")}
            onBlur={() => setFocusField(null)}
          />
          <TouchableOpacity onPress={() => setShowNewPassword((value) => !value)}>
            <Ionicons
              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {errors.newPassword ? <Text style={styles.error}>{errors.newPassword}</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <Text style={styles.required}>*</Text> Xác nhận mật khẩu
        </Text>
        <View
          style={[
            styles.passwordContainer,
            focusField === "confirm" && styles.passwordContainerFocused,
          ]}
        >
          <TextInput
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor="gray"
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setFocusField("confirm")}
            onBlur={() => setFocusField(null)}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword((value) => !value)}>
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6F8",
  },
  inputGroup: {
    marginBottom: 15,
    borderColor: "#CCC",
    paddingHorizontal: 10,
    marginTop: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 15,
    fontWeight: "500",
  },
  required: {
    color: "red",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
    paddingLeft: 10,
    paddingRight: 10,
  },
  passwordContainerFocused: {
    borderColor: "#1E88E5",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 0,
  },
  button: {
    backgroundColor: "#1E88E5",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
