// import {
//     View,
//     TextInput,
//     TouchableOpacity,
//     Text,
//     Image,
//     StyleSheet,
//     Alert
//   } from "react-native";
//   import { useContext, useState } from "react";
//   import { UserContext } from "../../context/UserContext";
//   import * as ImagePicker from "expo-image-picker";
  
//   export default function EditProfile() {
//     const { user, updateUser } = useContext(UserContext);
  
//     const [name, setName] = useState(user.name);
//     const [email, setEmail] = useState(user.email);
//     const [phone, setPhone] = useState(user.phone);
//     const [address, setAddress] = useState(user.address);
//     const [avatar, setAvatar] = useState(user.avatar);

//     const [errors, setErrors] = useState({});

//     const validate = () => {
//       let newErrors = {};
    
//       // Kiểm tra tên
//       if (!name.trim()) {
//         newErrors.name = "Họ và tên không được để trống";
//       }
    
//       // Kiểm tra email
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!email.trim()) {
//         newErrors.email = "Email không được để trống";
//       } else if (!emailRegex.test(email)) {
//         newErrors.email = "Email không hợp lệ";
//       }
    
//       // Kiểm tra số điện thoại Việt Nam
//       const phoneRegex = /^(0|\+84)[0-9]{9}$/;
//       if (!phone.trim()) {
//         newErrors.phone = "Số điện thoại không được để trống";
//       } else if (!phoneRegex.test(phone)) {
//         newErrors.phone = "Số điện thoại không hợp lệ";
//       }

//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//     };
  
//     // chọn ảnh
//     const pickImage = async () => {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 1,
//       });
  
//       if (!result.canceled) {
//         setAvatar(result.assets[0].uri);
//       }
//     };
  
//     const handleSave = () => {
//       if (!validate()) return;

//       updateUser({ name, email, phone, address, avatar });

//       Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
//     };
  
//     return (
//       <View style={styles.container}>
//         <TouchableOpacity onPress={pickImage}>
//           <Image source={{ uri: avatar }} style={styles.avatar} />
//           <Text style={styles.positionAvt}>Chọn ảnh</Text>
//         </TouchableOpacity>
      
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}> <Text style={{color: "red"}}>*</Text> Họ và tên </Text>
//           <TextInput 
//             value={name} 
//             onChangeText={setName} 
//             placeholder= "Nhập tên của bạn" 
//             placeholderTextColor="gray"
//             style={[styles.input, { fontSize: 15 }]} />
          
//           {errors.name && <Text style={styles.error}>{errors.name}</Text>}
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}> <Text style={{color: "red"}}>*</Text> Email </Text>
//           <TextInput 
//             value={email} 
//             onChangeText={setEmail} 
//             placeholder= "Nhập email của bạn" 
//             placeholderTextColor="gray"
//             style={[styles.input, { fontSize: 15 }]} />

//           {errors.email && <Text style={styles.error}>{errors.email}</Text>}
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}> <Text style={{color: "red"}}>*</Text> Số Điện Thoại </Text>
//           <TextInput 
//             value={phone} 
//             onChangeText={setPhone} 
//             placeholder= "Nhập số điện thoại" 
//             placeholderTextColor="gray"
//             style={[styles.input, { fontSize: 15 }]} />

//           {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}> Địa chỉ </Text>
//           <TextInput 
//             value={address} 
//             onChangeText={setAddress} 
//             placeholder= "Nhập địa chỉ" 
//             placeholderTextColor="gray"
//             style={[styles.input, { fontSize: 15 }]} />
//         </View>
  
//         <TouchableOpacity style={styles.button} onPress={handleSave}>
//           <Text style={{ color: "white", fontSize: 15 }}>Lưu</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
  
//   const styles = StyleSheet.create({
//     container: {
//       padding: 20,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
  
//     avatar: {
//       width: 100,
//       height: 100,
//       marginTop: 50,
//       borderRadius: 50,
//     },

//     positionAvt: {
//       textAlign: "center",
//       marginTop: 15,
//       fontSize: 18,
//     },

//     inputGroup: {
//       marginTop: 20,
//       width: "100%",
//     },

//     label: {
//       fontSize: 15,
//     },
  
//     input: {
//       width: "100%",
//       borderWidth: 1,
//       marginTop: 5,
//       padding: 10,
//       borderRadius: 8,
//     },
  
//     button: {
//       width: 65,
//       marginTop: 22,
//       backgroundColor: "#1E88E5",
//       padding: 15,
//       alignItems: "center",
//       borderRadius: 10,
//     },

//     error: {
//       color: "red",
//       fontSize: 15,
//       padding: 5,
//     },
//   });



const handleSave = async () => {
  if (!validate()) return;

  try {
    await updateUser({
      name,
      email,
      phone,
      address,
      avatar,
    });

    Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
  } catch (error) {
    Alert.alert(
      "Lỗi",
      error.response?.data?.message || "Không thể cập nhật hồ sơ"
    );
  }
};