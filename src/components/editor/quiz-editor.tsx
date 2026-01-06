"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuizzStorage } from "@/lib/store/useQuizzStorage";
import { Question } from "@/types/quiz.type";
import QuestionCard from "./question-card";

const QUESTIONS_PER_PAGE = 10;

export function QuizEditor() {
  const { data, setData } = useQuizzStorage();
  const items = data?.questions ?? [];

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentQuestions = items.slice(startIndex, endIndex);

  // 1. Logic tự động lùi về trang trước nếu xóa hết câu hỏi
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [items.length, currentPage, totalPages]);

  // 2. LOGIC MỚI: Tự động cuộn lên đầu khi trang thay đổi (Dùng useEffect)
  useEffect(() => {
    const topElement = document.getElementById("quiz-list-top");
    if (topElement) {
      // block: "start" -> Cuộn để phần tử nằm ở mép trên view
      // inline: "nearest" -> Giữ nguyên vị trí ngang
      topElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]); // Chỉ chạy khi currentPage thay đổi

  // Hàm chuyển trang (Chỉ cần set state, useEffect ở trên sẽ lo việc scroll)
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = items.filter((_, i) => i !== index);
    setData({ questions: updatedQuestions });
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = items.map((q, i) =>
      i === index ? updatedQuestion : q
    );
    setData({ questions: updatedQuestions });
  };

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Không có câu hỏi để hiển thị.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Neo để scroll: scroll-mt-28 để trừ hao khoảng cách header sticky (nếu có) */}
      <div id="quiz-list-top" className="scroll-mt-28" />

      {/* --- DANH SÁCH CÂU HỎI --- */}
      <div className="space-y-6">
        {currentQuestions.map((q, idx) => {
          const realIndex = startIndex + idx;

          return (
            <QuestionCard
              key={realIndex}
              index={realIndex}
              question={q}
              onUpdate={(updatedQuestion) =>
                updateQuestion(realIndex, updatedQuestion)
              }
              onDelete={() => deleteQuestion(realIndex)}
            />
          );
        })}
      </div>

      {/* --- PHÂN TRANG --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-28"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Trang Trước
          </Button>

          <span className="text-sm font-medium text-muted-foreground">
          {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-28"
          >
            Trang Sau <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}