"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function GoogleLoginButton() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // đảm bảo chỉ render trên client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // Xóa toàn bộ dữ liệu cũ tránh giữ role từ lần login trước
      localStorage.clear();

      const res = await authService.googleLoginWithCredential(
        credentialResponse.credential
      );

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: res.userId,
          username: res.username,
          email: res.email,
          roles: res.roles || [],
        })
      );

      if (res.requireRoleSelection) {
        router.push("/select-role");
      } else {
        const role = res.roles?.[0];
        localStorage.setItem("role", role);
        router.push(`/dashboard/${role}`);
      }
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Đăng nhập Google thất bại!");
    }
  };

  const handleGoogleError = () => {
    console.log("Google login error");
    alert("Đăng nhập Google thất bại!");
  };

  if (!mounted) return null;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
