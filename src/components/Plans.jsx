import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { subscriptionAPI } from "../utils/api";
import Spinner from "./Spinner";
import Badge from "./Badge";
import { useAuth } from "../context/AuthContext";


export default function PlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(null);
    const [currentTier, setCurrentTier] = useState("free");
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const [plansRes, subRes] = await Promise.all([subscriptionAPI.getPlans(), subscriptionAPI.getMySubscription()]);
                setPlans(plansRes.data);
                if (subRes.data.length > 0) {
                    const active = subRes.data?.find((s) => s.status === "active");
                    if (active) setCurrentTier(active.plan_details.tier);
                }
            } catch (error) {
                console.error("Error fetching plans:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleCheckout = async (plan) => {
        if (plan.tier === "free" || currentTier === plan.tier) return;
        setCheckoutLoading(plan._id);
        try {
            const res = await subscriptionAPI.createCheckout(plan._id);
            if (res.data?.url) {
                window.location.href = res.data.url;
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCheckoutLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-16 relative">
            {/* Close Button */}
            <button
                onClick={() => navigate("/new")}
                className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all group border border-white/10 cursor-pointer"
                title="Close"
            >
                <X size={28} className="group-hover:scale-110 transition-transform" />
            </button>

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-xs font-semibold tracking-widest text-yellow-500/80 uppercase mb-3">Pricing</p>
                    <h1 className="text-4xl font-bold mb-3">
                        {user?.hasActiveSubscription ? "Manage your subscription" : "Choose your plan"}
                    </h1>
                    <p className="text-gray-400 text-base">
                        {user?.hasActiveSubscription
                            ? "Scale your usage as your needs grow."
                            : "Start free. Upgrade when you need more."}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="sm" />
                    </div>
                ) : (
                    <div className={`flex flex-wrap gap-6 ${plans.length === 1 ? 'justify-center' : 'grid grid-cols-1 md:grid-cols-2'}`}>
                        {plans.map((plan) => {
                            const isPro = plan.tier === "pro";
                            const isCurrent = plan.tier === currentTier;

                            return (
                                <div
                                    key={plan._id}
                                    className={`relative rounded-xl p-6 flex flex-col w-1/2 ${isPro
                                        ? "bg-gray-900 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]"
                                        : "bg-gray-900 border border-white/10"
                                        }`}
                                >
                                    {isPro && (
                                        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
                                    )}

                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant={isPro ? "pro" : "default"}>
                                                    {isPro ? "⚡ Pro" : "Free"}
                                                </Badge>
                                                {isCurrent && <Badge variant="current">Current</Badge>}
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-5xl font-bold ${isPro ? "text-yellow-400" : "text-white"}`}>
                                                    ${plan.price}
                                                </span>
                                                {isPro && <span className="text-gray-400 text-sm">/ mo</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10 mb-5" />

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm">
                                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${isPro ? "bg-yellow-500/15 text-yellow-400" : "bg-white/10 text-gray-400"
                                                    }`}>
                                                    ✓
                                                </span>
                                                <span className={isPro ? "text-gray-200" : "text-gray-400"}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleCheckout(plan)}
                                        disabled={isCurrent || !!checkoutLoading}
                                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isPro
                                            ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-white/10"
                                            }`}
                                    >
                                        {checkoutLoading === plan._id ? (
                                            <Spinner />
                                        ) : isCurrent ? (
                                            "Your current plan"
                                        ) : isPro ? (
                                            "Upgrade to Pro →"
                                        ) : (
                                            "Get started free"
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="text-center mt-8 text-gray-600 text-xs">
                    Payments powered by Stripe · Cancel anytime · No hidden fees
                </p>
            </div>
        </div>
    );
}