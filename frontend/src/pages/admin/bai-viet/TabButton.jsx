function TabButton({ dangMo, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2 text-sm font-semibold transition",
        dangMo ? "bg-blue-600 text-white" : "text-white/75 hover:bg-white/5",
        disabled ? "cursor-not-allowed opacity-45 hover:bg-transparent" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default TabButton;
