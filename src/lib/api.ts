import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
  withCredentials: true,
});

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = Bearer ;
  else delete api.defaults.headers.common["Authorization"];
}
