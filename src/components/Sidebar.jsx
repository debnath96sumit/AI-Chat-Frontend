import { MoreHorizontal, Plus, Settings, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { chatAPI } from '../utils/api';
import { Link } from 'react-router-dom';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  openLogoutModal,
  openModal
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await chatAPI.getAllChats(10, 1);
        setChats(res.data.docs);
      } catch (err) {
        console.log(err);
      }
    };

    loadChats();
  }, []);

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">ChatBot AI</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <Link to="/new" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors">
            <Plus size={16} />
            New chat
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group hover:bg-gray-800 ${chat.active ? 'bg-gray-800' : ''
                  }`}
              >
                <MessageSquare size={16} className="text-gray-400" />
                <span className="flex-1 text-sm truncate">{chat.title}</span>
                <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 text-gray-400" />
              </div>
            ))}
          </div>
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
          <div className="absolute bottom-16 left-4 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
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
              className="w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-400 text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
export default Sidebar;