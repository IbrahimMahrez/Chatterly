import { useState } from 'react';
import { Bot, Lightbulb, Send, Sparkles, X } from 'lucide-react';
import { askAI, suggestPost } from '../api/ai';

export default function AIAssistant({ onUseSuggestion }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || loading) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'chat') {
        setMessages((current) => [...current, { role: 'user', text: value }]);
        setInput('');
        const { data } = await askAI(value);
        setMessages((current) => [...current, { role: 'assistant', text: data.answer }]);
      } else {
        const { data } = await suggestPost(value);
        setAnswer(data.suggestion);
        setInput('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI service is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" className="ai-launcher" onClick={() => setOpen(true)} aria-label="Open Chatterly AI"><Sparkles size={21} /></button>
      {open && <section className="ai-panel" aria-label="Chatterly AI">
        <header className="ai-header"><div><strong>Chatterly AI</strong><small>Real assistant</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close AI"><X size={18} /></button></header>
        <div className="ai-mode-tabs"><button type="button" className={mode === 'chat' ? 'active' : ''} onClick={() => setMode('chat')}><Bot size={15} /> Ask AI</button><button type="button" className={mode === 'post' ? 'active' : ''} onClick={() => setMode('post')}><Lightbulb size={15} /> Suggest a post</button></div>
        {mode === 'chat' ? <div className="ai-messages">{messages.length === 0 && <div className="ai-empty">Ask a question about writing, coding, or anything you need.</div>}{messages.map((message, index) => <div className={`ai-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}{loading && <div className="ai-message assistant">Thinking...</div>}</div> : <div className="ai-suggestion">{answer ? <><p>{answer}</p><button type="button" onClick={() => onUseSuggestion?.(answer)}>Use in post</button></> : <div className="ai-empty">Give me a topic and I will draft a post.</div>}</div>}
        {error && <p className="ai-error">{error}</p>}
        <form className="ai-form" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={mode === 'chat' ? 'Ask a question...' : 'Topic for your post...'} disabled={loading} /><button type="submit" disabled={loading || !input.trim()} aria-label="Send"><Send size={17} /></button></form>
      </section>}
    </>
  );
}
