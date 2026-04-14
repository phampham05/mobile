import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
  } from "react-native";
  import { useState, useContext } from "react";
  import { UserContext } from "../context/UserContext";
  import { useRouter } from "expo-router";
  
  export default function Login() {
    const { login } = useContext(UserContext);
    const router = useRouter();
  
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
  
    const handleLogin = () => {
      // fake login (sau này gọi API)
      const userData = {
        id: 1,
        name: username,
      };
  
      login(userData);
  
      router.replace("/profile");
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đăng nhập</Text>
  
        <TextInput
          placeholder="Username"
          style={styles.input}
          onChangeText={setUsername}
        />
  
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />
  
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={{ color: "white" }}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
    },
  
    title: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
    },
  
    input: {
      borderWidth: 1,
      marginBottom: 10,
      padding: 10,
      borderRadius: 8,
    },
  
    button: {
      backgroundColor: "#1E88E5",
      padding: 15,
      alignItems: "center",
      borderRadius: 10,
    },
  });