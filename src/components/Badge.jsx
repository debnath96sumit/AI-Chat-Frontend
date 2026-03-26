const Badge = ({ children, variant = "default" }) => {
    const variants = {
        default: "bg-white/5 text-gray-400 border border-white/10",
        active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        canceled: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        pro: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        current: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${variants[variant]}`}>
            {children}
        </span>
    );
};

export default Badge;