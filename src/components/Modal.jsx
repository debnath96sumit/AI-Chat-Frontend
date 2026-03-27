import { X } from 'lucide-react';
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-800 text-white w-full max-w-lg rounded-xl shadow-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-slate-700 border border-slate-600 hover:bg-slate-600 text-gray-400 hover:text-white transition-colors flex items-center justify-center shadow-lg"
                >
                    <X size={14} />
                </button>

                {children}
            </div>
        </div>
    );
};

export default Modal;