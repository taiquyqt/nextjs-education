"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, BookOpen, AlertCircle } from "lucide-react"

export default function SchedulePage() {
  const [user, setUser] = useState<any>(null)
  const [currentWeek, setCurrentWeek] = useState(0)

  const [schedule] = useState([
    {
      day: "Thứ 2",
      date: "22/01/2024",
      classes: [
        {
          id: 1,
          subject: "Toán học",
          teacher: "Cô Nguyễn Thị Lan",
          time: "07:30 - 09:00",
          room: "Phòng 201",
          type: "lesson",
          status: "completed",
        },
        {
          id: 2,
          subject: "Vật lý",
          teacher: "Thầy Trần Văn Nam",
          time: "09:15 - 10:45",
          room: "Phòng 105",
          type: "lesson",
          status: "completed",
        },
        {
          id: 3,
          subject: "Hóa học",
          teacher: "Cô Lê Thị Hoa",
          time: "14:00 - 15:30",
          room: "Phòng Lab 1",
          type: "lab",
          status: "completed",
        },
      ],
    },
    {
      day: "Thứ 3",
      date: "23/01/2024",
      classes: [
        {
          id: 4,
          subject: "Ngữ văn",
          teacher: "Cô Phạm Thị Mai",
          time: "07:30 - 09:00",
          room: "Phòng 302",
          type: "lesson",
          status: "upcoming",
        },
        {
          id: 5,
          subject: "Toán học",
          teacher: "Cô Nguyễn Thị Lan",
          time: "09:15 - 10:45",
          room: "Phòng 201",
          type: "exam",
          status: "upcoming",
        },
        {
          id: 6,
          subject: "Tiếng Anh",
          teacher: "Thầy John Smith",
          time: "14:00 - 15:30",
          room: "Phòng 205",
          type: "lesson",
          status: "upcoming",
        },
      ],
    },
    {
      day: "Thứ 4",
      date: "24/01/2024",
      classes: [
        {
          id: 7,
          subject: "Lịch sử",
          teacher: "Thầy Hoàng Văn Đức",
          time: "07:30 - 09:00",
          room: "Phòng 103",
          type: "lesson",
          status: "upcoming",
        },
        {
          id: 8,
          subject: "Địa lý",
          teacher: "Cô Nguyễn Thị Bình",
          time: "09:15 - 10:45",
          room: "Phòng 104",
          type: "lesson",
          status: "upcoming",
        },
        {
          id: 9,
          subject: "Sinh học",
          teacher: "Thầy Lê Văn Cường",
          time: "14:00 - 15:30",
          room: "Phòng Lab 2",
          type: "lab",
          status: "upcoming",
        },
      ],
    },
    {
      day: "Thứ 5",
      date: "25/01/2024",
      classes: [
        {
          id: 10,
          subject: "Toán học",
          teacher: "Cô Nguyễn Thị Lan",
          time: "07:30 - 09:00",
          room: "Phòng 201",
          type: "lesson",
          status: "upcoming",
        },
        {
          id: 11,
          subject: "Vật lý",
          teacher: "Thầy Trần Văn Nam",
          time: "09:15 - 10:45",
          room: "Phòng 105",
          type: "exam",
          status: "upcoming",
        },
        {
          id: 12,
          subject: "Thể dục",
          teacher: "Thầy Nguyễn Văn Mạnh",
          time: "14:00 - 15:30",
          room: "Sân thể thao",
          type: "activity",
          status: "upcoming",
        },
      ],
    },
    {
      day: "Thứ 6",
      date: "26/01/2024",
      classes: [
        {
          id: 13,
          subject: "Ngữ văn",
          teacher: "Cô Phạm Thị Mai",
          time: "07:30 - 09:00",
          room: "Phòng 302",
          type: "lesson",
          status: "upcoming",
        },
        {
          id: 14,
          subject: "Hóa học",
          teacher: "Cô Lê Thị Hoa",
          time: "09:15 - 10:45",
          room: "Phòng 301",
          type: "lesson",
          status: "upcoming",
        },
        {
          id: 15,
          subject: "Tiếng Anh",
          teacher: "Thầy John Smith",
          time: "14:00 - 15:30",
          room: "Phòng 205",
          type: "exam",
          status: "upcoming",
        },
      ],
    },
    {
      day: "Thứ 7",
      date: "27/01/2024",
      classes: [
        {
          id: 16,
          subject: "Sinh hoạt lớp",
          teacher: "Cô Nguyễn Thị Lan",
          time: "07:30 - 08:15",
          room: "Phòng 201",
          type: "activity",
          status: "upcoming",
        },
        {
          id: 17,
          subject: "Hoạt động ngoại khóa",
          teacher: "Các thầy cô",
          time: "08:30 - 11:30",
          room: "Sân trường",
          type: "activity",
          status: "upcoming",
        },
      ],
    },
  ])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Đã học</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500">Sắp tới</Badge>
      case "cancelled":
        return <Badge variant="destructive">Hủy</Badge>
      default:
        return <Badge variant="secondary">Chưa xác định</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "lesson":
        return <Badge variant="outline">Học lý thuyết</Badge>
      case "lab":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-700">
            Thí nghiệm
          </Badge>
        )
      case "exam":
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            Kiểm tra
          </Badge>
        )
      case "activity":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Hoạt động
          </Badge>
        )
      default:
        return <Badge variant="outline">Khác</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-4 w-4" />
      case "lab":
        return <AlertCircle className="h-4 w-4" />
      case "exam":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "activity":
        return <User className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getCurrentWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) // Adjust for Sunday
    const monday = new Date(today.setDate(diff))
    monday.setDate(monday.getDate() + currentWeek * 7)

    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const weekDates = getCurrentWeekDates()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thời khóa biểu</h1>
              <p className="text-gray-600">Lịch học và hoạt động trong tuần</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentWeek(currentWeek - 1)} disabled={currentWeek <= -4}>
                Tuần trước
              </Button>
              <Button variant="outline" onClick={() => setCurrentWeek(0)} disabled={currentWeek === 0}>
                Tuần này
              </Button>
              <Button variant="outline" onClick={() => setCurrentWeek(currentWeek + 1)} disabled={currentWeek >= 4}>
                Tuần sau
              </Button>
            </div>
          </div>
        </div>

        {/* Week Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tuần từ {weekDates[0].toLocaleDateString("vi-VN")} đến {weekDates[6].toLocaleDateString("vi-VN")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {schedule.reduce((total, day) => total + day.classes.length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Tổng tiết học</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {schedule.reduce((total, day) => total + day.classes.filter((c) => c.type === "lesson").length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Tiết lý thuyết</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {schedule.reduce((total, day) => total + day.classes.filter((c) => c.type === "lab").length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Tiết thí nghiệm</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {schedule.reduce((total, day) => total + day.classes.filter((c) => c.type === "exam").length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Tiết kiểm tra</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <div className="space-y-6">
          {schedule.map((day, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {day.day} - {day.date}
                  </span>
                  <Badge variant="outline">{day.classes.length} tiết</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {day.classes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Không có lịch học</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {day.classes.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">{getTypeIcon(classItem.type)}</div>
                          <div>
                            <h4 className="font-semibold text-lg">{classItem.subject}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {classItem.teacher}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {classItem.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {classItem.room}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(classItem.type)}
                          {getStatusBadge(classItem.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Events */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Sự kiện quan trọng sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">Kiểm tra Toán học 1 tiết</p>
                  <p className="text-sm text-muted-foreground">Thứ 3, 23/01/2024 • 09:15 - 10:45</p>
                </div>
                <Badge variant="destructive">Kiểm tra</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">Kiểm tra Vật lý 1 tiết</p>
                  <p className="text-sm text-muted-foreground">Thứ 5, 25/01/2024 • 09:15 - 10:45</p>
                </div>
                <Badge variant="destructive">Kiểm tra</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">Kiểm tra Tiếng Anh</p>
                  <p className="text-sm text-muted-foreground">Thứ 6, 26/01/2024 • 14:00 - 15:30</p>
                </div>
                <Badge variant="destructive">Kiểm tra</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
