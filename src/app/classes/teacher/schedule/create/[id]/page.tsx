"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Simple DialogFooter component if not available
const DialogFooter = ({ className, children }: any) => (
  <div className={cn("flex justify-end gap-2 mt-6 pt-4 border-t", className)}>
    {children}
  </div>
);

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Plus, X, Calendar as CalendarIcon, Eye } from "lucide-react";
import {
  createClassSchedule,
  getAllLocations,
} from "@/services/classScheduleService";
import { toast } from "react-toastify";
// import { toast } from "sonner";

// Utility function thay thế cho cn
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

// Format date function đơn giản
const formatDate = (date: Date) => {
  return date.toLocaleDateString("vi-VN");
};

// Generate sessions based on patterns
const generatePreviewSessions = (
  startDate: Date,
  endDate: Date,
  slots: SlotType[],
  locations: any[]
) => {
  const sessions: {
    date: Date;
    dayOfWeek: string;
    startPeriod: number;
    endPeriod: number;
    location: any;
    periods: string;
  }[] = [];
  const current = new Date(startDate);

  const dayMapping: { [key: string]: number } = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  while (current <= endDate) {
    const currentDayOfWeek = current.getDay();

    slots.forEach((slot) => {
      if (dayMapping[slot.dayOfWeek] === currentDayOfWeek) {
        const location = locations.find((loc) => loc.id === slot.locationId);
        sessions.push({
          date: new Date(current),
          dayOfWeek: slot.dayOfWeek,
          startPeriod: slot.startPeriod,
          endPeriod: slot.endPeriod,
          location: location?.roomName || "",
          periods: `Tiết ${slot.startPeriod} - ${slot.endPeriod}`,
        });
      }
    });

    current.setDate(current.getDate() + 1);
  }

  return sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Types
interface SlotType {
  dayOfWeek: string;
  startPeriod: number;
  endPeriod: number;
  locationId: number | null;
}

interface FormData {
  startDate: Date | null;
  endDate: Date | null;
  slots: SlotType[];
}

// Schema validation cho form
const schema: yup.ObjectSchema<FormData> = yup.object({
  startDate: yup
    .date()
    .nullable()
    .typeError("Vui lòng chọn ngày bắt đầu")
    .required("Vui lòng chọn ngày bắt đầu"),
  endDate: yup
    .date()
    .nullable()
    .typeError("Vui lòng chọn ngày kết thúc")
    .required("Vui lòng chọn ngày kết thúc")
    .test(
      "is-after-start",
      "Ngày kết thúc phải sau ngày bắt đầu",
      function (value) {
        const startDate = this.parent.startDate;
        if (startDate && value) {
          return value >= startDate;
        }
        return true;
      }
    ),
  slots: yup
    .array()
    .of(
      yup.object({
        dayOfWeek: yup.string().required("Vui lòng chọn ngày trong tuần"),
        startPeriod: yup
          .number()
          .typeError("Tiết bắt đầu phải là số")
          .required("Vui lòng nhập tiết bắt đầu")
          .min(1, "Tiết học không hợp lệ"),
        endPeriod: yup
          .number()
          .typeError("Tiết kết thúc phải là số")
          .required("Vui lòng nhập tiết kết thúc")
          .min(yup.ref("startPeriod"), "Tiết kết thúc phải sau tiết bắt đầu"),
        locationId: yup
          .number()
          .nullable()
          .typeError("Vui lòng chọn địa điểm")
          .required("Vui lòng chọn địa điểm"),
      })
    )
    .required("Vui lòng thêm ít nhất một buổi học")
    .default([]),
});

const dayOfWeekMapping: { [key: string]: string } = {
  MONDAY: "Thứ Hai",
  TUESDAY: "Thứ Ba",
  WEDNESDAY: "Thứ Tư",
  THURSDAY: "Thứ Năm",
  FRIDAY: "Thứ Sáu",
  SATURDAY: "Thứ Bảy",
  SUNDAY: "Chủ Nhật",
};

export default function ClassSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const [searchLocation, setSearchLocation] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSessions, setPreviewSessions] = useState<any[]>([]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      slots: [
        {
          dayOfWeek: "",
          startPeriod: 1,
          endPeriod: 2,
          locationId: null as number | null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "slots",
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const slots = watch("slots");

  useEffect(() => {
    // Tải danh sách địa điểm khi component mount
    getAllLocations()
      .then((data) => setLocations(data))
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách địa điểm:", err);
        toast.error(
          err?.response?.data?.messages?.[0] ??
            "Không thể tải danh sách địa điểm!"
        );
      });
  }, []);

  const handlePreview = () => {
    // Validate basic fields before preview
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }

    if (slots.some((slot) => !slot.dayOfWeek || !slot.locationId)) {
      toast.error("Vui lòng điền đầy đủ thông tin các buổi học");
      return;
    }

    const sessions = generatePreviewSessions(
      startDate,
      endDate,
      slots,
      locations
    );
    setPreviewSessions(sessions);
    setShowPreview(true);
  };

  // Track client-side hydration
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render date inputs until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-green-700">
                Tạo Lịch Học cho Lớp: {classId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Đang tải...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.startDate || !data.endDate) {
        toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
      }

      const payload = {
        classId: parseInt(classId),
        startDate: data.startDate.toISOString().split("T")[0],
        endDate: data.endDate.toISOString().split("T")[0],
        slots: data.slots.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startPeriod: slot.startPeriod,
          endPeriod: slot.endPeriod,
          locationId: slot.locationId!,
        })),
      };
      console.log("Payload gửi đi:", payload);
      await createClassSchedule(payload);
      toast.success("Tạo lịch học thành công!");
      router.push(`/classes/${classId}`);
    } catch (err: any) {
      console.error("Lỗi khi tạo lịch học:", err);
      toast.error(
        err.response.data?.messages?.[0] ||
          "Lớp này đã có lịch học, không thể tạo mới."
      );
      // Nếu backend trả message "Lớp này đã có lịch học" thì hiển thị cảnh báo
      // if (err.response?.status === 400 || err.response?.status === 409) {
      //   toast.error(
      //     err.response.data?.message ||
      //       "Lớp này đã có lịch học, không thể tạo mới."
      //   );
      // } else {
      //   toast.error("Có lỗi xảy ra khi tạo lịch học.");
      // }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700">
              Tạo Lịch Học cho Lớp: {classId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ngày bắt đầu */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setValue("startDate", dateValue);
                    }}
                    value={
                      startDate ? startDate.toISOString().split("T")[0] : ""
                    }
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                {/* Ngày kết thúc */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    type="date"
                    onChange={(e) => {
                      const dateValue = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setValue("endDate", dateValue);
                    }}
                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Các slot học */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Chi tiết các buổi học
                  </h3>
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        dayOfWeek: "",
                        startPeriod: 1,
                        endPeriod: 2,
                        locationId: null as number | null,
                      })
                    }
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm buổi
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end p-4 bg-gray-100 rounded-md relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {/* Ngày trong tuần */}
                    <div className="sm:col-span-1">
                      <Label>Ngày</Label>
                      <Select
                        value={watch(`slots.${index}.dayOfWeek`) || ""}
                        onValueChange={(val) =>
                          setValue(`slots.${index}.dayOfWeek`, val)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn ngày" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(dayOfWeekMapping).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      {errors.slots?.[index]?.dayOfWeek && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.slots[index]?.dayOfWeek?.message}
                        </p>
                      )}
                    </div>
                    {/* Tiết bắt đầu */}
                    <div className="sm:col-span-1">
                      <Label>Tiết bắt đầu</Label>
                      <Input
                        type="number"
                        {...register(`slots.${index}.startPeriod`)}
                      />
                      {errors.slots?.[index]?.startPeriod && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.slots[index]?.startPeriod?.message}
                        </p>
                      )}
                    </div>
                    {/* Tiết kết thúc */}
                    <div className="sm:col-span-1">
                      <Label>Tiết kết thúc</Label>
                      <Input
                        type="number"
                        {...register(`slots.${index}.endPeriod`)}
                      />
                      {errors.slots?.[index]?.endPeriod && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.slots[index]?.endPeriod?.message}
                        </p>
                      )}
                    </div>
                    {/* Địa điểm */}

