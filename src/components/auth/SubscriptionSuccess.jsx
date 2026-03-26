import { useEffect, useState } from "react";
import { subscriptionAPI } from "../../utils/api";
import Badge from "../Badge";
import Spinner from "../Spinner";
import { formatDate } from "../../utils/helpers";

export default function SubscriptionSuccessPage() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    useEffect(() => {
        (async () => {
            await new Promise((r) => setTimeout(r, 800));
            const res = await subscriptionAPI.subscriptionSuccess(sessionId);
            const active = res.data;
            setSubscription(active);
            setLoading(false);
        })();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
            <div className="w-full max-w-md text-center">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Spinner size="lg" />
                        <p className="text-gray-400 text-sm">Confirming your subscription…</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-4xl">
                                ✓
                            </div>
                        </div>

                        <p className="text-xs font-semibold tracking-widest text-green-400 uppercase mb-3">
                            Payment confirmed
                        </p>
                        <h1 className="text-3xl font-bold mb-3">Welcome to Pro</h1>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Your subscription is active. All Pro features are unlocked and ready to use.
                        </p>

                        {subscription && (
                            <div className="bg-gray-900 border border-white/10 rounded-xl p-5 mb-8 text-left">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-semibold">{subscription.plan_details.name}</span>
                                    <Badge variant="active">Active</Badge>
                                </div>
                                <div className="h-px bg-white/10 mb-4" />
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Next billing date</span>
                                    <span className="text-white">{formatDate(subscription.currentPeriodEnd)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Link to="/new"
                                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                            >
                                Start chatting →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}