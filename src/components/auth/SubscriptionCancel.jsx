export default function SubscriptionCancelPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
            <div className="w-full max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl text-red-400">
                        ✕
                    </div>
                </div>

                <p className="text-xs font-semibold tracking-widest text-red-400 uppercase mb-3">
                    Checkout cancelled
                </p>
                <h1 className="text-3xl font-bold mb-3">No charge made</h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    You cancelled the checkout. Your account has not been charged and no subscription was created.
                </p>

                <div className="bg-gray-900 border border-white/10 rounded-xl p-4 mb-8">
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Changed your mind? You can upgrade to Pro anytime. Your free account and all your chats are still here.
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <a
                        href="/plans"
                        className="px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-sm font-semibold transition-colors"
                    >
                        Try again →
                    </a>
                    <a
                        href="/new"
                        className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold transition-colors border border-white/10"
                    >
                        Back to chat
                    </a>
                </div>
            </div>
        </div>
    );
}
