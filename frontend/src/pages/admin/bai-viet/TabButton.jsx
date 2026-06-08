function TabButton({ dangMo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2 text-sm font-semibold transition",
        dangMo ? "bg-blue-600 text-white" : "text-white/75 hover:bg-white/5",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default TabButton;
