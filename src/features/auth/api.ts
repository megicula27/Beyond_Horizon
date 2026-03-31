import  apiClient  from "../../services/apiClient";
import { LoginRequest, LoginResponse } from "./types";

export async function loginApi(payload: LoginRequest) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}