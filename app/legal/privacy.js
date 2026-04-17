import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Chính sách bảo mật</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>1. Dữ liệu được thu thập</Text>
        <Text style={styles.body}>
          Chúng tôi có thể lưu các thông tin bạn cung cấp như họ tên, email, số điện thoại và địa chỉ để phục vụ
          việc đăng nhập, quản lý tài khoản và xử lý đơn hàng.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>2. Mục đích sử dụng dữ liệu</Text>
        <Text style={styles.body}>
          Dữ liệu của bạn được sử dụng để xác thực tài khoản, cập nhật hồ sơ, hỗ trợ giao dịch và cải thiện trải
          nghiệm sử dụng ứng dụng.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>3. Bảo mật thông tin</Text>
        <Text style={styles.body}>
          Chúng tôi áp dụng các biện pháp kỹ thuật phù hợp để bảo vệ dữ liệu người dùng. Tuy nhiên, bạn cũng cần
          tự bảo vệ mật khẩu và thiết bị đăng nhập của mình.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>4. Quyền của người dùng</Text>
        <Text style={styles.body}>
          Bạn có thể yêu cầu cập nhật thông tin cá nhân trong phạm vi ứng dụng hỗ trợ. Nếu phát hiện thông tin
          chưa chính xác, vui lòng chỉnh sửa hồ sơ hoặc liên hệ quản trị viên.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FB",
  },
  content: {
    padding: 20,
    gap: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#171B23",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },
  heading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
  },
});
