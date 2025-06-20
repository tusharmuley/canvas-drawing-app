// src/services/auth.js
import api from "./api";

export async function login(username, password) {
  const { data } = await api.post("token/", { username, password });  // updated
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);  // save refresh too
  return data;
}

export async function signup(username, email, password) {
  await api.post("register/", { username, email, password });
  return login(username, password);
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

const auth = {
  login,
  signup,
  logout,
  saveToken: (t) => localStorage.setItem("access_token", t),
  getToken: () => localStorage.getItem("access_token"),
};

export default auth;
