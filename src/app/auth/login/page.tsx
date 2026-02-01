"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { InputPassword } from "@/components/forms/InputPassword";
import { authService } from "@/services/authService";
import { useAuth } from "../hook/useAuth";

// Định nghĩa schema cho từng step
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
});

const verifyOtpSchema = yup.object().shape({
  otp: yup
    .string()
    .required("Vui lòng nhập mã OTP")
    .matches(/^\d{6}$/, "Mã OTP phải có 6 chữ số"),
});

const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("newPassword")], "Mật khẩu xác nhận không khớp"),
});

// Định nghĩa các step và schema tương ứng
const stepConfig = {
  login: {
    title: "Đăng nhập",
    description: "Nhập thông tin để truy cập hệ thống",
    schema: loginSchema,
  },
  forgot: {
    title: "Quên mật khẩu",
    description: "Nhập email để nhận mã OTP",
    schema: forgotPasswordSchema,
  },
  verifyOtp: {
    title: "Xác minh OTP",
    description: "Nhập mã OTP được gửi về email",
    schema: verifyOtpSchema,
  },
  resetPassword: {
    title: "Đặt lại mật khẩu",
    description: "Tạo mật khẩu mới cho tài khoản",
    schema: resetPasswordSchema,
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, login, loading } = useAuth();
  const currentConfig = stepConfig[step];
  const form = useForm({
    resolver: yupResolver(currentConfig.schema),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = form;
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const timer = setTimeout(() => {
        const role = localStorage.getItem("role");
        if (role) {
          router.replace(`/dashboard/${role}`);
        } else {
          router.replace("/select-role");
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    reset();
  }, [step, reset]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  if (isAuthenticated) {
    return null;
  }
  const handleLogin = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      console.log("res", res);

      login(res.data);

      toast.success("Login successful!");

      if (res.roles && res.roles.length === 1) {
        const role = res.roles[0].toLowerCase();
        localStorage.setItem("role", role);
        router.push(`/dashboard/${role}`);
      } else {
        router.push("/select-role");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.messages?.[0] ||
        error?.response?.data?.error ||
        "Incorrect email or password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  // Xử lý gửi OTP
  const handleForgotPassword = async (data: any) => {
    setIsLoading(true);
    try {
      await authService.requestForgotOtp(data.email);
      setEmail(data.email);
      toast.success("Đã gửi mã OTP về email của bạn");
      setStep("verifyOtp");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể gửi OTP. Vui lòng kiểm tra lại email";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý xác thực OTP
  const handleVerifyOtp = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authService.verifyForgotOtp({
        email,
        otp: data.otp,
      });
      setResetToken(res.resetToken);
      toast.success("Xác thực OTP thành công");
      setStep("resetPassword");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.messages?.[0] ||
        error?.response?.data?.error ||
        error?.message ||
        "Mã OTP không đúng hoặc đã hết hạn";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: any) => {
    setIsLoading(true);
    try {
      await authService.resetPassword({
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Đặt lại mật khẩu thành công");

      // Reset tất cả state và quay về trang đăng nhập
      setEmail("");
      setResetToken("");
      setStep("login");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.messages?.[0] ?? "Đổi mật khẩu thất bại";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý submit form
  const onSubmit = async (data: any) => {
    switch (step) {
      case "login":
        await handleLogin(data);
        break;
      case "forgot":
        await handleForgotPassword(data);
        break;
      case "verifyOtp":
        await handleVerifyOtp(data);
        break;
      case "resetPassword":
        await handleResetPassword(data);
        break;
      default:
        break;
    }
  };
  const renderFormContent = () => {
    switch (step) {
      case "login":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <InputPassword
                id="password"
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep("forgot")}
                className="text-sm text-blue-600 hover:underline"
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>
            </div>
          </>
        );

      case "forgot":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email để nhận OTP"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message as string}
                </p>
              )}
            </div>
          </>
        );

      case "verifyOtp":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">Mã OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Nhập 6 chữ số OTP"
                maxLength={6}
                {...register("otp")}
              />
              {errors.otp && (
                <p className="text-sm text-red-500">
                  {errors.otp.message as string}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Mã OTP đã được gửi về email: <strong>{email}</strong>
              </p>
            </div>
          </>
        );

      case "resetPassword":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <InputPassword
                id="newPassword"
                placeholder="Nhập mật khẩu mới"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <InputPassword
                id="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Render action buttons
  const renderActionButtons = () => {
    return (
      <>
        <Button
          type="submit"
          className={`w-full py-5 ${
            step === "login" ? "bg-green-600 hover:bg-green-700" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : getSubmitButtonText()}
        </Button>

        {/* Back button cho các step không phải login */}
        {step !== "login" && (
          <button
            type="button"
            onClick={handleBackButton}
            className="w-full text-sm text-gray-600 hover:underline mt-2"
            disabled={isLoading}
          >
            {getBackButtonText()}
          </button>
        )}
      </>
    );
  };

  // Lấy text cho submit button
  const getSubmitButtonText = () => {
    switch (step) {
      case "login":
        return "Đăng nhập";
      case "forgot":
        return "Gửi OTP";
      case "verifyOtp":
        return "Xác nhận OTP";
      case "resetPassword":
        return "Đặt lại mật khẩu";
      default:
        return "Tiếp tục";
    }
  };

  // Lấy text cho back button
  const getBackButtonText = () => {
    switch (step) {
      case "forgot":
        return "← Quay lại đăng nhập";
      case "verifyOtp":
        return "← Thay đổi email";
      case "resetPassword":
        return "← Nhập lại OTP";
      default:
        return "← Quay lại";
    }
  };

  // Xử lý back button
  const handleBackButton = () => {
    switch (step) {
      case "forgot":
        setStep("login");
        break;
      case "verifyOtp":
        setStep("forgot");
        break;
      case "resetPassword":
        setStep("verifyOtp");
        break;
      default:
        setStep("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {currentConfig.title}
          </CardTitle>
          <CardDescription className="text-center">
            {currentConfig.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {renderFormContent()}
            {renderActionButtons()}
          </form>

          {/* Chỉ hiển thị phần đăng ký và Google login ở step login */}
          {step === "login" && (
            <>
              <div className="mt-4 text-center text-sm">
                Chưa có tài khoản?{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Đăng ký ngay
                </Link>
              </div>
            
              <div className="flex items-center gap-2 my-4">
                <div className="flex grow h-px bg-gray-300" />
                <span className="text-sm text-gray-500">hoặc</span>
                <div className="flex grow h-px bg-gray-300" />
              </div>

              <GoogleLoginButton />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
