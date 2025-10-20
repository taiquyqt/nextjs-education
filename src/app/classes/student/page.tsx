"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye } from "lucide-react";
import Link from "next/link";
import {
  getStudentClasses,
  getClasses,
  createJoinRequest,
  getClassById,
  searchClasses,      
  getLatestClasses,
} from "@/services/classService";
import StudentNotificationToast from "@/components/classDetails/StudentNotificationToast";
import { toast } from "react-toastify";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function StudentClassesPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState("");

  const [activeTab, setActiveTab] = useState<"code" | "search">("code");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      console.log("parsedUser :", parsedUser);

      getStudentClasses(parsedUser.userId, currentPage, pageSize)
        .then((res) => {
          setClasses(Array.isArray(res.data) ? res.data : res.data || []);
          setTotalPages(res.totalPages || 1);
          console.log("res", res);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy lớp học:", error);
          toast.error(
            error?.response?.data?.messages?.[0] ??
              "Không thể tải danh sách lớp học!"
          );
        });
    }
  }, [currentPage, pageSize]);

  // Load lớp gợi ý khi mở tab tìm kiếm lần đầu
  useEffect(() => {
    if (activeTab === "search" && searchResults.length === 0 && !searchTerm) {
      getLatestClasses().then((data) => {
        setSearchResults(Array.isArray(data) ? data : data || []);
      });
    }
  }, [activeTab]);

  const handleJoinClass = async () => {
    if (!joinCode) {
      toast.warn("Vui lòng nhập mã lớp");
      return;
    }

    const classId = Number(joinCode);
    if (isNaN(classId)) {
      toast.error("Mã lớp không hợp lệ. Mã lớp phải là số!");
      return;
    }
    try {
      // Lấy thông tin chi tiết lớp học trước
      const classInfo = await getClassById(Number(joinCode));
      console.log("classInfo", classInfo);

      // Gửi yêu cầu tham gia lớp
      await createJoinRequest(Number(joinCode), user.userId);

      // Hiển thị thông báo tùy theo join_mode
      if (classInfo?.joinMode === "AUTO") {
        toast.success("Bạn đã tham gia lớp thành công!");
      } else if (classInfo?.joinMode === "APPROVAL") {
        toast.info(
          "Yêu cầu tham gia lớp đã được gửi, vui lòng đợi giáo viên xác nhận."
        );
      } else {
        // Fallback message nếu không có thông tin join_mode
        toast.info(
          "Yêu cầu tham gia lớp đã được gửi, vui lòng đợi giáo viên xác nhận."
        );
      }

      setJoinCode("");
    } catch (err: any) {
      console.error("Lỗi khi gửi yêu cầu tham gia lớp:", err);
      toast.error(
        err?.response?.data?.messages?.[0] ??
          "Không thể gửi yêu cầu tham gia lớp"
      );
    }
  };

  const handleJoinFromSearch = async (classId: number) => {
    try {
      const classInfo = await getClassById(Number(classId));
      await createJoinRequest(classId, user.userId);

      // Hiển thị thông báo tùy theo join_mode
      if (classInfo?.joinMode === "AUTO") {
        toast.success("Bạn đã tham gia lớp thành công!");
      } else if (classInfo?.joinMode === "APPROVAL") {
        toast.info(
          "Yêu cầu tham gia lớp đã được gửi, vui lòng đợi giáo viên xác nhận."
        );
      } else {
        // Fallback message nếu không có thông tin join_mode
        toast.info(
          "Yêu cầu tham gia lớp đã được gửi, vui lòng đợi giáo viên xác nhận."
        );
      }
    } catch (err: any) {
      console.error("Lỗi khi gửi yêu cầu tham gia lớp:", err);
      toast.error(
        err?.response?.data?.messages?.[0] ??
          "Không thể gửi yêu cầu tham gia lớp"
      );
    }
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {

      if (searchTerm.trim() === "") {
        // Nếu không nhập gì thì load lại 10 lớp gần nhất
        const latest = await getLatestClasses();
        setSearchResults(latest);
      } else {
        const results = await searchClasses(searchTerm);
        setSearchResults(results);
        console.log("lớp tìm kiếm: ", searchResults, "searchTerm: " ,searchTerm)
      }
    } catch (err: any) {
      console.error("Lỗi tìm kiếm lớp:", err);
      toast.error(
        err?.response?.data?.messages?.[0] ?? "Không thể tìm kiếm lớp!"
      );
    }
    setLoadingSearch(false);
  };

  if (!user) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto p-6 h-96 flex justify-center items-center">
          <DotLottieReact
            src="/animations/loading.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header + nút tham gia */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700">
                Lớp học của tôi
              </h1>
              <p className="text-gray-600">Các lớp học bạn đã tham gia</p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-700 hover:bg-green-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Tham gia lớp
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-green-700">
                    Tham gia lớp học
                  </DialogTitle>
                  <DialogDescription>Chọn cách tham gia</DialogDescription>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={activeTab === "code" ? "default" : "outline"}
                    onClick={() => setActiveTab("code")}
                    className={
                      activeTab === "code"
                        ? "bg-green-700 hover:bg-green-800"
                        : "border-green-700 text-green-700 hover:bg-green-100"
                    }
                  >
                    Nhập mã lớp
                  </Button>
                  <Button
                    variant={activeTab === "search" ? "default" : "outline"}
                    onClick={() => setActiveTab("search")}
                    className={
                      activeTab === "search"
                        ? "bg-green-700 hover:bg-green-800"
                        : "border-green-700 text-green-700 hover:bg-green-100"
                    }
                  >
                    Tìm kiếm lớp
                  </Button>
                </div>

                {/* Tab nhập mã */}
                {activeTab === "code" && (
                  <div className="space-y-4">
                    <Label htmlFor="joinCode">Mã lớp</Label>
                    <Input
                      id="joinCode"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Nhập mã lớp (VD: 123456)"
                    />
                    <Button
                      onClick={handleJoinClass}
                      className="w-full bg-green-700 hover:bg-green-800"
                    >
                      Tham gia
                    </Button>
                  </div>
                )}

                {/* Tab tìm kiếm */}
                {activeTab === "search" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên lớp hoặc giảng viên"
                      />
                      <Button
                        onClick={handleSearch}
                        disabled={loadingSearch}
                        className="bg-green-700 hover:bg-green-800"
                      >
                        {loadingSearch ? "Đang tìm..." : "Tìm"}
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {searchResults.length === 0 && <p>Không có lớp nào.</p>}
                      {searchResults.map((item) => (
                        <Card key={item.id} className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-green-700">
                                {item.className}
                              </p>
                              <p className="text-sm text-gray-600">
                                GV: {item.teacher?.fullName || "Chưa rõ"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleJoinFromSearch(item.id)}
                              className="ml-4 shrink-0 bg-green-700 hover:bg-green-800"
                            >
                              Tham gia
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Danh sách lớp */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">
                    {classItem.className}
                  </CardTitle>
                  <CardDescription>
                    Giáo viên: {classItem.teacher?.fullName || "Chưa rõ"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Năm học:</span>
                      <span>{classItem.schoolYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Học kỳ:</span>
                      <span>{classItem.semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Môn học:</span>
                      <span>{classItem.subject?.name}</span>
                    </div>
                    <Link href={`/classes/${classItem.id}`}>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-green-700 hover:bg-green-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Vào lớp học
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i).map((num) => (
                <Button
                  key={num}
                  variant={num === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(num)}
                  className={
                    num === currentPage
                      ? "bg-green-700 hover:bg-green-800"
                      : "border-green-700 text-green-700 hover:bg-green-100"
                  }
                >
                  {num}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
