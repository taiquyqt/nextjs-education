"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { InputPassword } from "@/components/forms/InputPassword";

const schema = yup.object({
  fullName: yup.string().required("Họ và tên là bắt buộc"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .min(8, "Mật khẩu ít nhất 8 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
  role: yup.string().required("Vui lòng chọn vai trò"),
});

type FormData = yup.InferType<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const email = watch("email");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtp && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, showOtp]);

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Form data:", data); // Debug log

      await authService.registerInit({
        username: data.email,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        roleName: data.role,
      });

      setShowOtp(true);
      setCountdown(60);
      toast.success("OTP đã được gửi tới email của bạn!");
    } catch (error: any) {
      const data = error?.response?.data;

      const errorMessage =
        data?.messages?.[0] ||
        data?.error ||
        "An error occurred, please try again.";

      toast.error(errorMessage);
    }
  };

  const handleConfirmOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ mã OTP 6 chữ số");
      return;
    }

    setIsOtpSubmitting(true);
    try {
      await authService.confirmRegister({ email, otp });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/auth/login");
    } catch (error: any) {
      console.error("OTP confirmation error:", error);
      const errorMessage =
        error?.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn.";
      toast.error(errorMessage);
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email không hợp lệ");
      return;
    }

    setIsResending(true);
    try {
      await authService.resendOtp(email);
      setCountdown(60);
      toast.success("OTP mới đã được gửi!");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error?.response?.data?.message || "Không thể gửi lại OTP.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleRoleChange = (value: string) => {
    setValue("role", value, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={100}
            height={100}
            priority
            className="mx-auto mb-4 object-contain"
          />
          <CardTitle className="text-2xl text-center">
            Đăng ký tài khoản
          </CardTitle>
          <CardDescription className="text-center">
            Tạo tài khoản mới để sử dụng hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Nhập họ và tên"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Mật khẩu</Label>
                <InputPassword
                  id="password"
                  placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <InputPassword
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1">
                <Label>Vai trò</Label>
                <Select onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học sinh</SelectItem>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-5 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </form>
          ) : (
            /* OTP Section */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Xác thực OTP</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Mã OTP đã được gửi đến email: <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <Label>Nhập mã OTP</Label>
                <Input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép số
                    setOtp(value);
                  }}
                  placeholder="Nhập mã gồm 6 chữ số"
                  className="text-center text-lg tracking-wider"
                />
              </div>

              <Button
                type="button"
                onClick={handleConfirmOtp}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isOtpSubmitting || !otp || otp.length !== 6}
              >
                {isOtpSubmitting ? "Đang xác thực..." : "Xác nhận OTP"}
              </Button>

              <div className="text-sm text-center">
                {countdown > 0 ? (
                  <span className="text-muted-foreground">
                    Bạn có thể gửi lại OTP sau {countdown}s
                  </span>
                ) : (
                  <Button
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="p-0 h-auto"
                  >
                    {isResending ? "Đang gửi..." : "Gửi lại mã OTP"}
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setShowOtp(false);
                  setOtp("");
                  setCountdown(60);
                }}
                className="w-full"
              >
                Quay lại đăng ký
              </Button>
            </div>
          )}

          <div className="mt-4 text-center text-sm">
            Đã có tài khoản?{" "}
            <Link
              href="/auth/login"
              className="underline text-green-800 hover:text-green-900"
            >
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
