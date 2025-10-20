"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Users,
  Calendar,
  Trophy,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  X,
  CircleUser,
} from "lucide-react";
import Image from "next/image";
import ProfileModal from "./profile-modal";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    else router.push("/auth/login");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const teacherNavItems = [
    { href: "/dashboard/teacher", label: "Trang chủ", icon: Home },
    { href: "/classes/teacher", label: "Quản lý lớp", icon: Users },
    { href: "/quizzes/teacher", label: "Trắc nghiệm", icon: BookOpen },
    { href: "/grades/teacher", label: "Xếp hạng", icon: Trophy },
  ];

  const studentNavItems = [
    { href: "/dashboard/student", label: "Trang chủ", icon: Home },
    { href: "/classes/student", label: "Lớp học", icon: Users },
    { href: "/quizzes/student", label: "Trắc nghiệm", icon: BookOpen },
    { href: "/grades/student", label: "Kết quả", icon: GraduationCap },
    { href: "/schedule/student", label: "Thời khóa biểu", icon: Calendar },
  ];

  const currentRole = user?.roles?.includes("teacher") ? "teacher" : "student";
  const navItems =
    currentRole === "teacher" ? teacherNavItems : studentNavItems;

  if (!user) return null;

  return (
    <>
      <nav className="bg-white shadow-sm border-b whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex-shrink-0 flex items-center"
              >
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  EduSystem
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "text-green-600 bg-blue-50"
                        : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage
                        src={user.avatarBase64 || undefined}
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex flex-col gap-1 p-2">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-green-600">
                      {currentRole === "teacher" ? "Giáo viên" : "Học sinh"}
                    </p>
                  </div>
                  <DropdownMenuItem
                    onClick={() => setIsProfileModalOpen(true)}
                    className="mt-1 cursor-pointer"
                  >
                    <CircleUser className="mr-2 h-4 w-4" />
                    View profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="mt-1 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4 " />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                className="md:hidden ml-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === item.href
                        ? "text-green-600 bg-green-100"
                        : "text-gray-700 hover:text-green-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </>
  );
}
