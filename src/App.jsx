import { useState } from 'react';

export default function ChatBot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);

    const eventSource = new EventSource(`http://localhost:3000/chat/stream/${encodeURIComponent(input)}`);
    let aiText = '';

    eventSource.onmessage = (event) => {
      aiText += event.data;

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.sender === 'ai') {
          return [...prev.slice(0, -1), { sender: 'ai', text: aiText }];
        } else {
          return [...prev, { sender: 'ai', text: aiText }];
        }
      });
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };

    setInput('');
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>🤖 AI Chatbot</h2>
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', padding: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <p><strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something..."
          style={{ width: '75%', padding: 8 }}
        />
        <button onClick={handleSend} style={{ padding: 8, marginLeft: 10 }}>Send</button>
      </div>
    </div>
  );
}
