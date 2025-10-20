"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuizQuestionsPage } from "@/app/quizzes/hook/quiz-hooks";

export default function QuizQuestionsTest() {
  const params = useParams();
  const searchParams = useSearchParams();

  const quizId = Number(params.id);
  const pageParam = Number(searchParams.get("page")) || 1;
  const sizeParam = Number(searchParams.get("size")) || 10;

  const { data, isLoading, isError, error, isFetching } = useQuizQuestionsPage(
    quizId,
    pageParam,
    sizeParam
  );
  console.log("Quiz Questions Page Data:", data);

  if (!quizId) return <p>Chưa có quizId hợp lệ</p>;
  if (isLoading) return <p>Đang tải...</p>;
  if (isError) return <p>Lỗi: {(error as Error).message}</p>;

  return (
    <div>
      <h2>
        Trang {pageParam} {isFetching && "..."}
      </h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
