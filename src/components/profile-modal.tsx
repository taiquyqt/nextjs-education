"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Eye, EyeOff } from "lucide-react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as profileService from "@/services/profileService";
import { toast } from "react-toastify";
import { UserProfileDto, ChangePasswordRequestDto } from "@/types/profile";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileDto;
  onUserUpdate?: (updatedUser: UserProfileDto) => void;
}

// Schema validation cho password
const passwordSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("Mật khẩu cũ là bắt buộc")
    .min(1, "Vui lòng nhập mật khẩu cũ"),
  newPassword: yup
    .string()
    .required("Mật khẩu mới là bắt buộc")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
    ),
  confirmPassword: yup
    .string()
    .required("Vui lòng nhập lại mật khẩu")
    .oneOf([yup.ref("newPassword")], "Mật khẩu nhập lại không khớp"),
});

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(
    user.avatarBase64 || ""
  );
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form khi modal đóng/mở
  useEffect(() => {
    if (isOpen) {
      setFullName(user.fullName || "");
      setPreviewImage(user.avatarBase64 || "");
      setShowPasswordForm(false);
      reset();
    }
  }, [isOpen, user]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordRequestDto & { confirmPassword: string }>({
    resolver: yupResolver(passwordSchema),
    mode: "onChange",
  });

  // Watch password fields để hiển thị form
  const watchedFields = watch([
    "oldPassword",
    "newPassword",
    "confirmPassword",
  ]);
  const hasPasswordInput = watchedFields.some(
    (field) => field && field.length > 0
  );

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Tên đầy đủ không được để trống");
      return;
    }
    setLoadingSave(true);
    try {
      const updatedUser = await profileService.updateProfile({
        fullName: fullName.trim(),
      });
      toast.success("Information updated successfully!");
      onUserUpdate?.(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setPreviewImage(updatedUser.avatarBase64 || "");
      reset();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.messages?.[0] ?? "Update failed";
      toast.error(errorMessage);
    } finally {
      setLoadingSave(false);
    }
  };
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Invalid file");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image too large (max 5MB)");
    }

    setPreviewImage(URL.createObjectURL(file));
    setLoadingUpload(true);

    try {
      const updatedUser = await profileService.uploadAvatar(file);
      onUserUpdate?.(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setPreviewImage(updatedUser.avatarBase64 || "");
      toast.success("Photo update successful!");
    } catch (error: any) {
      toast.error(error?.response?.data?.messages?.[0] || "Update failed");
      setPreviewImage("");
    } finally {
      setLoadingUpload(false);
    }
  };

  const onSubmitPassword = async (
    data: ChangePasswordRequestDto & { confirmPassword: string }
  ) => {
    setLoadingPassword(true);
    try {
      await profileService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully!");
      reset();
      setShowPasswordForm(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.messages?.[0] ?? "Password change failed";
      toast.error(errorMessage);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleClose = () => {
    reset();
    setShowPasswordForm(false);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:min-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Quản lý thông tin cá nhân
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Left Column: Avatar + Change Password */}
          <div className="space-y-3 md:col-span-1">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 ">
                  <AvatarImage
                    src={previewImage || user.avatarBase64 || ""}
                    alt={user.username}
                  />
                  <AvatarFallback className="text-2xl bg-green-100 text-green-600">
                    {user.fullName?.charAt(0).toUpperCase() ||
                      user.username?.charAt(0).toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Input file ẩn */}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleUploadPhoto}
                />

                {/* Button trigger input */}
                <Button
                  variant="outline"
                  className={`border-green-500 text-green-600 hover:bg-green-50 bg-transparent cursor-pointer${
                    loadingUpload ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loadingUpload}
                >
                  <Upload className="w-4 h-4 mr-2 " />
                  {loadingUpload ? "Đang tải lên..." : "Tải ảnh lên"}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Chỉ chấp nhận file JPG, PNG, WebP. Tối đa 5MB
                </p>
              </CardContent>
            </Card>
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex justify-between items-center">
                  Đổi mật khẩu
                  {!showPasswordForm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPasswordForm(true)}
                      className="text-green-600 hover:bg-green-50 cursor-pointer"
                    >
                      Thay đổi
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showPasswordForm ? (
                  <form
                    onSubmit={handleSubmit(onSubmitPassword)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">
                        Mật khẩu cũ <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="oldPassword"
                          type={showOldPassword ? "text" : "password"}
                          {...register("oldPassword")}
                          className="pr-10 focus:ring-green-500 focus:border-green-500"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                          {showOldPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.oldPassword && (
                        <p className="text-sm text-red-500">
                          {errors.oldPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">
                        Mật khẩu mới <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...register("newPassword")}
                          className="pr-10 focus:ring-green-500 focus:border-green-500"
                          placeholder="Nhập mật khẩu mới"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-sm text-red-500">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Xác nhận mật khẩu{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword")}
                          className="pr-10 focus:ring-green-500 focus:border-green-500 "
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className={`flex-1 bg-green-600 hover:bg-green-700 text-white  cursor-pointer${
                          loadingPassword ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loadingPassword}
                      >
                        {loadingPassword ? "Đang xử lý..." : "Cập nhật"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setShowPasswordForm(false);
                          reset();
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nhấn Thay đổi để cập nhật mật khẩu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Profile info */}
          <div className="md:col-span-2 h-full">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-green-600">
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">
                    Tên đăng nhập không thể thay đổi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ"
                    className="focus:ring-green-500 focus:border-green-500"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">
                    {fullName.length}/100 ký tự
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">
                    Email không thể thay đổi
                  </p>
                </div>
                {user.roles && user.roles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Vai trò</Label>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role: any, index: number) => {
                        const roleName =
                          typeof role === "string" ? role : role.name;
                        const key = typeof role === "string" ? index : role.id;
                        return (
                          <span
                            key={key}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                          >
                            {roleName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <Button
                    onClick={handleSaveProfile}
                    className={`flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer ${
                      loadingSave || !fullName.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={loadingSave || !fullName.trim()}
                  >
                    {loadingSave ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent cursor-pointer"
                    disabled={loadingSave || loadingPassword || loadingUpload}
                  >
                    Đóng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
