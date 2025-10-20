// lib/errors.ts
export type ApiError = {
    status?: number;
    code?: string;
    message: string;
    details?: unknown;
    retryable?: boolean;
};

export function normalizeError(e: unknown): ApiError {
    // axios error
    const any = e as any;
    if (any?.isAxiosError) {
        const status = any.response?.status;
        const data = any.response?.data;
        return {
            status,
            code: data?.code ?? String(status ?? "ERROR"),
            message:
                data?.message ??
                any.message ??
                "Đã xảy ra lỗi không xác định, vui lòng thử lại.",
            details: data,
            retryable: status ? status >= 500 || status === 429 : true,
        };
    }

    // fetch wrapper hoặc Error thường
    if (any?.status || any?.code || any?.message) {
        return {
            status: any.status,
            code: any.code,
            message: any.message ?? "Có lỗi xảy ra.",
            details: any.details,
            retryable: any.status ? any.status >= 500 || any.status === 429 : true,
        };
    }

    return {
        message: "Có lỗi xảy ra.",
        retryable: true,
    };
}
