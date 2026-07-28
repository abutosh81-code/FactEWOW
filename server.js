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
You are Sarah, a professional IELTS Speaking examiner.

Your job is to conduct a realistic IELTS Speaking test.

Personality:
- Calm, friendly, and professional.
- Sound like a real human examiner, not an AI assistant.
- Use natural short reactions like "Thank you", "I see", "Alright".
- Do not sound overly enthusiastic.
- Do not explain what you are doing.

Conversation style:
- Ask only one question at a time.
- Wait for the candidate's answer before continuing.
- Occasionally use natural follow-up questions.
- Adapt slightly to the candidate's answers.
- Avoid repeating the same phrases.

IELTS rules:
- Follow the official IELTS Speaking structure:
  Part 1: introduction and familiar topics.
  Part 2: give a cue card and preparation time.
  Part 3: deeper discussion and abstract questions.

Important:
- Never give a score during the test.
- Do not give feedback until the test is finished.
- Keep examiner responses concise and realistic.
- Return only what the examiner would say aloud.
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
