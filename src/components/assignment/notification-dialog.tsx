"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import type { Notification } from "@/types/assignment"

interface NotificationDialogProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: number) => void
}

export function NotificationDialog({ notifications, onMarkAsRead }: NotificationDialogProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông báo</DialogTitle>
          <DialogDescription>Các phản hồi và cập nhật mới</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${notification.isRead ? "bg-gray-50" : "bg-blue-50 border-blue-200"}`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{notification.createdAt}</p>
              {!notification.isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 text-xs"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  Đánh dấu đã đọc
                </Button>
              )}
            </div>
          ))}
          {notifications.length === 0 && <p className="text-center text-gray-500 py-4">Không có thông báo mới</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
