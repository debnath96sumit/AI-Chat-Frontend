import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown, Menu, Square, Check, Paperclip, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatAPI, mediaAPI } from '../utils/api';
import Sidebar from './Sidebar.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import Modal from './Modal.jsx';
import Loading from './Loading.jsx';
import UserProfile from './auth/UserProfile.jsx';
import ChangePassword from './auth/ChangePassword.jsx';
import SubscriptionDetails from './auth/SubscriptionDetails.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { pushToast } from '../utils/toaster.js';

const ChatBot = () => {
  const { chatId } = useParams();
  const [copiedId, setCopiedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId || null);
  const [loading, setLoading] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState(null);
  const [availableModels, setAvailableModels] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('groq');
  const [selectedModelId, setSelectedModelId] = useState('');
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const eventSourceRef = useRef(null);

  const CHAT_ALLOWED_MIMETYPES = ['application/pdf', 'text/plain'];
  const CHAT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const openSettingsModal = (tab) => {
    setActiveSettingsTab(tab);
    setSettingsModalOpen(true);
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: isTyping ? "auto" : "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setLogoutModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Load chat history when chatId changes
  useEffect(() => {
    if (chatId) {
      loadChatHistory(chatId);
      setCurrentChatId(chatId);
    } else {
      document.title = 'New Chat';
      setMessages([]);
      setCurrentChatId(null);
    }
  }, [chatId]);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await chatAPI.getModels();
        if (response?.data) {
          setAvailableModels(response.data);
          // Set default provider and model if not already set
          if (response.data.groq) {
            setSelectedProvider('groq');
            setSelectedModelId(response.data.groq.defaultModel);
          } else {
            const firstProvider = Object.keys(response.data)[0];
            if (firstProvider) {
              setSelectedProvider(firstProvider);
              setSelectedModelId(response.data[firstProvider].defaultModel);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
      }
    };
    fetchModels();
  }, []);

  // Load chat history from backend
  const loadChatHistory = async (chatId, page = 1, limit = 50) => {
    setLoading(true);

    try {
      const data = await chatAPI.getChatDetails(chatId, page, limit);
      console.log('data', data, data.data);
      document.title = data.data?.chat?.title || 'Chat';
      // set selected provider and model id
      setSelectedProvider(data.data?.chat?.provider);
      setSelectedModelId(data.data?.chat?.modelId);
      // Transform backend messages to frontend format
      const transformedMessages = data.data.messages?.docs?.map(msg => ({
        id: msg.id || msg._id,
        text: msg.content,
        isBot: msg.role === 'assistant' || msg.sender === 'ai',
        sender: msg.role === 'assistant' ? 'ai' : 'user',
        timestamp: new Date(msg.createdAt || msg.timestamp),
        attachments: msg.attachments || []
      }));

      setMessages(transformedMessages);
    } catch (err) {
      console.error('Error loading chat history:', err);
      setMessages([
        {
          id: 1,
          text: "Sorry, I couldn't load the chat history. Let's start fresh!",
          isBot: true,
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping || isUploading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      isBot: false,
      timestamp: new Date(),
      attachments: selectedAttachment ? [selectedAttachment] : []
    };

    setMessages(prev => [...prev, userMessage]);

    const currentInput = inputText;
    const currentAttachment = selectedAttachment;
    setInputText('');
    setSelectedAttachment(null);
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage(currentInput, currentChatId, selectedProvider, selectedModelId, currentAttachment);
      // set selected model id
      setSelectedModelId(response.data?.chat?.modelId);
      // set selected provider
      setSelectedProvider(response.data?.chat?.provider);
      const newChatId = response.data?.chat?._id;

      // If new chat → update URL
      if (!currentChatId && newChatId) {
        setCurrentChatId(newChatId);
        navigate(`/chat/${newChatId}`, { replace: true });
      }

      // 2️⃣ Start streaming
      setIsTyping(false);
      handleStreamingResponse(newChatId);

    } catch (err) {
      console.error('Error sending message:', err);
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        isBot: true,
        timestamp: new Date()
      }]);
    }
  };

  const handleStreamingResponse = (chatId) => {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const eventSource = new EventSource(
      `${backendUrl}/api/v1/chat/stream/${chatId}?token=${token}`
    );

    eventSourceRef.current = eventSource;

    let aiText = '';

    eventSource.onmessage = (event) => {
      let parsed;

      try {
        parsed = JSON.parse(event.data);
      } catch {
        console.error('Invalid SSE payload:', event.data);
        return;
      }

      switch (parsed.type) {
        case 'chunk': {
          aiText += parsed.content;

          setMessages((prev) => {
            const last = prev[prev.length - 1];

            if (last?.sender === 'ai') {
              return [
                ...prev.slice(0, -1),
                { ...last, text: aiText },
              ];
            } else {
              return [
                ...prev,
                {
                  id: Date.now(),
                  sender: 'ai',
                  text: aiText,
                  isBot: true,
                  timestamp: new Date(),
                },
              ];
            }
          });

          break;
        }

        case 'end': {
          eventSource.close();
          eventSourceRef.current = null;
          break;
        }

        case 'error': {
          pushToast({ message: parsed.message, type: 'error' });

          eventSource.close();
          eventSourceRef.current = null;
          break;
        }

        default:
          console.warn('Unknown SSE event:', parsed);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);

      pushToast({
        message: 'Connection lost. Please try again.',
        type: 'error',
      });

      eventSource.close();
      eventSourceRef.current = null;
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!CHAT_ALLOWED_MIMETYPES.includes(file.type)) {
      pushToast({ message: 'Invalid file type. Only PDF and TXT files are allowed.', type: 'error' });
      return;
    }
    if (file.size > CHAT_MAX_FILE_SIZE_BYTES) {
      pushToast({ message: 'File size exceeds 5MB limit.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const response = await mediaAPI.uploadChatFile(formData);
      const { _id, url, originalName, mimetype } = response.data?.data || response.data || {};

      if (_id && url) {
        setSelectedAttachment({
          mediaId: _id,
          url,
          originalName: originalName || file.name,
          mimetype: mimetype || file.type
        });
      } else {
        pushToast({ message: 'Failed to upload file. Invalid response format.', type: 'error' });
      }
    } catch (err) {
      console.error('Upload error:', err);
      pushToast({ message: 'Failed to upload file.', type: 'error' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  const deleteFile = async (fileId) => {
    try {
      await mediaAPI.deleteFile(fileId);
      if (selectedAttachment?.mediaId === fileId) {
        setSelectedAttachment(null);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      pushToast({ message: 'Failed to delete file.', type: 'error' });
    }
  }
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        openLogoutModal={() => setLogoutModalOpen(true)}
        openModal={openSettingsModal}
      />
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
            <h1 className="text-lg font-medium text-gray-900">
              {currentChatId ? 'Chat' : 'New Chat'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {user?.fullName || 'User'}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-h-0 ${messages.length === 0 ? 'justify-center' : ''}`}>
          {/* Welcome Text */}
          {messages.length === 0 && (
            <div className="w-full max-w-3xl mx-auto text-center px-4 mb-8">
              <h2 className="text-2xl font-medium text-gray-800">
                Hey {user?.firstName || user?.name || user?.username || 'User'}, what's on your mind?
              </h2>
            </div>
          )}

          {/* Messages Container */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.isBot || message.sender === 'ai' ? '' : 'flex-row-reverse'
                      }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.isBot || message.sender === 'ai'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                        }`}
                    >
                      {message.isBot || message.sender === 'ai' ? (
                        <Bot size={16} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`flex-1 max-w-2xl ${message.isBot || message.sender === 'ai' ? '' : 'flex flex-col items-end'
                        }`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl ${message.isBot || message.sender === 'ai'
                          ? 'bg-white border border-gray-200 text-gray-900 prose prose-sm max-w-none prose-pre:bg-[#1E1E1E] prose-pre:p-0 overflow-hidden'
                          : 'bg-blue-600 text-white'
                          }`}
                      >
                        {message.isBot || message.sender === 'ai' ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <div className="rounded-md overflow-hidden bg-[#1E1E1E] my-2">
                                    <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 text-xs text-gray-300">
                                      <span>{match[1]}</span>
                                      <button
                                        onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                        className="hover:text-white transition-colors flex items-center gap-1"
                                      >
                                        <Copy size={12} />
                                        Copy Code
                                      </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <SyntaxHighlighter
                                        {...props}
                                        children={String(children).replace(/\n$/, '')}
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <code {...props} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-pink-600">
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {message.attachments.map((file, idx) => (
                                  <div key={idx} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg w-max max-w-full">
                                    <Paperclip size={16} />
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline truncate">
                                      {file.originalName}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.text}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Message Actions (only for bot messages) */}
                      {(message.isBot || message.sender === 'ai') && (
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => handleCopy(message.id, message.text)}
                            className="p-1 rounded hover:bg-gray-100 cursor-pointer"
                            title="Copy message"
                          >
                            {copiedId === message.id
                              ? <Check size={14} className="text-green-500" />
                              : <Copy size={14} className="text-gray-400" />
                            }
                          </button>
                          <button
                            className="p-1 rounded hover:bg-gray-100 cursor-pointer"
                            title="Good response"
                          >
                            <ThumbsUp size={14} className="text-gray-400" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-gray-100 cursor-pointer"
                            title="Bad response"
                          >
                            <ThumbsDown size={14} className="text-gray-400" />
                          </button>
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                      <Bot size={16} />
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                        <div className="flex gap-1">
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
          )}

          {/* Input Area */}
          <div className={messages.length === 0 ? 'w-full px-4' : 'border-t border-gray-200 bg-white px-4 py-4'}>
            <div className={messages.length === 0 ? 'max-w-3xl mx-auto w-full' : 'max-w-3xl mx-auto'}>
              {/* Model Selection UI */}
              {availableModels && Object.keys(availableModels).length > 0 && (
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedProvider}
                    onChange={(e) => {
                      const newProvider = e.target.value;
                      setSelectedProvider(newProvider);
                      setSelectedModelId(availableModels[newProvider]?.defaultModel || '');
                    }}
                    className="text-xs bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(availableModels).map(([key, provider]) => (
                      <option
                        key={key}
                        value={key}
                        disabled={provider.tier !== 'free' && !user?.hasActiveSubscription}
                        className={`${provider.tier !== 'free' && !user?.hasActiveSubscription ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {provider.label}
                      </option>
                    ))}
                  </select>

                  {availableModels[selectedProvider]?.models && (
                    <select
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      className="text-xs bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 max-w-[200px] truncate"
                    >
                      {availableModels[selectedProvider].models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {selectedAttachment && (
                <div className="mb-3 p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between w-max max-w-full shadow-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Paperclip size={16} />
                    </div>
                    <div className="truncate text-sm font-medium text-gray-700 max-w-[200px]">
                      {selectedAttachment.originalName}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFile(selectedAttachment.mediaId)}
                    className="ml-4 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {isUploading && (
                <div className="mb-3 p-2 text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span>Uploading file...</span>
                </div>
              )}
              <div className={`relative flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${messages.length === 0 ? 'shadow-sm' : ''}`}>
                <label
                  className={`mb-2 ml-2 p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${selectedAttachment || isUploading ? 'text-gray-300 pointer-events-none' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-200'}`}
                  title={selectedAttachment ? 'Only one file allowed' : 'Attach file'}
                >
                  <Paperclip size={20} />
                  <input type="file" className="hidden" onChange={handleFileChange} disabled={!!selectedAttachment || isUploading} />
                </label>
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message AI Assistant..."
                  className="flex-1 min-h-[44px] max-h-32 py-3 px-2 bg-transparent border-none outline-none resize-none placeholder-gray-500"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '44px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                  disabled={isTyping}
                />
                {isTyping ? (
                  <button
                    onClick={stopStream}
                    className="m-2 p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    title="Stop generating"
                  >
                    <Square size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isUploading}
                    className="m-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => logout()}
        title="Confirm Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
      />
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => {
          setSettingsModalOpen(false);
          setActiveSettingsTab(null);
        }}
      >
        {activeSettingsTab === 'profile' && (
          <UserProfile
            onClose={() => {
              setSettingsModalOpen(false);
              setActiveSettingsTab(null);
            }}
          />
        )}
        {activeSettingsTab === 'password-change' && (
          <ChangePassword
            onClose={() => {
              setSettingsModalOpen(false);
              setActiveSettingsTab(null);
            }}
          />
        )}
        {activeSettingsTab === 'subscription' && (
          <SubscriptionDetails
            onClose={() => {
              setSettingsModalOpen(false);
              setActiveSettingsTab(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ChatBot;