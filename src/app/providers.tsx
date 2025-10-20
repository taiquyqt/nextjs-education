"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { TourProvider } from "@reactour/tour";
import { steps } from "./quizzes/components/steps";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// === lỗi chuẩn hoá ===
type ApiError = {
  status?: number;
  code?: string;
  message: string;
  retryable?: boolean;
  details?: unknown;
};
function normalizeError(e: unknown): ApiError {
  const any = e as any;
  if (any?.isAxiosError) {
    const status = any.response?.status;
    const data = any.response?.data;
    return {
      status,
      code: data?.code ?? String(status ?? "ERROR"),
      message: data?.message ?? any.message ?? "Đã xảy ra lỗi không xác định.",
      details: data,
      retryable: status ? status >= 500 || status === 429 : true,
    };
  }
  if (any?.status || any?.code || any?.message) {
    return {
      status: any.status,
      code: any.code,
      message: any.message ?? "Có lỗi xảy ra.",
      details: any.details,
      retryable: any.status ? any.status >= 500 || any.status === 429 : true,
    };
  }
  return { message: "Có lỗi xảy ra.", retryable: true };
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (e, _query) => {
            const err = normalizeError(e);
            // Chỉ dùng toast cho lỗi "nền" (refetch / prefetch / background)
            toast.error(err.message, { autoClose: 3000 });
          },
        }),
        mutationCache: new MutationCache({
          onError: (e, _variables, _context, _mutation) => {
            const err = normalizeError(e);
            toast.error(err.message, { autoClose: 3000 });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // retry thông minh: chỉ retry 5xx/429
              const err = normalizeError(error);
              const should = err.status
                ? err.status >= 500 || err.status === 429
                : failureCount < 1;
              return should && failureCount < 1;
            },
            // onError ở đây vẫn hữu ích khi bạn muốn override theo từng query
            onError: (e) => {
              // Lưu ý: lỗi lần fetch đầu tiên (blocking UI) bạn nên hiển thị bằng ErrorView trong component
              // Còn đây là "phao phụ" nếu quên bọc DataState
              const err = normalizeError(e);
              toast.error(err.message, { autoClose: 3000 });
            },
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {/* Toast toàn cục */}
      <ToastContainer position="top-right" newestOnTop />

      {/* Hướng dẫn (Tour) */}
      <TourProvider
        steps={steps}
        showBadge={false}
        showCloseButton
        showNavigation
        showDots
        disableDotsNavigation={false}
        className="eduquiz-tour"
        styles={{
          popover: (base) => ({
            ...base,
            "--reactour-accent": "#10b981",
            borderRadius: "16px",
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.1)",
            maxWidth: "420px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "2px solid #10b981",
          }),
          maskArea: (base) => ({ ...base, rx: 12 }),
          badge: (base) => ({
            ...base,
            left: "auto",
            right: "-0.8125em",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          }),
        }}
        padding={{ mask: [15, 15, 15, 15], popover: [15, 15, 15, 15] }}
        onClickMask={({ setCurrentStep, currentStep, steps, setIsOpen }) => {
          if (steps) {
            if (currentStep === steps.length - 1) setIsOpen(false);
            setCurrentStep((s) => (s === steps.length - 1 ? 0 : s + 1));
          }
        }}
      >
        {children}
      </TourProvider>

      {/* Devtools (bật khi cần) */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
