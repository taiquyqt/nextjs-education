// components/TourGuide.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const TOUR_SHOWN_KEY = "quiz_ai_tour_shown";

const tourSteps = [
  {
    id: 1,
    title: "Bước 1: Nhập thông tin đề thi",
    content: (
      <div className="space-y-2">
        <p>
          Hãy nhập tiêu đề, khối lớp, môn học và mô tả đề thi. Đây là thông tin
          giúp hệ thống AI hiểu rõ bối cảnh đề bài.
        </p>
        <Image
          src="/images/tour/step1.png"
          alt="Bước 1"
          width={600}
          height={300}
          className="rounded border"
        />
      </div>
    ),
  },
  {
    id: 2,
    title: "Bước 2: Tải tài liệu nguồn",
    content: (
      <div className="space-y-2">
        <p>
          Chọn tài liệu để AI trích xuất hoặc tạo câu hỏi. Nên dùng file
          PDF/DOCX chứa lý thuyết rõ ràng.
        </p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          <li>
            Dung lượng tối đa: <strong>5MB</strong>
          </li>
          <li>Không nên tải file scan ảnh (AI sẽ không hiểu)</li>
          <li>Ưu tiên nội dung gốc dạng text như: giáo trình, bài giảng</li>
        </ul>
        <Image
          src="/images/tour/step2.png"
          alt="Bước 2"
          width={600}
          height={300}
          className="rounded border"
        />
      </div>
    ),
  },
  {
    id: 3,
    title: "Bước 3: Cấu hình AI và sinh đề",
    content: (
      <div className="space-y-2">
        <p>
          Bạn có thể chọn chế độ <code>EXTRACT</code> để AI lấy câu hỏi sẵn có,
          hoặc <code>GENERATE</code> để AI tạo mới.
        </p>
        <p>
          Sau khi thiết lập xong, ấn nút <strong>{"Generate AI Quiz"}</strong>{" "}
          để bắt đầu.
        </p>
        <Image
          src="/images/tour/step3.png"
          alt="Bước 3"
          width={600}
          height={300}
          className="rounded border"
        />
      </div>
    ),
  },
];
export function TourGuide({
  openOverride = false,
  refs,
}: {
  openOverride?: boolean;
  refs: React.RefObject<HTMLElement>[];
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const stepRefs = {
    0: useRef<HTMLElement>(null), // Bước 1: Thông tin
    1: useRef<HTMLElement>(null), // Bước 2: Upload
    2: useRef<HTMLElement>(null), // Bước 3: Cấu hình AI
  };

  useEffect(() => {
    const hasShown = localStorage.getItem(TOUR_SHOWN_KEY);
    if (!hasShown || openOverride) {
      setOpen(true);
    }
  }, [openOverride]);

  useEffect(() => {
    const ref = refs[stepIndex];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current.classList.add("ring-2", "ring-green-500", "rounded-md");
      setTimeout(() => {
        ref.current?.classList.remove("ring-2", "ring-green-500");
      }, 4000);
    }
  }, [stepIndex]);

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setOpen(false);
      localStorage.setItem(TOUR_SHOWN_KEY, "true");
    }
  };

  const handleSkip = () => {
    setOpen(false);
    localStorage.setItem(TOUR_SHOWN_KEY, "true");
  };

  const step = tourSteps[stepIndex];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-green-700">{step.title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">{step.content}</div>

        <div className="mt-4 flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Bỏ qua
          </Button>
          <Button onClick={handleNext}>
            {stepIndex < tourSteps.length - 1 ? "Tiếp tục" : "Hoàn tất"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
