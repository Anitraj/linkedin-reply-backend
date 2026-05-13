const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/suggest", async (req, res) => {
  try {
    const messages = req.body.messages || [];

    const prompt = `
Based on this LinkedIn conversation:
${messages.join("\n")}

Suggest 3 professional LinkedIn replies.
Keep each reply short and natural.
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
console.log("Groq response:", JSON.stringify(data, null, 2));
console.log("OpenAI response:", data);

if (!data.choices || !data.choices.length) {
  return res.status(500).json({
    error: data.error || "OpenAI returned no choices"
  });
}

const text = data.choices[0].message.content;

const suggestions = text
  .split("\n")
  .filter(line => line.trim());

res.json({ suggestions });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
