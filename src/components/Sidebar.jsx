import { Search, MoreHorizontal, Plus, Settings, MessageSquare, Pencil, Trash2, Check, X } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { chatAPI } from '../utils/api';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  openLogoutModal,
  openModal
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredChats = useMemo(() => {
    return chats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  const navigate = useNavigate();
  const location = useLocation();

  const loadChats = async (pageNum = 1) => {
    if (pageNum > 1) setIsLoadingMore(true);
    try {
      const limit = 10;
      const res = await chatAPI.getAllChats(limit, pageNum);
      const newChats = res.data.docs;

      if (pageNum === 1) {
        setChats(newChats);
      } else {
        setChats(prev => [...prev, ...newChats]);
      }

      setHasMore(newChats.length === limit);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadChats(1);
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (!isLoadingMore && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadChats(nextPage);
      }
    }
  };

  const handleChatOpen = (chatId) => {
    navigate(`/chat/${chatId}`);
  }

  const handleDelete = async () => {
    if (!chatToDelete) return;
    try {
      await chatAPI.deleteChat(chatToDelete._id);
      setChats(chats.filter(c => c._id !== chatToDelete._id));
      if (location.pathname.includes(chatToDelete._id)) {
        navigate('/new');
      }
      setDeleteModalOpen(false);
      setChatToDelete(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRename = async (chat) => {
    if (!tempTitle.trim()) {
      setRenamingChatId(null);
      return;
    }
    try {
      if (chat.title === tempTitle) {
        setRenamingChatId(null);
        return;
      }
      await chatAPI.renameChat(chat._id, tempTitle);
      setChats(chats.map(c => c._id === chat._id ? { ...c, title: tempTitle } : c));
      setRenamingChatId(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleKeyDown = (e, chat) => {
    if (e.key === 'Enter') {
      handleRename(chat);
    } else if (e.key === 'Escape') {
      setRenamingChatId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">AI Pasta</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <Link
            to="/new"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            New chat
          </Link>
        </div>

        <div className="px-4 pb-3">
          <div className="relative flex items-center bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus-within:border-gray-500 transition-colors">
            <Search size={16} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar" onScroll={handleScroll}>
          <div className="space-y-2">
            {filteredChats.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                No chats found
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group hover:bg-gray-800 ${location.pathname.includes(chat._id) ? 'bg-gray-800' : ''
                    }`}
                  onClick={() => handleChatOpen(chat._id)}
                >
                  <MessageSquare size={16} className="text-gray-400 shrink-0" />
                  {renamingChatId === chat._id ? (
                    <input
                      autoFocus
                      className="flex-1 text-sm bg-gray-700 border border-blue-500 rounded px-1 outline-none"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, chat)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => handleRename(chat)}
                    />
                  ) : (
                    <>
                      <span className="flex-1 text-sm truncate">{chat.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === chat._id ? null : chat._id);
                        }}
                        className="p-1 rounded hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal size={14} className="text-gray-400" />
                      </button>
                    </>
                  )}

                  {activeMenuId === chat._id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[60] py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingChatId(chat._id);
                          setTempTitle(chat.title);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center gap-2"
                      >
                        <Pencil size={14} /> Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatToDelete(chat);
                          setDeleteModalOpen(true);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-400 text-sm flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Settings size={16} />
            Settings
          </button>
        </div>
        {showSettingsMenu && (
          <div className="absolute bottom-16 left-4 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => {
                openModal('profile')
                setShowSettingsMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm" > Profile
            </button>
            <button
              onClick={() => {
                openModal('password-change')
                setShowSettingsMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm" >
              Password
            </button>
            <button
              onClick={() => {
                openLogoutModal()
                setShowSettingsMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-400 text-sm border-t border-gray-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${chatToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}
export default Sidebar;