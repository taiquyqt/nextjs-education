"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  Trophy,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: BookOpen,
      title: "Quản lý Lớp học",
      description: "Tạo và quản lý lớp học một cách dễ dàng, theo dõi tiến độ học tập của từng học sinh",
      color: "blue-600",
      delay: "delay-300",
    },
    {
      icon: FileText,
      title: "Bài tập & Kiểm tra",
      description: "Tạo bài tập, trắc nghiệm trực tuyến và chấm điểm tự động, tiết kiệm thời gian",
      color: "green-600",
      delay: "delay-300",
    },
    {
      icon: Users,
      title: "Tương tác & Thảo luận",
      description: "Tạo không gian thảo luận, bình luận và hỗ trợ học tập giữa giáo viên và học sinh",
      color: "purple-600",
      delay: "delay-300",
    },
    {
      icon: Calendar,
      title: "Thời khóa biểu",
      description: "Quản lý lịch học, lịch thi và các hoạt động giáo dục một cách khoa học",
      color: "orange-600",
      delay: "delay-300",
    },
    {
      icon: GraduationCap,
      title: "Kết quả học tập",
      description: "Theo dõi điểm số, đánh giá tiến độ và phân tích kết quả học tập chi tiết",
      color: "red-600",
      delay: "delay-300",
    },
    {
      icon: Trophy,
      title: "Bảng xếp hạng",
      description: "Tạo động lực học tập thông qua hệ thống xếp hạng và thành tích",
      color: "yellow-600",
      delay: "delay-300",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-green-50 to-green-100/50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400/30 rounded-full animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          />
          <div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-400/40 rounded-full animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-green-500/35 rounded-full animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "5s" }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className={`inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: "3s" }} />
              Nền tảng học tập thông minh
            </div>

            <h1
              className={`text-3xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 text-balance transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Hệ thống Quản lý
              <span className="text-green-600 block bg-gradient-to-r from-green-600 to-green-500 bg-clip-text animate-pulse">
                Học tập Hiện đại
              </span>
            </h1>

            <p
              className={`text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-pretty transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              Kết nối giáo viên và học sinh trong một môi trường học tập tương tác, hiện đại và hiệu quả. Nâng cao chất
              lượng giáo dục với công nghệ tiên tiến.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto group hover:scale-105 transition-all duration-300 hover:shadow-lg bg-green-600 hover:bg-green-700"
                >
                  Đăng nhập ngay
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent hover:scale-105 transition-all duration-300 hover:shadow-lg hover:bg-blue-50"
                >
                  Tạo tài khoản mới
                </Button>
              </Link>
            </div>

            <div
              className={`flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600 transition-all duration-1000 delay-800 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="flex items-center gap-2 hover:text-green-600 transition-colors duration-300">
                <CheckCircle className="h-4 w-4 text-green-600 animate-pulse" />
                Miễn phí sử dụng
              </div>
              <div className="flex items-center gap-2 hover:text-green-600 transition-colors duration-300">
                <Star className="h-4 w-4 text-yellow-500 animate-pulse" style={{ animationDelay: "0.5s" }} />
                Đánh giá 4.9/5
              </div>
              <div className="flex items-center gap-2 hover:text-green-600 transition-colors duration-300">
                <Users className="h-4 w-4 text-blue-600 animate-pulse" style={{ animationDelay: "1s" }} />
                10,000+ người dùng
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">Tính năng nổi bật</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Khám phá những công cụ mạnh mẽ giúp nâng cao trải nghiệm học tập và giảng dạy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`group hover:shadow-xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-sm hover:bg-white hover:scale-105 hover:-translate-y-2 cursor-pointer ${isVisible ? `opacity-100 translate-y-0 ${feature.delay}` : "opacity-0 translate-y-8"}`}
              >
                <CardHeader className="space-y-4">
                  <div
                    className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center group-hover:bg-${feature.color}/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon
                      className={`h-6 w-6 text-${feature.color} group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2 group-hover:text-green-600 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