<div className="sm:col-span-2">
  <Label>Địa điểm</Label>
  <Select
    value={watch(`slots.${index}.locationId`)?.toString() || ""}
    onValueChange={(val) => {
      const locationId = val ? Number(val) : null;
      setValue(`slots.${index}.locationId`, locationId);
    }}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Chọn phòng học" />
    </SelectTrigger>
    <SelectContent side="top" className="max-h-60">
      {/* Ô tìm kiếm */}
      <div className="p-2 sticky top-0 bg-white z-10 border-b">
        <Input
          placeholder="Tìm kiếm phòng học..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()} // không đóng Select khi gõ
          onClick={(e) => e.stopPropagation()}
          className="h-8"
        />
      </div>

      {/* Danh sách filter */}
      <div className="max-h-48 overflow-y-auto">
        {locations.filter((loc) =>
          loc.roomName.toLowerCase().includes(searchLocation.toLowerCase())
        ).length > 0 ? (
          locations
            .filter((loc) =>
              loc.roomName.toLowerCase().includes(searchLocation.toLowerCase())
            )
            .map((loc) => (
              <SelectItem key={loc.id} value={loc.id.toString()}>
                {loc.roomName}
              </SelectItem>
            ))
        ) : (
          <div className="px-3 py-6 text-center text-sm text-gray-500">
            Không tìm thấy phòng học
          </div>
        )}
      </div>
    </SelectContent>
  </Select>

  {errors.slots?.[index]?.locationId && (
    <p className="text-red-500 text-sm mt-1">
      {errors.slots[index]?.locationId?.message}
    </p>
  )}
