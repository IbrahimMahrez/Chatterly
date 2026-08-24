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

const summarizeConversation = asyncWrapper(async (req, res) => {
  const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
  if (!messages.length) return res.status(400).json({ message: 'There are no messages to summarize' });

  const transcript = messages
    .slice(-60)
    .map((item) => `${String(item.senderName || 'User').slice(0, 80)}: ${String(item.message || '').slice(0, 1000)}`)
    .filter((item) => !item.endsWith(': '))
    .join('\n');
  if (!transcript) return res.status(400).json({ message: 'There are no messages to summarize' });

  const summary = await callAI([
    { role: 'system', content: 'Summarize this chat clearly in the same language used in it. Use short sections: Summary, Key points, and Action items. If there are no action items, say so. Do not invent facts.' },
    { role: 'user', content: transcript },
  ]);
  res.json({ summary });
});

const suggestReplies = asyncWrapper(async (req, res) => {
  const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
  if (!messages.length) return res.status(400).json({ message: 'There are no messages to reply to' });

  const transcript = messages
    .slice(-20)
    .map((item) => `${String(item.senderName || 'User').slice(0, 80)}: ${String(item.message || '').slice(0, 1000)}`)
    .filter((item) => !item.endsWith(': '))
    .join('\n');
  if (!transcript) return res.status(400).json({ message: 'There are no messages to reply to' });

  const result = await callAI([
    { role: 'system', content: 'Suggest exactly 3 short, natural replies to the latest message in this chat. Use the same language as the chat. Make the replies distinct: friendly, concise, and thoughtful. Return valid JSON only in this exact shape: {"suggestions":["reply 1","reply 2","reply 3"]}. Do not add markdown or explanations.' },
    { role: 'user', content: transcript },
  ]);

  let suggestions;
  try {
    suggestions = JSON.parse(result).suggestions;
  } catch {
    return res.status(502).json({ message: 'AI returned an invalid reply format. Please try again.' });
  }
  if (!Array.isArray(suggestions) || suggestions.length !== 3 || suggestions.some((item) => typeof item !== 'string' || !item.trim())) {
    return res.status(502).json({ message: 'AI returned invalid reply suggestions. Please try again.' });
  }
  res.json({ suggestions: suggestions.map((item) => item.trim().slice(0, 500)) });
});

module.exports = { chat, suggestPost, summarizeConversation, suggestReplies };
