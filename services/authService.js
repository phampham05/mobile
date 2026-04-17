import api from "./api";

const resolvePayload = (response) => response?.data?.result ?? response?.data ?? {};

export async function loginRequest({ email, password }) {
  const response = await api.post("/auth/token", {
    email: email.trim(),
    password,
  });

  return resolvePayload(response);
}

export async function registerRequest({ fullName, email, password, dob }) {
  const response = await api.post("/auth/register", {
    fullName: fullName.trim(),
    email: email.trim(),
    password,
    dob: dob || null,
  });

  return resolvePayload(response);
}

export async function fetchMyInfoRequest() {
  const response = await api.get("/users/my-info");
  return resolvePayload(response);
}

export async function logoutRequest(token) {
  const response = await api.post("/auth/logout", { token });
  return resolvePayload(response);
}

export async function changePasswordRequest(currentPassword, newPassword) {
  const response = await api.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });

  return resolvePayload(response);
}
