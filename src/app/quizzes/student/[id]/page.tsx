"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ArrowLeft, ArrowRight, Send } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/navigation";
import { QuizResultDialog } from "../components/quiz-result-dialog";
import { useQuiz } from "../../hook/quiz-hooks";
import { QueryError } from "../../components/QueryError";
import Swal from "sweetalert2";

interface QuizResultData {
  studentName: string;
  className: string;
  subject: string;
  duration: string;
  startTime: string;
  endTime: string;
  score: number;
  totalQuestions: number;
  title: string;
}

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: quiz, isLoading, error, refetch, isFetching } = useQuiz(id);
  const [quizAnswers, setQuizAnswers] = useState<
    Record<number, string | string[]>
  >({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmited, setIsSubmited] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  // 2) Sửa chỗ tính currentQuestions để an toàn khi quiz chưa sẵn
  const QUESTIONS_PER_PAGE = 5;
  const currentQuestions =
    quiz?.questions?.slice(
      currentPage * QUESTIONS_PER_PAGE,
      (currentPage + 1) * QUESTIONS_PER_PAGE
    ) ?? [];

  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo timer khi có quiz data
  useEffect(() => {
    if (quiz && quiz.timeLimit && !startTime) {
      const now = new Date();
      setStartTime(now);
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz, startTime]);

  // Timer logic
  useEffect(() => {
    if (isSubmited || isSubmitting || timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (timeLeft <= 0 && !isSubmited && !isSubmitting && startTime) {
        handleSubmit();
      }

      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft, isSubmitting, isSubmited, startTime]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (
    questionId: number,
    answer: string | string[]
  ) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateProgress = () => {
    if (!quiz || !quiz.questions?.length) return 0;
    if (!quizAnswers) return 0;

    const answeredCount = Object.values(quizAnswers).filter(
      (answer) =>
        (Array.isArray(answer) && answer.length > 0) ||
        (!Array.isArray(answer) && answer !== "")
    ).length;

    return (answeredCount / quiz.questions.length) * 100;
  };

  const handleSubmit = useCallback(async () => {
    if (!startTime || isSubmitting || isSubmited) return;
    if (!quiz || !quiz.questions?.length) return;

    setIsSubmitting(true);

    try {
      const answersPayload: Record<number, string[]> = {};
      for (const q of quiz.questions) {
        const answer = quizAnswers[q.id];
        if (Array.isArray(answer)) {
          answersPayload[q.id] = answer;
        } else if (typeof answer === "string" && answer) {
          answersPayload[q.id] = [answer];
        } else {
          answersPayload[q.id] = [];
        }
      }

      const unanswered = Object.values(answersPayload).filter(
        (v) => v.length === 0
      ).length;
      if (unanswered > 0) {
        const result = await Swal.fire({
          title: `Bạn còn ${unanswered} câu chưa làm.`,
          text: "Bạn vẫn muốn nộp chứ?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Có",
          cancelButtonText: "Không",
        });

        if (!result.isConfirmed) {
          setIsSubmitting(false);
          return;
        }
      }

      const userString = localStorage.getItem("user");
      if (!userString) throw new Error("User data not found");

      const user = JSON.parse(userString);
      const studentId = user.userId;
      if (!studentId) throw new Error("Student ID not found");

      const submissionPayload = {
        quizId: Number.parseInt(id as string, 10),
        studentId,
        startAt: startTime.toISOString(),
        endAt: new Date().toISOString(),
        answers: answersPayload,
      };

      const res = await fetch("http://localhost:8080/api/quiz-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionPayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Có lỗi xảy ra khi nộp bài";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const result = await res.json();
      setIsSubmited(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const start = new Date(result.startAt).getTime();
      const end = new Date(result.endAt).getTime();
      const durationMs = Math.max(0, end - start);
      const durationMinutes = Math.floor(durationMs / 60000);
      const durationSeconds = Math.floor((durationMs % 60000) / 1000);

      setQuizResult({
        studentName: result.studentName,
        className: result.className,
        subject: result.subjectName,
        duration: `${durationMinutes} phút ${durationSeconds} giây`,
        startTime: formatDateTime(result.startAt),
        endTime: formatDateTime(result.endAt),
        score: result.score,
        totalQuestions: quiz.questions.length,
        title: quiz.title,
      });

      setIsResultOpen(true);
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      alert(`Lỗi khi nộp bài: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [id, startTime, quiz, quizAnswers, isSubmitting, isSubmited, token]);
  if (error) {
    return (
      <QueryError
        error={error}
        title="Không tải được bài quiz"
        onRetry={() => refetch()}
        onGoBack={() => history.back()}
        isRetrying={isFetching}
      />
    );
  }
  if (isLoading || isFetching) {
    return <QuizSkeleton />;
  }
  if (!quiz) {
    return <QuizSkeleton />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 sticky top-4 h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold truncate">
                {quiz.title}
              </CardTitle>
              <CardDescription className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Thời gian: {quiz.timeLimit} phút
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Tiến độ
                  </span>
                  <span className="text-sm font-medium text-indigo-600">
                    {Math.round(calculateProgress())}%
                  </span>
                </div>
                <Progress value={calculateProgress()} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Thời gian còn lại:
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {quiz.questions.map((q: any, index: number) => {
                    const pageOfQuestion = Math.floor(
                      index / QUESTIONS_PER_PAGE
                    );
                    const isInCurrentPage = pageOfQuestion === currentPage;
                    const answer = quizAnswers[q.id];
                    const isAnswered = Array.isArray(answer)
                      ? answer.length > 0
                      : answer !== "";

                    return (
                      <Button
                        key={q.id}
                        size="icon"
                        onClick={() => setCurrentPage(pageOfQuestion)}
                        className={`
                          ${isInCurrentPage ? "border-2 border-primary" : ""}
                          ${isAnswered ? "bg-gray-700 text-white" : ""}
                          hover:bg-primary hover:text-white transition
                        `}
                        variant="outline"
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting || isSubmited}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmited
                  ? "Đã nộp"
                  : isSubmitting
                  ? "Đang nộp..."
                  : "Nộp bài"}
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent>
                {currentQuestions.map((q: any, idx: number) => (
                  <QuestionCard
                    key={q.id}
                    index={currentPage * QUESTIONS_PER_PAGE + idx}
                    data={q}
                    answer={quizAnswers[q.id]}
                    onAnswer={(val) => handleAnswerChange(q.id, val)}
                  />
                ))}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Trang trước
                  </Button>

                  {(currentPage + 1) * QUESTIONS_PER_PAGE <
                  quiz.questions.length ? (
                    <Button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={isSubmited}
                    >
                      Trang tiếp
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isSubmited}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmited
                        ? "Đã nộp"
                        : isSubmitting
                        ? "Đang nộp..."
                        : "Nộp bài"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {quizResult && (
        <QuizResultDialog
          open={isResultOpen}
          onOpenChange={setIsResultOpen}
          data={quizResult}
        />
      )}
    </div>
  );
}
// 1) Tạo component skeleton
function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 sticky top-4 h-fit">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/3 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-14" />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full" />
                  ))}
                </div>
              </div>

              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="space-y-6 py-6">
                {/* 5 item - tương ứng QUESTIONS_PER_PAGE */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    {/* vài dòng mô tả/option giả */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-10/12" />
                    {/* các option */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
