// components/QuizUploadGuide.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuizUploadGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-green-600 flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          Hướng dẫn upload file
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Hướng dẫn định dạng file Pdf
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Hệ thống chỉ chấp nhận file định dạng <strong>.pdf</strong>. Nội
            dung phải theo mẫu như sau:
          </p>

          <div className="bg-gray-100 p-4 rounded border">
            <Image
              src="/images/guide.png"
              alt="Ví dụ định dạng câu hỏi"
              width={430}
              height={300}
              className="rounded shadow"
            />
          </div>

          <p className="text-sm text-gray-700">
            File tải lên cần đúng định dạng để hệ thống có thể tự động trích
            xuất câu hỏi. Mỗi câu hỏi cần:
          </p>

          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>
              <strong>Bắt đầu bằng số thứ tự</strong> và dấu chấm, ví dụ:{" "}
              <code>1.</code>, <code>12.</code>,...
            </li>
            <li>
              <strong>Các đáp án</strong> bắt đầu bằng <code>A.</code>,{" "}
              <code>B.</code>, <code>C.</code>, <code>D.</code>
            </li>
            <li>
              <strong>Dòng cuối</strong> phải có: <code>Đáp án: A-D</code> (viết
              hoa, không dấu chấm)
            </li>
            <li>Không được để nhiều câu hỏi trong cùng một đoạn văn</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}