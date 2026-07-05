import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { ToastContext } from "../context/ToastContext";

const kieuToast = {
    success: {
        icon: "✓",
        wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
        iconClass: "bg-emerald-500 text-white",
    },
    error: {
        icon: "!",
        wrapper: "border-red-200 bg-red-50 text-red-900",
        iconClass: "bg-red-500 text-white",
    },
    warning: {
        icon: "!",
        wrapper: "border-amber-200 bg-amber-50 text-amber-900",
        iconClass: "bg-amber-500 text-white",
    },
    info: {
        icon: "i",
        wrapper: "border-blue-200 bg-blue-50 text-blue-900",
        iconClass: "bg-blue-500 text-white",
    },
};

function ToastItem({ toast, onClose }) {
    const kieu = kieuToast[toast.type] || kieuToast.info;

    return (
        <div
            className={[
                "pointer-events-auto flex w-full max-w-sm gap-3 rounded-2xl border px-4 py-3 shadow-2xl shadow-slate-950/15",
                "animate-[toast-in_180ms_ease-out]",
                kieu.wrapper,
            ].join(" ")}
        >
            <span
                className={[
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black",
                    kieu.iconClass,
                ].join(" ")}
            >
                {kieu.icon}
            </span>
            <div className="min-w-0 flex-1">
                {toast.title && (
                    <p className="text-sm font-extrabold leading-5">
                        {toast.title}
                    </p>
                )}
                {toast.message && (
                    <p className="text-sm font-semibold leading-5">
                        {toast.message}
                    </p>
                )}
            </div>
            <button
                type="button"
                onClick={() => onClose(toast.id)}
                className="rounded-full px-2 text-lg font-bold leading-none opacity-60 transition hover:opacity-100"
                aria-label="Đóng thông báo"
            >
                ×
            </button>
        </div>
    );
}

function ToastViewport({ toasts, onClose }) {
    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }

        setToasts((danhSachCu) =>
            danhSachCu.filter((toast) => toast.id !== id),
        );
    }, []);

    const showToast = useCallback(
        ({ type = "info", title = "", message = "", duration = 3000 }) => {
            if (!title && !message) return null;

            const id = `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

            setToasts((danhSachCu) => [
                ...danhSachCu,
                { id, type, title, message, duration },
            ].slice(-4));

            timersRef.current[id] = setTimeout(() => {
                removeToast(id);
            }, duration);

            return id;
        },
        [removeToast],
    );

    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            Object.values(timers).forEach(clearTimeout);
        };
    }, []);

    const value = useMemo(
        () => ({
            showToast,
            success: (message, options = {}) =>
                showToast({ ...options, message, type: "success" }),
            error: (message, options = {}) =>
                showToast({ ...options, message, type: "error" }),
            warning: (message, options = {}) =>
                showToast({ ...options, message, type: "warning" }),
            info: (message, options = {}) =>
                showToast({ ...options, message, type: "info" }),
            removeToast,
        }),
        [removeToast, showToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
}
