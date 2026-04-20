import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Điều khoản sử dụng</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>1. Phạm vi sử dụng</Text>
        <Text style={styles.body}>
          BookStore cung cấp nền tảng để người dùng tìm kiếm, xem thông tin và mua sách. Khi sử dụng ứng dụng,
          bạn đồng ý dùng dịch vụ đúng mục đích và không thực hiện hành vi gây ảnh hưởng tới hệ thống hoặc người dùng khác.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>2. Tài khoản người dùng</Text>
        <Text style={styles.body}>
          Bạn chịu trách nhiệm về thông tin đã đăng ký và việc bảo mật tài khoản của mình. Không chia sẻ mật khẩu
          hoặc cho phép người khác sử dụng tài khoản mà không có sự cho phép của bạn.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>3. Nội dung và giao dịch</Text>
        <Text style={styles.body}>
          Thông tin sách, giá bán và tình trạng tồn kho có thể được cập nhật theo từng thời điểm. Chúng tôi có
          thể điều chỉnh thông tin hiển thị khi cần thiết để phản ánh đúng dữ liệu hiện hành.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>4. Hành vi không được phép</Text>
        <Text style={styles.body}>
          Không sử dụng ứng dụng cho các mục đích gian lận, tấn công hệ thống, thu thập trái phép dữ liệu hoặc
          gây gián đoạn dịch vụ.
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
