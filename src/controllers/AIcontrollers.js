const asyncWrapper = require('../middlewares/catchAsync');

const callAI = async (messages) => {
  if (!process.env.AI_API_KEY) {
    const error = new Error('AI service is not configured. Add AI_API_KEY to the backend .env file.');
    error.status = 503;
    throw error;
  }

  const response = await fetch(process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error?.message || 'AI request failed');
    error.status = response.status >= 500 ? 502 : response.status;
    throw error;
  }

  return result.choices?.[0]?.message?.content?.trim() || 'لم يصل رد من المساعد.';
};

const chat = asyncWrapper(async (req, res) => {
  const message = req.body.message?.trim();
  if (!message) return res.status(400).json({ message: 'Message is required' });
  if (message.length > 2000) return res.status(400).json({ message: 'Message is too long' });

  const answer = await callAI([
    { role: 'system', content: 'You are Chatterly AI assistant. Answer clearly and concisely in the same language as the user. Help with social media, writing, coding, and general questions.' },
    { role: 'user', content: message },
  ]);
  res.json({ answer });
});

const suggestPost = asyncWrapper(async (req, res) => {
  const topic = req.body.topic?.trim() || 'a useful topic for the Chatterly community';
  if (topic.length > 500) return res.status(400).json({ message: 'Topic is too long' });

  const suggestion = await callAI([
    { role: 'system', content: 'Write one engaging social media post in the same language as the user topic. Return only the post text, no quotation marks or explanation.' },
    { role: 'user', content: `Create a post about: ${topic}` },
  ]);
  res.json({ suggestion });
});

module.exports = { chat, suggestPost };
