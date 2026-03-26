const Spinner = ({ size = "sm" }) => (
    <div
        className={`rounded-full border-2 border-white/20 border-t-white animate-spin ${size === "sm" ? "w-4 h-4" : "w-8 h-8 border-[3px]"
            }`}
    />
);

export default Spinner;