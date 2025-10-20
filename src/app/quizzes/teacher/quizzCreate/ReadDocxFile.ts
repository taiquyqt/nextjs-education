import mammoth from "mammoth";

export const readDocxFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    const parser = new DOMParser();
    const doc = parser.parseFromString(result.value, "text/html");

    const questions = [];
    let currentQuestion: {
        question: string;
        options: { optionLabel: string; optionText: string }[];
        answer: string | null;
    } | null = null;

    const paragraphs = doc.querySelectorAll("p");

    for (const p of paragraphs) {
        const html = p.innerHTML.trim();
        const text = p.textContent?.trim() || "";

        // TH1: Dòng bắt đầu bằng số thứ tự câu hỏi (vd: "1. ...")
        if (/^\d+\./.test(text)) {
            if (currentQuestion) questions.push(currentQuestion);
            currentQuestion = {
                question: text.replace(/^\d+\.\s*/, ""),
                options: [],
                answer: null
            };
        }

        // TH2: Dòng bắt đầu bằng A. B. C. D.
        else if (/^[A-D]\./.test(text)) {
            if (!currentQuestion) {
                console.warn("Bỏ qua option vì chưa có câu hỏi", text);
                continue;
            }

            const letter = text[0];
            const optionText = text.slice(2).trim(); // Bỏ ký tự "A. " ở đầu
            const isBold = /<strong>|<b>/.test(html);

            currentQuestion.options.push({
                optionLabel: letter,
                optionText: optionText
            });

            if (isBold) {
                currentQuestion.answer = letter;
            }
        }

        // TH3: Dòng đáp án cuối
        else if (/^Đáp án[:：]/i.test(text)) {
            const match = text.match(/Đáp án[:：]\s*([A-D])/i);
            if (match && currentQuestion) {
                currentQuestion.answer = match[1];
            }
        }
    }

    if (currentQuestion) questions.push(currentQuestion);

    return questions.length > 0 ? questions : [];
};
