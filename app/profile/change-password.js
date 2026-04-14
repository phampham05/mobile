import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../../context/UserContext";

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

  // Hàm kiểm tra dữ liệu
  const validate = () => {
    let newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (!validate()) return;
  
    try {
      await changePassword(currentPassword, newPassword);
  
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
  
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Đổi mật khẩu thất bại"
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Mật khẩu hiện tại */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}> <Text style={{color: "red"}}>*</Text> Mật khẩu hiện tại</Text>

        <View style={[
            styles.passwordContainer,
            focusField === "current" && { borderColor: "#1E88E5" }
          ]}>

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
          <TouchableOpacity
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <Ionicons
              name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {errors.currentPassword && (
          <Text style={styles.error}>{errors.currentPassword}</Text>
        )}
      </View>

      {/* Mật khẩu mới */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}> <Text style={{color: "red"}}>*</Text> Mật khẩu mới</Text>

        <View style={[
            styles.passwordContainer,
            focusField === "new" && { borderColor: "#1E88E5" }
          ]}>

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
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {errors.newPassword && (
          <Text style={styles.error}>{errors.newPassword}</Text>
        )}
      </View>

      {/* Xác nhận mật khẩu */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}> <Text style={{color: "red"}}>*</Text> Xác nhận mật khẩu</Text>

        <View style={[
            styles.passwordContainer,
            focusField === "confirm" && { borderColor: "#1E88E5" }
          ]}>

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
          <TouchableOpacity
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}
      </View>

      {/* Nút đổi mật khẩu */}
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

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#FFF",
    paddingLeft: 10,
    paddingRight: 10,
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