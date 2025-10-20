import { NextRequest } from "next/server"
import { type QuizGenerationRequest, type Quiz, type Question } from "@/lib/types"

// Mock AI generation endpoint.
// TODO: Replace with your AI backend call. If you use the Vercel AI SDK,
// call generateText/streamText here with your model and parse the output.

export async function POST(req: NextRequest) {
    const body = (await req.json()) as QuizGenerationRequest
    const count = Math.max(1, Math.min(50, body.settings.numberOfQuestions))

    const questions: Question[] = Array.from({ length: count }).map((_, idx) => {
        const baseIdx = idx + 1
        const difficulty = body.settings.difficulty.toLowerCase()
        const type =
            body.settings.questionType === "Multiple Choice"
                ? "multiple_choice"
                : body.settings.questionType === "True/False"
                    ? "true_false"
                    : "free_response"

        if (type === "multiple_choice") {
            const options = ["A", "B", "C", "D"].map((k, i) => ({
                id: `${baseIdx}-${i}`,
                text: `Phương án ${k} cho câu ${baseIdx}`,
                correct: i === 0,
            }))
            return {
                id: `q-${baseIdx}`,
                type,
                text: `Câu ${baseIdx}: Tóm tắt ý chính của phần ${baseIdx} trong tài liệu là gì?`,
                difficulty,
                explanation: "Đáp án đúng vì phù hợp với nội dung chính.",
                options,
            }
        }

        if (type === "true_false") {
            return {
                id: `q-${baseIdx}`,
                type,
                text: `Câu ${baseIdx}: Phát biểu sau đúng hay sai?`,
                difficulty,
                explanation: "Xem lại trang 3 của tài liệu để xác minh.",
                answer: baseIdx % 2 === 0,
            }
        }

        return {
            id: `q-${baseIdx}`,
            type: "free_response",
            text: `Câu ${baseIdx}: Trình bày ngắn gọn khái niệm chính trong mục ${baseIdx}.`,
            difficulty,
            explanation: "Nêu đủ định nghĩa và ví dụ minh hoạ.",
            answer: "",
        }
    })

    const quiz: Quiz = {
        id: `quiz-${Date.now()}`,
        language: body.settings.language,
        visibility: body.settings.visibility,
        mode: body.settings.mode,
        task: body.settings.task,
        questions,
        sourceFiles: body.files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    }

    // Simulate processing latency
    await new Promise((r) => setTimeout(r, 1200))

    return new Response(JSON.stringify({ quiz }), {
        headers: { "Content-Type": "application/json" },
    })
}
