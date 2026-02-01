"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
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

const QUESTIONS_PER_PAGE = 5;

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  // --- 1. LẤY DỮ LIỆU TỪ API ---
  const { data: apiResponse, isLoading, error, refetch, isFetching } = useQuiz(id);
  
  // Unwrap dữ liệu: Nếu apiResponse có .data thì lấy, không thì lấy chính nó (fallback)
  const quiz = apiResponse?.data || apiResponse;

  // --- 2. LOCAL STATE ---
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmited, setIsSubmited] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionListTopRef = useRef<HTMLDivElement>(null); // Ref để cuộn lên đầu

  // Lấy User ID để tạo key lưu trữ riêng biệt cho từng user/quiz
  const userString = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userString ? JSON.parse(userString) : null;
  const studentId = user?.userId || "guest";
  
  // Key lưu trữ trong localStorage
  const STORAGE_KEY = `quiz_progress_${id}_student_${studentId}`;

  // --- 3. AUTO LOAD & RESTORE (QUAN TRỌNG: CHỐNG F5 MẤT BÀI) ---
  useEffect(() => {
    // Chỉ chạy 1 lần khi mount hoặc khi có quiz data
    if (!quiz) return;

    const savedDataString = localStorage.getItem(STORAGE_KEY);
    
    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString);
        
        // 1. Khôi phục đáp án
        if (savedData.answers) {
          setQuizAnswers(savedData.answers);
        }

        // 2. Khôi phục thời gian
        if (savedData.startTime) {
          const savedStart = new Date(savedData.startTime);
          setStartTime(savedStart);

          // Tính toán lại thời gian còn lại dựa trên thời gian thực
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - savedStart.getTime()) / 1000);
          const limitSeconds = quiz.timeLimit * 60;
          const remaining = limitSeconds - elapsedSeconds;

          setTimeLeft(remaining > 0 ? remaining : 0);
        } else {
            // Trường hợp có save nhưng lỗi time, reset lại
            initNewQuizSession();
        }
      } catch (e) {
        console.error("Lỗi khôi phục bài làm:", e);
        initNewQuizSession();
      }
    } else {
      // Chưa có save -> Bài mới hoàn toàn
      initNewQuizSession();
    }
  }, [quiz, STORAGE_KEY]);

  // Hàm khởi tạo bài làm mới
  const initNewQuizSession = () => {
    if (quiz && quiz.timeLimit && !startTime) {
      const now = new Date();
      setStartTime(now);
      setTimeLeft(quiz.timeLimit * 60);
    }
  };

  // --- 4. AUTO SAVE (LƯU LIÊN TỤC) ---
  useEffect(() => {
    if (startTime && !isSubmited) {
      const dataToSave = {
        answers: quizAnswers,
        startTime: startTime.toISOString(),
        quizId: id
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [quizAnswers, startTime, isSubmited, STORAGE_KEY, id]);

  // --- 5. TIMER LOGIC ---
  useEffect(() => {
    if (isSubmited || isSubmitting) return;

    // Nếu hết giờ -> Tự nộp
    if (timeLeft <= 0 && startTime) {
      // Kiểm tra xem có phải vừa load trang đã hết giờ không
      // (để tránh loop nộp bài liên tục nếu user F5 khi đã hết giờ)
      if (!isSubmitting) {
         handleSubmit();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isSubmitting, isSubmited, startTime]); // Bỏ handleSubmit khỏi dependency để tránh vòng lặp

  // --- 6. SCROLL LOGIC (FIX LỖI CUỐN TRANG) ---
  // Mỗi khi currentPage thay đổi, cuộn lên đầu danh sách câu hỏi
  useEffect(() => {
    if (questionListTopRef.current) {
        // Scroll nhẹ nhàng lên đầu thẻ chứa câu hỏi
        questionListTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
        // Fallback: cuộn lên đầu trang nếu không tìm thấy ref
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // --- 7. LOGIC XỬ LÝ ---
  const handleAnswerChange = (questionId: number, answer: string | string[]) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const scrollToQuestion = (questionId: number, index: number) => {
    const targetPage = Math.floor(index / QUESTIONS_PER_PAGE);
    if (targetPage !== currentPage) setCurrentPage(targetPage);
    
    setTimeout(() => {
      const element = document.getElementById(`question-${questionId}`);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const calculateProgress = () => {
    if (!quiz?.questions?.length) return 0;
    const answeredCount = Object.values(quizAnswers).filter((ans) => 
      Array.isArray(ans) ? ans.length > 0 : (ans !== "" && ans !== undefined)
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
        if (!q.id) continue; // Fix lỗi TypeScript undefined ID

        const answer = quizAnswers[q.id];
        if (Array.isArray(answer)) {
          answersPayload[q.id] = answer;
        } else if (typeof answer === "string" && answer) {
          answersPayload[q.id] = [answer];
        } else {
          answersPayload[q.id] = [];
        }
      }

      // Chỉ hỏi xác nhận nếu còn thời gian (timeLeft > 0)
      if (timeLeft > 0) {
        const unanswered = Object.values(answersPayload).filter((v) => v.length === 0).length;
        if (unanswered > 0) {
          const result = await Swal.fire({
            title: `Còn ${unanswered} câu chưa làm!`,
            text: "Bạn có chắc muốn nộp bài không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Nộp luôn",
            cancelButtonText: "Làm tiếp",
          });
          if (!result.isConfirmed) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      const token = localStorage.getItem("accessToken");
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
          const text = await res.text();
          throw new Error(text || "Lỗi khi nộp bài");
      }

      const result = await res.json();
      setIsSubmited(true);
      
      // QUAN TRỌNG: Xóa localStorage sau khi nộp thành công để lần sau vào làm lại từ đầu (nếu được phép)
      localStorage.removeItem(STORAGE_KEY);

      // Tính toán kết quả hiển thị
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
        startTime: new Date(result.startAt).toLocaleTimeString(),
        endTime: new Date(result.endAt).toLocaleTimeString(),
        score: result.score,
        totalQuestions: quiz.questions.length,
        title: quiz.title,
      });

      setIsResultOpen(true);
    } catch (err: any) {
      console.error("Error submitting:", err);
      Swal.fire("Lỗi!", "Không thể nộp bài. Vui lòng thử lại.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, startTime, quiz, quizAnswers, isSubmitting, isSubmited, studentId, STORAGE_KEY, timeLeft]); // Thêm timeLeft vào dependency

  // Helper Formats
  const formatTime = (seconds: number) => {
    if (seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestions = useMemo(() => {
    if (!quiz?.questions) return [];
    return quiz.questions.slice(
      currentPage * QUESTIONS_PER_PAGE,
      (currentPage + 1) * QUESTIONS_PER_PAGE
    );
  }, [quiz, currentPage]);

  // --- RENDER ---
  if (error) return <QueryError error={error} title="Lỗi tải bài thi" onRetry={refetch} onGoBack={() => router.back()} isRetrying={isFetching} />;
  
  if ((isLoading || isFetching) && !quiz) return <QuizSkeleton />;
  if (!quiz) return <QuizSkeleton />; 

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* SIDEBAR */}
          <Card className="lg:col-span-1 sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-indigo-900 truncate">{quiz.title}</CardTitle>
              <CardDescription className="flex items-center text-indigo-600 font-medium">
                <Clock className="w-4 h-4 mr-2" /> {formatTime(timeLeft)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                   <span>Tiến độ</span><span>{Math.round(calculateProgress())}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((q: any, index: number) => {
                   const hasAnswer = quizAnswers[q.id] && (Array.isArray(quizAnswers[q.id]) ? quizAnswers[q.id].length > 0 : !!quizAnswers[q.id]);
                   const isCurrent = Math.floor(index / QUESTIONS_PER_PAGE) === currentPage;
                   return (
                     <Button
                       key={q.id}
                       size="sm"
                       variant={hasAnswer ? "default" : "outline"}
                       className={`h-8 w-full ${isCurrent ? "ring-2 ring-gray-400" : ""} ${hasAnswer ? "bg-green-600 hover:bg-green-700" : ""}`}
                       onClick={() => scrollToQuestion(q.id, index)}
                     >
                       {index + 1}
                     </Button>
                   );
                })}
              </div>
              
              <Button onClick={handleSubmit} disabled={isSubmitting || isSubmited} className="w-full bg-gray-600 hover:bg-gray-700">
                <Send className="w-4 h-4 mr-2" /> {isSubmited ? "Đã nộp" : isSubmitting ? "Đang nộp..." : "Nộp bài"}
              </Button>
            </CardContent>
          </Card>

          {/* MAIN CONTENT */}
          {/* Gắn ref vào đây để Scroll hoạt động */}
          <div className="lg:col-span-3 space-y-6 scroll-mt-24" ref={questionListTopRef}>
            {currentQuestions.map((q: any, idx: number) => (
              <div key={q.id} id={`question-${q.id}`} className="scroll-mt-28">
                <QuestionCard
                  index={currentPage * QUESTIONS_PER_PAGE + idx}
                  data={q}
                  answer={quizAnswers[q.id]}
                  onAnswer={(val) => handleAnswerChange(q.id, val)}
                  readOnly={isSubmited}
                />
              </div>
            ))}

            <div className="flex justify-between items-center py-4">
               <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Trước
               </Button>
               <span className="text-sm font-medium text-gray-500"> {currentPage + 1} / {Math.ceil(quiz.questions.length / QUESTIONS_PER_PAGE)}</span>
               {(currentPage + 1) * QUESTIONS_PER_PAGE < quiz.questions.length ? (
                 <Button onClick={() => setCurrentPage(p => p + 1)} disabled={isSubmited}>Tiếp <ArrowRight className="ml-2 h-4 w-4" /></Button>
               ) : (
                 <Button onClick={handleSubmit} disabled={isSubmitting || isSubmited} className="bg-green-600 hover:bg-green-700 text-white">Nộp bài</Button>
               )}
            </div>
          </div>

        </div>
      </div>
      
      {quizResult && <QuizResultDialog open={isResultOpen} onOpenChange={setIsResultOpen} data={quizResult} />}
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1"><CardContent className="p-4 space-y-4"><Skeleton className="h-8 w-3/4"/><Skeleton className="h-4 w-1/2"/><div className="grid grid-cols-5 gap-2">{Array.from({length:10}).map((_,i)=><Skeleton key={i} className="h-8 w-8"/>)}</div></CardContent></Card>
          <div className="lg:col-span-3 space-y-6">{Array.from({length:3}).map((_,i)=><Card key={i}><CardContent className="p-6 h-32"><Skeleton className="h-full w-full"/></CardContent></Card>)}</div>
        </div>
      </div>
    </div>
  );
}