</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handlePreview}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem thử lịch học
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-700 hover:bg-green-800"
                >
                  Lưu lịch học
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="!w-[1280px] !max-w-[1280px] max-h-[90vh] overflow-y-auto overflow-x-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-green-700">
                Xem thử lịch học - Lớp {classId}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Từ {startDate ? formatDate(startDate) : ""} đến{" "}
                {endDate ? formatDate(endDate) : ""}({previewSessions.length}{" "}
                buổi học)
              </div>

              {/* Timetable Grid */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="grid grid-cols-8 gap-0">
                  {/* Header */}
                  <div className="bg-green-100 p-3 text-center font-medium border-b border-gray-200">
                    Ngày/Tuần
                  </div>
                  {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                    <div
                      key={day}
                      className="bg-green-100 p-3 text-center font-medium border-b border-gray-200"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Generate weeks */}
                  {(() => {
                    if (!startDate || !endDate) return null;

                    const weeks = [];
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    let current = new Date(start);

                    // Start from beginning of week
                    current.setDate(current.getDate() - current.getDay());

                    while (current <= end) {
                      const weekStart = new Date(current);
                      const weekDates = [];

                      // Generate 7 days for this week
                      for (let i = 0; i < 7; i++) {
                        const date = new Date(current);
                        date.setDate(date.getDate() + i);
                        weekDates.push(date);
                      }

                      weeks.push(weekDates);
                      current.setDate(current.getDate() + 7);
                    }

                    return weeks.map((week, weekIndex) => (
                      <React.Fragment key={weekIndex}>
                        {/* Week number */}
                        <div className="bg-green-50 p-3 text-center text-sm font-medium border-b border-gray-200">
                          Tuần {weekIndex + 1}
                        </div>

                        {week.map((date, dayIndex) => {
                          const daySession = previewSessions.find(
                            (session) =>
                              session.date.toDateString() ===
                              date.toDateString()
                          );

                          const isInRange =
                            date >= startDate && date <= endDate;

                          return (
                            <div
                              key={dayIndex}
                              className={cn(
                                "p-2 border-b border-gray-200 min-h-[80px]",
                                isInRange ? "bg-white" : "bg-gray-50"
                              )}
                            >
                              <div className="text-xs text-gray-500 mb-1">
                                {date.getDate()}/{date.getMonth() + 1}
                              </div>

                              {daySession && (
                                <div className="bg-green-100 rounded p-2 text-xs">
                                  <div className="font-medium text-green-800">
                                    {daySession.periods}
                                  </div>
                                  <div className="text-green-700 mt-1">
                                    📍 {daySession.location}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ));
                  })()}
                </div>
              </div>

              {/* Sessions Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  Tóm tắt lịch học:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {previewSessions.slice(0, 9).map((session, index) => (
                    <div key={index} className="bg-white rounded p-3 border">
                      <div className="font-medium text-sm">
                        {session.date.toLocaleDateString("vi-VN")} -{" "}
                        {dayOfWeekMapping[session.dayOfWeek]}
                      </div>
                      <div className="text-green-600 text-sm">
                        {session.periods}
                      </div>
                      <div className="text-gray-600 text-xs">
                        📍 {session.location}
                      </div>
                    </div>
                  ))}
                  {previewSessions.length > 9 && (
                    <div className="bg-gray-100 rounded p-3 border flex items-center justify-center">
                      <span className="text-gray-600 text-sm">
                        +{previewSessions.length - 9} buổi khác...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  handleSubmit(onSubmit)();
                }}
                className="bg-green-700 hover:bg-green-800"
              >
                Xác nhận và lưu lịch học
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Add React import for Fragment
