const ERROR_CODE_MESSAGES = {
  1002: "Email này đã được sử dụng. Vui lòng dùng email khác.",
  1003: "Email chưa hợp lệ. Vui lòng kiểm tra lại.",
  1004: "Mật khẩu phải có ít nhất 6 ký tự.",
  1005: "Tài khoản không tồn tại.",
  1006: "Email hoặc mật khẩu không đúng.",
  1008: "Bạn chưa đủ tuổi để đăng ký tài khoản.",
  1010: "Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại.",
  1022: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
  1023: "Mật khẩu hiện tại không đúng.",
  1024: "Mật khẩu mới phải có ít nhất 6 ký tự.",
};

const ACTION_FALLBACK_MESSAGES = {
  login: "Không thể đăng nhập lúc này. Vui lòng thử lại sau.",
  register: "Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.",
  changePassword: "Không thể đổi mật khẩu lúc này. Vui lòng thử lại sau.",
  updateProfile: "Không thể cập nhật hồ sơ lúc này. Vui lòng thử lại sau.",
  default: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
};

function getNetworkMessage(error) {
  if (error?.code === "ECONNABORTED") {
    return "Kết nối tới máy chủ quá lâu. Vui lòng thử lại.";
  }

  if (error?.message === "Network Error") {
    return "Không thể kết nối tới máy chủ. Hãy kiểm tra mạng và địa chỉ API.";
  }

  return null;
}

export function getUserFriendlyErrorMessage(error, action = "default") {
  const networkMessage = getNetworkMessage(error);

  if (networkMessage) {
    return networkMessage;
  }

  const code = error?.response?.data?.code;
  if (code && ERROR_CODE_MESSAGES[code]) {
    return ERROR_CODE_MESSAGES[code];
  }

  const status = error?.response?.status;
  if (status === 401) {
    return "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
  }

  if (status === 403) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }

  if (status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.";
  }

  const backendMessage = error?.response?.data?.message;
  if (backendMessage && backendMessage !== "Uncategorized error") {
    return backendMessage;
  }

  return ACTION_FALLBACK_MESSAGES[action] ?? ACTION_FALLBACK_MESSAGES.default;
}
