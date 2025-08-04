import {MoreHorizontal, Plus, Settings, MessageSquare } from 'lucide-react';
const Sidebar = ({sidebarOpen, setSidebarOpen})=>{
    
    const conversations = [
        { id: 1, title: "Getting Started", active: true },
        { id: 2, title: "React Development Help" },
        { id: 3, title: "API Integration Questions" },
        { id: 4, title: "Design System Planning" }
    ];
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
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors">
              <Plus size={16} />
              New chat
            </button>
          </div>

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

          <div className="p-4 border-t border-gray-700">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </div>
    )
}
export default Sidebar;