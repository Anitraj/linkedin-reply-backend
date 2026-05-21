const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/suggest", async (req, res) => {
  try {
    const { messages, instruction } = req.body;

    const prompt = `
You are helping me reply on LinkedIn.

Conversation:
${JSON.stringify(messages, null, 2)}

Additional instruction from user:
${instruction || "None"}

Suggest 3 short, natural, professional replies for me to send.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log(
      "Groq response:",
      JSON.stringify(data, null, 2)
    );

    if (
      !data.choices ||
      !data.choices.length
    ) {
      return res.status(500).json({
        error:
          data.error ||
          "Groq returned no choices"
      });
    }

    const text =
  data.choices[0].message.content;

const suggestions = text
  .split(
    /\*\*(?:Option|Reply)\s*\d+.*?\*\*|\n\s*\d+\.\s+/gi
  )
  .map(s =>
    s
      .replace(/^["']|["']$/g, "")
      .trim()
  )
  .filter(Boolean)
  .filter(
    s =>
      !s.toLowerCase().includes("here are") &&
      !s.toLowerCase().includes("professional options")
  );

res.json({
  suggestions
});

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong"
    });
  }
});

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    "Server running on port",
    PORT
  );
});
