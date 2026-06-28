function IconAdminGiaSu({ ten, className = "h-5 w-5" }) {
    const net = {
        search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
        clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
        user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
        file: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
        book: <><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></>,
        check: <path d="m5 12 4 4L19 6" />,
        x: <path d="m6 6 12 12M18 6 6 18" />,
        eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
        mail: <><path d="M3 5h18v14H3z" /><path d="m3 6 9 7 9-7" /></>,
        money: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M7 9H5v2M17 15h2v-2" /></>,
        phone: <><path d="M7 3H4v4c0 7 6 13 13 13h4v-3l-5-2-2 2c-3-1-6-4-7-7l2-2z" /></>,
        location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    };
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{net[ten]}</svg>;
}

export default IconAdminGiaSu;
