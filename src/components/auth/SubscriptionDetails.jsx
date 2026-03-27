import React, { useEffect, useState } from 'react';
import { MoreVertical, Calendar, ShieldCheck, Zap } from 'lucide-react';
import { subscriptionAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../Badge';
import Spinner from '../Spinner';
import { formatDate } from '../../utils/helpers';
import ConfirmModal from '../ConfirmModal';

const SubscriptionDetails = ({ onClose }) => {
    const { refreshUser } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [canceling, setCanceling] = useState(false);

    const fetchSubscription = async () => {
        setLoading(true);
        try {
            const res = await subscriptionAPI.getMySubscription();
            // Assuming res.data is an array of subscriptions, take the active one
            const active = res.data?.find(s => s.status === 'active' || s.status === 'trialing') || res.data?.[0];
            setSubscription(active);
        } catch (err) {
            console.error('Error fetching subscription:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    const handleCancel = async () => {
        if (!subscription?._id) return;
        setCanceling(true);
        try {
            await subscriptionAPI.cancelSubscription();
            await fetchSubscription();
            await refreshUser();
            setCancelModalOpen(false);
        } catch (err) {
            console.error('Error canceling subscription:', err);
        } finally {
            setCanceling(false);
            setShowMenu(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-20">
                <Spinner size="md" />
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="text-center p-10 bg-slate-800 rounded-2xl border border-slate-700">
                <p className="text-gray-400 mb-4">No active subscription found.</p>
                <button
                    onClick={() => {
                        onClose();
                        window.location.href = '/plans';
                    }}
                    className="px-6 py-2 bg-blue-600 rounded-lg text-white text-sm font-semibold hover:bg-blue-500 transition-colors"
                >
                    View Plans
                </button>
            </div>
        );
    }

    const plan = subscription.plan_details;
    const isCanceled = subscription.cancelAtPeriodEnd;

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 relative">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-500" size={20} />
                        Subscription Details
                    </h2>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                                    <button
                                        onClick={() => setCancelModalOpen(true)}
                                        disabled={isCanceled}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCanceled ? 'Cancellation Pending' : 'Cancel Subscription'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Plan Card (Reusing Plans.jsx logic/style) */}
                <div className="bg-slate-900 border border-white/10 rounded-xl p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Current Plan</p>
                                <h3 className="text-white font-bold">{plan.name}</h3>
                            </div>
                        </div>
                        <Badge variant={subscription.status === 'active' ? 'active' : 'canceled'}>
                            {subscription.status}
                        </Badge>
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-2">
                                <Calendar size={14} />
                                {isCanceled ? 'Ends on' : 'Next billing date'}
                            </span>
                            <span className="text-white font-medium">
                                {formatDate(subscription.currentPeriodEnd)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-2">
                                <ShieldCheck size={14} /> Status
                            </span>
                            <span className={`${isCanceled ? 'text-yellow-500' : 'text-emerald-500'} font-medium`}>
                                {isCanceled ? 'Canceled (Active until end)' : 'Auto-renewing'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Manage your payment methods and billing history on Stripe.
                    </p>
                </div>
            </div>

            <ConfirmModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleCancel}
                title="Cancel Subscription"
                message="Are you sure you want to cancel your subscription? You will still have access to Pro features until the end of your current billing period."
                confirmText={canceling ? "Canceling..." : "Yes, Cancel"}
                isLoading={canceling}
            />
        </div>
    );
};

export default SubscriptionDetails;
