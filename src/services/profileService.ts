import apiClient from "@/lib/axios";
import {
  UserProfileDto,
  UpdateUserProfileRequestDto,
  ChangePasswordRequestDto,
  UserProfileApiResponse,
  mapUserApiToDto,
} from "@/types/profile";

// Lấy profile
export async function fetchProfile(): Promise<UserProfileDto> {
  const res = await apiClient.get<UserProfileApiResponse>("/profile/me");
  return mapUserApiToDto(res.data);
}

// Update profile
export async function updateProfile(
  payload: UpdateUserProfileRequestDto
): Promise<UserProfileDto> {
  const res = await apiClient.patch<UserProfileApiResponse>(
    "/profile",
    payload
  );
  return mapUserApiToDto(res.data);
}

// Upload avatar
export async function uploadAvatar(file: File): Promise<UserProfileDto> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await apiClient.post<UserProfileApiResponse>("/profile/avatar", {
    avatarBase64: base64,
  });

  return mapUserApiToDto(res.data);
}

// Đổi mật khẩu
export async function changePassword(
  payload: ChangePasswordRequestDto
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(
    "/profile/change-password",
    payload
  );
  return res.data;
}
