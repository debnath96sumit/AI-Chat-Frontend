const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 text-white w-full max-w-lg rounded-xl shadow-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                {children}
            </div>
        </div>
    );
};

export default Modal;