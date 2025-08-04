import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown,Menu } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import Sidebar from './components/Sidebar.jsx';
const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message with new format
    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText; // Store current input
    setInputText('');
    setIsTyping(true);

    // Start streaming from your backend
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const eventSource = new EventSource(`${backendUrl}/chat/stream/${encodeURIComponent(currentInput)}`);
    let aiText = '';

    eventSource.onmessage = (event) => {
      if (event.data === '__END__') {
        setIsTyping(false);
        eventSource.close();
        return;
      }

      aiText += event.data;

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.sender === 'ai') {
          return [...prev.slice(0, -1), { 
            id: last.id,
            sender: 'ai', 
            text: aiText,
            isBot: true,
            timestamp: last.timestamp
          }];
        } else {
          return [...prev, { 
            id: Date.now() + 1,
            sender: 'ai', 
            text: aiText,
            isBot: true,
            timestamp: new Date()
          }];
        }
      });
    };

    eventSource.onclose = () => {
      setIsTyping(false);
      eventSource.close();
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      if (eventSource.readyState === EventSource.CLOSED || aiText.length > 0) {
        return;
      }

      setIsTyping(false);
      eventSource.close();

      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        sender: 'ai',
        text: "Sorry, I'm having trouble connecting. Please try again.",
        isBot: true,
        timestamp: new Date()
      }]);
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-medium text-gray-900">AI Assistant</h1>
          </div>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.isBot || message.sender === 'ai' ? '' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isBot || message.sender === 'ai'
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {message.isBot || message.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-2xl ${message.isBot || message.sender === 'ai' ? '' : 'flex flex-col items-end'}`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.isBot || message.sender === 'ai'
                      ? 'bg-white border border-gray-200 text-gray-900' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  </div>

                  {/* Message Actions (only for bot messages) */}
                  {(message.isBot || message.sender === 'ai') && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyMessage(message.text)}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Copy message"
                      >
                        <Copy size={14} className="text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100" title="Good response">
                        <ThumbsUp size={14} className="text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100" title="Bad response">
                        <ThumbsDown size={14} className="text-gray-400" />
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="flex-1 max-w-2xl">
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AI Assistant..."
                className="flex-1 min-h-[44px] max-h-32 px-4 py-3 bg-transparent border-none outline-none resize-none placeholder-gray-500"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '44px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="m-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatBot;