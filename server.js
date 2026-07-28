import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const { GoogleGenAI } = await import("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("FactEWOW AI server is running");
});

app.post("/speaking-response", async (req, res) => {

    try {

        const { conversation } = req.body;

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash-lite",

            config: {
                systemInstruction: `
You are a professional IELTS Speaking examiner.

Conduct a realistic IELTS Speaking test.

Rules:
- Ask only one question at a time.
- Speak naturally and professionally.
- Do not give the candidate a band score during the test.
- Do not give long explanations.
- React briefly to the candidate's answer when appropriate.
- Ask a relevant follow-up question.
- Follow the structure of IELTS Speaking Parts 1, 2, and 3.
- For Part 2, give the candidate a cue card and allow them to speak.
- For Part 3, ask more abstract and analytical questions.
- Keep the conversation realistic.

Return only the examiner's next spoken response.
                `,

                responseMimeType: "text/plain"
            },

            contents: conversation

        });

        res.json({
            reply: response.text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "AI connection failed"
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`FactEWOW server running on port ${PORT}`);
});