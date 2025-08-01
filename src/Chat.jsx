import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Plus, Menu, Settings, MessageSquare } from 'lucide-react';

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
    const eventSource = new EventSource(`http://localhost:3000/chat/stream/${encodeURIComponent(currentInput)}`);
    let aiText = '';

    eventSource.onmessage = (event) => {
      aiText += event.data;

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.sender === 'ai') {
          // Update existing AI message
          return [...prev.slice(0, -1), { 
            id: last.id,
            sender: 'ai', 
            text: aiText,
            isBot: true,
            timestamp: last.timestamp
          }];
        } else {
          // Create new AI message
          return [...prev, { 
            id: Date.now() + 1,
            sender: 'ai', 
            text: aiText,
            isBot: true,
            timestamp: new Date()
          }];
        }
      });

      console.log(`Received on messge data: ${event}`);
      
    };

    eventSource.onclose = () => {
      setIsTyping(false);
      eventSource.close();
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setIsTyping(false);
      eventSource.close();
      
      // Add error message
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

  const conversations = [
    { id: 1, title: "Getting Started", active: true },
    { id: 2, title: "React Development Help" },
    { id: 3, title: "API Integration Questions" },
    { id: 4, title: "Design System Planning" }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">ChatBot AI</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-700"
            >
              ×
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors">
              <Plus size={16} />
              New chat
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group hover:bg-gray-800 ${
                    conv.active ? 'bg-gray-800' : ''
                  }`}
                >
                  <MessageSquare size={16} className="text-gray-400" />
                  <span className="flex-1 text-sm truncate">{conv.title}</span>
                  <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </div>

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