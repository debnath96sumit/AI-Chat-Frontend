const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 text-white w-full max-w-md rounded-xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-3">{title}</h3>
                <p className="text-sm text-gray-400 mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;