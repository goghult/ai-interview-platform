import ai from '../config/ai.js';

const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const RETRYABLE_STATUSES = new Set([429, 500, 503]);

const generateContent = async (prompt) => {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await ai.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      lastError = error;
      if (!RETRYABLE_STATUSES.has(error.status) || attempt === 2) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError;
};

export const generateQuestion = async (req, res) => {
  try {
    const { role, difficulty, previousQuestions = [] } = req.body;
    
    if (!ai) {
      return res.status(500).json({ error: "AI API client not initialized. Check your GROQ_API_KEY." });
    }

    let avoidPrompt = '';
    if (previousQuestions && previousQuestions.length > 0) {
      avoidPrompt = `\nCRITICAL INSTRUCTION: Do NOT ask any of these previously asked questions:\n${previousQuestions.map(q => `- ${q}`).join('\n')}\nYou must ask a completely NEW and DIFFERENT question.`;
    }

    const prompt = `You are an expert technical interviewer. Generate exactly ONE ${difficulty || 'medium'} difficulty interview question for a ${role} role. Do not include the answer. Only provide the question text directly.${avoidPrompt}`;

    const result = await generateContent(prompt);
    const question = result;
    res.json({ question });
  } catch (error) {
    console.error("Error generating question:", error.message, error.stack);
    if (error.status === 429) {
      return res.status(429).json({ error: "API Quota Exceeded. Please wait about a minute before trying again." });
    }
    if (error.status === 503) {
      return res.status(503).json({ error: "Groq is temporarily busy. Please try again in a moment." });
    }
    res.status(500).json({ error: `Failed to generate question: ${error.message}` });
  }
};

export const evaluateAnswer = async (req, res) => {
  try {
    const { role, question, answer } = req.body;

    if (!ai) {
      return res.status(500).json({ error: "AI API client not initialized. Check your GROQ_API_KEY." });
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate for a ${role} position.
Question: ${question}
Candidate's Answer: ${answer}

Please evaluate this answer. Give a score out of 10 and provide brief, constructive feedback on what the candidate did well and what could be improved.
Format your response as a JSON object with exactly two keys: "score" (a number) and "feedback" (a string). Do not include markdown formatting or any other text.`;

    const result = await generateContent(prompt);
    let resultText = result;
    
    // Clean up potential markdown formatting from AI output
    if (resultText.startsWith('\`\`\`json')) {
      resultText = resultText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }
    
    let evaluation;
    try {
      evaluation = JSON.parse(resultText);
    } catch (e) {
      // Fallback if AI didn't return proper JSON
      evaluation = { score: 5, feedback: resultText };
    }

    res.json(evaluation);
  } catch (error) {
    console.error("Error evaluating answer:", error);
    if (error.status === 429) {
      return res.status(429).json({ error: "API Quota Exceeded. Please wait about a minute before trying again." });
    }
    if (error.status === 503) {
      return res.status(503).json({ error: "Groq is temporarily busy. Please try again in a moment." });
    }
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
};
