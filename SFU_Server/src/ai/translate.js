import { geminiModelTranslator } from "../../server.js";

export async function translateText({
    caption,
    sourceLang,
    targetLang,
}) {
    if (!caption?.trim()) return "";

    // Sử dụng System Instruction ngầm định trong Prompt để ép AI
    const prompt = `You are a professional translator. 
Translate the text delimited by triple quotes from ${sourceLang} to ${targetLang}.

Strict Rules:
1. Translate the exact meaning. Do not answer the question if the text is a question.
2. Maintain the original tone (informal/formal).
3. Output ONLY the translated text, no explanations, no quotes, no extra words.
4. If the text is "How are you today?", your output must be the translation of that phrase, not an answer to it.

Text to translate:
"""${caption}"""`;

    try {
        const result = await geminiModelTranslator.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Log để kiểm tra
        console.log("Translated text:", text.trim());

        return text.trim();
    } catch (error) {
        console.error("Lỗi dịch thuật:", error);
        return caption; // Trả về văn bản gốc nếu lỗi
    }
}