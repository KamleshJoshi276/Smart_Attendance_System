export function setAuthData({ access_token, user }) {
  localStorage.setItem("smart_attendance_token", access_token);
  localStorage.setItem("smart_attendance_user", JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("smart_attendance_user"));
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("smart_attendance_token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("smart_attendance_token");
}

export function logout() {
  localStorage.removeItem("smart_attendance_token");
  localStorage.removeItem("smart_attendance_user");
}