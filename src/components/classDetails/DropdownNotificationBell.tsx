import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, X, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  approveJoinRequest,
  getJoinRequests,
  rejectJoinRequest,
} from "@/services/classService";
import { toast } from "react-toastify";

// Interface thông báo join request
export interface JoinRequestDTO {
  requestId: number;
  classId: number;
  studentName: string;
  className: string;
  studentId: number;
  status: string;
}

export default function TeacherNotificationBell({
  teacherId,
}: {
  teacherId: number;
}) {
  const [notifications, setNotifications] = useState<JoinRequestDTO[]>([]);

  useEffect(() => {
    if (!teacherId) return;

    getJoinRequests(teacherId, "PENDING")
      .then((data) => {
        setNotifications(data);
      })
      .catch((err) => {
        console.error("Lỗi lấy thông báo cũ:", err);
      });
  }, [teacherId]);

  // Hàm xử lý khi giáo viên chấp nhận hoặc từ chối yêu cầu
  const handleRequestAction = async (
    requestId: number,
    action: "accept" | "reject",
    reason?: string
  ) => {
    try {
      if (action === "accept") {
        await approveJoinRequest(requestId);
        toast.success("Đã chấp nhận yêu cầu tham gia lớp học!");
      } else if (action === "reject") {
        await rejectJoinRequest(requestId, reason);
        toast.info("Đã từ chối yêu cầu tham gia lớp học.");
      }
      setNotifications(
        notifications.filter((req) => req.requestId !== requestId)
      );
    } catch (error) {
      console.error(`Lỗi khi ${action} yêu cầu:`, error);
      toast.error(`Có lỗi xảy ra khi xử lý yêu cầu.`);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2 rounded-full hover:bg-gray-200">
            <Bell className="w-6 h-6 text-gray-600" />
            {notifications.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center p-0"
              >
                {notifications.length}
              </Badge>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-96 p-2 space-y-2">
          <DropdownMenuLabel className="font-bold text-lg text-green-700">
            Thông báo mới
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Chưa có yêu cầu mới.
            </div>
          ) : (
            notifications.map((n, index) => (
              <DropdownMenuItem
                key={index}
                className="flex items-start justify-between space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-start flex-1 space-x-2">
                  <Users className="w-5 h-5 text-green-700 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Yêu cầu tham gia lớp học
                    </p>
                    <p className="text-sm text-gray-600">
                      Sinh viên: {n.studentName}
                    </p>
                    <p className="text-sm text-gray-600">Lớp: {n.className}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2">
                  <button
                    onClick={() => handleRequestAction(n.requestId, "accept")}
                    className="p-1 rounded-full hover:bg-green-100 text-green-600"
                    title="Chấp nhận"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRequestAction(n.requestId, "reject")}
                    className="p-1 rounded-full hover:bg-red-100 text-red-600"
                    title="Từ chối"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <div className="text-center p-2">
            <Link
              href="/teacher-classes"
              className="text-sm text-green-700 font-medium hover:underline"
            >
              Đi đến trang quản lý lớp
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
