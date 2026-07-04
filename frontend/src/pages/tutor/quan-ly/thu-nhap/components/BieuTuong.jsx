function BieuTuong({ ten }) {
    const duongNet = {
        wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" /><path d="M15 11h7v4h-7a2 2 0 0 1 0-4Z" /></>,
        calendar: <><path d="M4 5h16v16H4zM8 2v6M16 2v6M4 10h16" /><path d="m9 15 2 2 4-4" /></>,
        download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
        info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
        >
            {duongNet[ten]}
        </svg>
    );
}

export default BieuTuong;
