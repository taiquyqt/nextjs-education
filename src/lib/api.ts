// lib/api/quiz-api.ts
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { AiQuizSettings, BackendQuizResponse, QuizzFormData } from "@/types/quiz.type";
import { useQuizzStorage } from "./store/useQuizzStorage";
import { mapBackendToFormData } from "@/untils/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create Axios instance
export const apiClient = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 300000, // Tăng timeout lên 300s
    headers: {
        'Content-Type': 'application/json',
    }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (res) => res.data,
    async (err: AxiosError) => {
        const errorMessage = extractAxiosError(err);
        console.error("API Error:", errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);

export async function apiCall<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
    return apiClient.request<T>({ url: path, ...config });
}

function extractAxiosError(err: AxiosError): string {
    console.error("Full error object:", err);

    // CORS error
    if (err.code === "ERR_NETWORK" && !err.response) {
        return `CORS Error: Không thể kết nối tới server tại ${API_BASE}. Kiểm tra CORS configuration.`;
    }

    if (err.response) {
        const { data, status, statusText } = err.response;
        console.error("Response error:", { data, status, statusText });

        if (typeof data === "string") return `HTTP ${status}: ${data}`;
        if (typeof data === "object" && (data as any).message) return (data as any).message;
        if (typeof data === "object" && (data as any).error) return (data as any).error;
        return `HTTP ${status}: ${statusText}`;
    }

    if (err.request) {
        console.error("Request error:", err.request);
        return `No response from server. Check if backend is running at ${API_BASE}`;
    }

    return err.message || "Unknown Axios error";
}

export async function callGenerateAPI(params: {
    file: File;
    settings: AiQuizSettings;
}): Promise<void> {
    const form = new FormData();
    form.append("file", params.file);
    form.append("settings", new Blob([JSON.stringify(params.settings)], {
        type: "application/json",
    }));

    console.log("Sending request to:", `${API_BASE}/api/ai/quiz/generate-from-file`);
    console.log("Form data:", {
        file: params.file.name,
        settings: JSON.stringify(params.settings, null, 2)
    });

    try {
        const res = await apiClient.post<BackendQuizResponse>(
            "/api/ai/quiz/generate-from-file", // Đảm bảo path đúng
            form,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 300000, // 300s timeout cho AI processing
            }
        );

        console.log("API Response:", res);

        const { questions, ...rest } = mapBackendToFormData(res);
        useQuizzStorage.getState().setData({
            ...useQuizzStorage.getState().data,
            questions,
        });

    } catch (error) {
        console.error("callGenerateAPI failed:", error);
        throw error;
    }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
        "text/markdown",
    ];

    if (file.size > maxSize) {
        return { valid: false, error: "File quá lớn. Tối đa 10MB." };
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt|md)$/i)) {
        return { valid: false, error: "Định dạng file không được hỗ trợ." };
    }

    return { valid: true };
}

export type { BackendQuizResponse };