// components/tour/QuizTour.tsx
"use client";

import { PropsWithChildren, useEffect, useMemo } from "react";
import { TourProvider, useTour, StepType } from "@reactour/tour";
import { Button } from "@/components/ui/button";
import { Sparkles, UploadCloud, Settings2, Play } from "lucide-react";

type QuizTourProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

function GuidePanel({ title, children }: PropsWithChildren<{ title: string }>) {
  const { setIsOpen, currentStep, setCurrentStep, steps } = useTour();
  const isFirst = currentStep === 0;
  const isLast = currentStep === (steps?.length ?? 1) - 1;

  const next = () => setCurrentStep(currentStep + 1);
  const prev = () => setCurrentStep(Math.max(0, currentStep - 1));

  return (
    <div className="max-w-[320px] rounded-2xl border border-green-200 bg-white p-4 shadow-lg">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-green-700">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Bước {currentStep + 1}/{steps?.length ?? 1}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prev} disabled={isFirst}>
            Trước
          </Button>
          {!isLast ? (
            <Button
              size="sm"
              className="bg-green-500 text-white"
              onClick={next}
            >
              Tiếp
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-green-600 text-white"
              onClick={() => setIsOpen(false)}
            >
              Xong
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuizTour({
  open,
  onOpenChange,
  children,
}: PropsWithChildren<QuizTourProps>) {
  // Khai báo steps: nhắm đúng các data-attr bạn sẽ gắn ở HomePage (mục 3)
  const steps: StepType[] = useMemo(
    () => [
      {
        selector: '[data-tour="meta"]',
        content: (
          <GuidePanel title="Điền thông tin cơ bản">
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>
                Nhập <b>tiêu đề</b>, <b>khối</b>, <b>môn</b>.
              </li>
              <li>
                Chọn <b>ngày bắt đầu/kết thúc</b> và <b>thời gian</b>.
              </li>
              <li>
                Thêm <b>mô tả</b> để AI hiểu bối cảnh.
              </li>
            </ul>
          </GuidePanel>
        ),
      },
      {
        selector: '[data-tour="upload"]',
        content: (
          <GuidePanel title="Tải tài liệu nguồn">
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <UploadCloud className="h-4 w-4 text-green-600" />
                <span>Kéo thả hoặc bấm để chọn file.</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Định dạng: <b>PDF, DOCX, TXT, MD</b>.
                </li>
                <li>
                  Nên là <b>tài liệu rõ ràng</b>, có tiêu đề & mục lục càng tốt.
                </li>
                <li>Mẹo: 1 file ≈ 5–20 trang là tối ưu cho tốc độ.</li>
              </ul>
            </div>
          </GuidePanel>
        ),
      },
      {
        selector: '[data-tour="prompt"]',
        content: (
          <GuidePanel title="Chọn preset cho AI">
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>
                Bấm chọn <b>Preset</b> để có cấu hình mẫu.
              </li>
              <li>
                Có thể tùy chỉnh <b>số câu</b>, <b>độ khó</b>, <b>định dạng</b>…
              </li>
            </ul>
          </GuidePanel>
        ),
        action: () => {
          const openTrigger = document.querySelector(
            '[data-tour="preset-trigger"]'
          ) as HTMLElement | null;
          openTrigger?.click();
          setTimeout(() => {
            const demoItem = document.querySelector(
              '[data-tour="preset-item-demo"]'
            ) as HTMLElement | null;
            demoItem?.click();
          }, 300);
        },
      },
      {
        selector: '[data-tour="generate"]',
        content: (
          <GuidePanel title="Sinh câu hỏi!">
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Play className="h-4 w-4 text-green-600" />
                <span>
                  Bấm <b>Generate</b> để bắt đầu.
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Nếu tài liệu đã có câu hỏi sẵn, chọn chế độ <code>EXTRACT</code>
                . Còn muốn AI tự tạo, chọn <code>GENERATE</code>.
              </p>
            </div>
          </GuidePanel>
        ),
      },
    ],
    []
  );

  return (
    <TourProvider
      steps={steps}
      // Spotlight & cảm giác hiện đại
      padding={12}
      spotlightPadding={8}
      scrollSmooth
      disableInteraction={false}
      onClickMask={({ setIsOpen }) => setIsOpen(false)}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: 16,
          boxShadow:
            "0 10px 24px rgba(16,185,129,0.15), 0 6px 12px rgba(0,0,0,0.06)",
          border: "1px solid rgba(16,185,129,0.25)",
        }),
        maskArea: (base) => ({
          ...base,
          rx: 12,
        }),
        maskWrapper: (base) => ({
          ...base,
          backgroundColor: "rgba(0,0,0,0.35)",
        }),
      }}
    >
      <TourOpenSync open={open} onOpenChange={onOpenChange} />
      {children}
    </TourProvider>
  );
}

function TourOpenSync({ open, onOpenChange }: QuizTourProps) {
  const { isOpen, setIsOpen } = useTour();
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);
  useEffect(() => {
    if (isOpen !== open) onOpenChange(isOpen);
  }, [isOpen]); // eslint-disable-line
  return null;
}
