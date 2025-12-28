import { geminiModelTranslator } from "../../server.js";

export async function translateTextMulti({
    caption,
    sourceLang,
    targetLangs,
}) {
    if (!caption?.trim()) {
        return Object.fromEntries(
            targetLangs.map(lang => [lang, ""])
        );
    }

    const prompt = `
            Translate the text into the target languages and return ONLY a JSON object.

            Input:
            {
            "sourceLang": "${sourceLang}",
            "targetLangs": ${JSON.stringify(targetLangs)},
            "text": "${caption}"
            }

            Output:
            A JSON object where:
            - keys are exactly targetLangs
            - values are translations of text
            `;

    try {
        const result = await geminiModelTranslator.generateContent(prompt);

        function safeJsonParse(raw) {
            const cleaned = raw
                .trim()
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/```$/i, "");

            return JSON.parse(cleaned);
        }

        const parsed = safeJsonParse(result.response.text());

        const normalized = {};
        for (const lang of targetLangs) {
            normalized[lang] = parsed[lang] ?? caption;
        }

        return normalized;

    } catch (err) {
        console.error("Translate failed:", err);

        return Object.fromEntries(
            targetLangs.map(lang => [lang, caption])
        );
    }
}
