// services/auth.ts
import apiClient from "@/lib/axios";
import {
  RegisterRequestDto,
  RegisterResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  SelectRoleRequest,
} from "../types/auth";

const API_BASE = "/auth";

export const authService = {
  registerInit: async (data: RegisterRequestDto): Promise<void> => {
    await apiClient.post("/auth/register/init", data);
  },

  confirmRegister: async (data: { email: string; otp: string }): Promise<void> => {
    await apiClient.post("/auth/register/confirm", data);
  },

  resendOtp: async (email: string): Promise<void> => {
    await apiClient.post("/auth/otp/resend", { email });
  },
  register: async (data: RegisterRequestDto): Promise<RegisterResponseDto> => {
    const response = await apiClient.post<RegisterResponseDto>(
      `${API_BASE}/register`,
      data
    );
    return response.data;
  },
  requestForgotOtp: async (email: string): Promise<void> => {
    await apiClient.post("/auth/password/forgot/request-otp", { email });
  },

  verifyForgotOtp: async (data: { email: string; otp: string }): Promise<{ resetToken: string }> => {
    const res = await apiClient.post("/auth/password/forgot/verify-otp", data);
    return res.data;
  },

  resetPassword: async (data: { resetToken: string; newPassword: string; confirmPassword: string }): Promise<void> => {
    await apiClient.post("/auth/password/forgot/reset", data);
  },
  login: async (data: LoginRequestDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post<LoginResponseDto>(
      `${API_BASE}/login`,
      data
    );
    console.log("response.data", response.data);

    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post(`${API_BASE}/logout`);
    return response.data;
  },

  googleLoginWithCredential: async (credential?: string) => {
    const response = await apiClient.post(
      `${API_BASE}/google-login-with-credential`,
      {
        credential,
      }
    );
    return response.data;
  },

  selectRole: async (data: SelectRoleRequest): Promise<LoginResponseDto> => {
    const payload = {
      ...data,
      userId: Number(data.userId),
    };

    const response = await apiClient.post<LoginResponseDto>(
      `${API_BASE}/select-role`,
      payload
    );
    return response.data;
  },
};
