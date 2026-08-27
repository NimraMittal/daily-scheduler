const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();

// Initialize the Anthropic client using the key from your .env file
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create the POST route
router.post('/suggest-schedule', async (req, res) => {
  try {
    const { tasks } = req.body; 

    // PROMPT ENGINEERING
    const systemPrompt = `You are an expert time-management assistant. Analyze the provided tasks and estimate a time block for each.`;
    
    // STRUCTURED OUTPUTS
    const userPrompt = `Tasks: ${tasks}. Return a JSON array of objects. Each object must have keys: "taskTitle", "suggestedTime", and "priorityLevel". Do not include any other text or markdown formatting.`;

    // LLM API INTEGRATION
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", 
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    });

    const aiData = JSON.parse(message.content[0].text);
    res.status(200).json(aiData);

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "Failed to generate schedule" });
  }
});

module.exports = router;