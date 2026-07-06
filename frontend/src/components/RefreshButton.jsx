function RefreshButton({
    onClick,
    label = "Làm mới",
    loading = false,
    className = "",
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className={[
                "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60",
                className,
            ].join(" ")}
        >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            {label}
        </button>
    );
}

export default RefreshButton;
