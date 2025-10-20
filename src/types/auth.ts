export interface RegisterRequestDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleName: string;
}

export interface RegisterResponseDto {
  userId: number;
  username: string;
  email: string;
  accessToken: string;
}

export interface LoginRequestDto {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginResponseDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  avatarBase64?: string;
  roles: string[];
  accessToken: string;
  refreshToken?: string;
}

export interface GoogleLoginRequestDto {
  name: string;
  email: string;
  avatarBase64: string;
}

export interface GoogleLoginWithCredentialRequestDto {
  credential: string;
}

export interface SelectRoleRequest {
  userId: number;
  role: "student" | "teacher";
}
