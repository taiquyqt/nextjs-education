// Kiểu dữ liệu mà backend trả về
export interface UserProfileApiResponse {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatarBase64?: string;
  roles: { id: number; name: string }[];
}

// Kiểu dữ liệu frontend dùng
export interface UserProfileDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarBase64?: string;
  roles: string[];
}

// Dùng cho PATCH /profile
export interface UpdateUserProfileRequestDto {
  fullName?: string;
  avatarBase64?: string;
}

// Dùng cho POST /profile/change-password
export interface ChangePasswordRequestDto {
  oldPassword: string;
  newPassword: string;
}

// Mapper: Backend -> Frontend
export function mapUserApiToDto(data: UserProfileApiResponse): UserProfileDto {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    fullName: data.full_name,
    avatarBase64: data.avatarBase64,
    roles: data.roles.map((r) => r.name),
  };
}
