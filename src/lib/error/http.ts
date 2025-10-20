export async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) {
        let body: any = null;
        try { body = await res.json(); } catch { }
        const err = new Error(body?.message || res.statusText);
        (err as any).status = res.status;
        (err as any).code = body?.code;
        (err as any).details = body;
        throw err; // sẽ được normalizeError xử lý
    }
    return (await res.json()) as T;
}
