import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    const [monHocs, setMonHocs] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userDropdownRef = useRef(null);

    useEffect(() => {
        const fetchMonHoc = async () => {
            try {
                const response = await api.get("/mon-hoc");
                if (response.data.success) {
                    setMonHocs(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải môn học cho menu:", error);
            }
        };

        fetchMonHoc();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }

            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(e.target)
            ) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex justify-between items-center px-10 py-6 bg-gray-900 text-white">
            <Link
                to="/"
                className="text-3xl font-bold hover:text-blue-400 transition"
            >
                DATN_GIASU
            </Link>

            <nav className="flex gap-10 text-gray-300 items-center">
                <Link to="/home" className="hover:text-white transition">
                    Trang Chủ
                </Link>

                <Link to="/gia-su" className="hover:text-white transition">
                    Gia Sư
                </Link>

                <Link
                    to="/dang-ky-lam-gia-su"
                    className="hover:text-white transition"
                >
                    Đăng Ký Làm Gia Sư
                </Link>

                <div
                    className="relative flex items-center gap-1"
                    ref={dropdownRef}
                >
                    <Link
                        to="/mon-hoc"
                        className="hover:text-white transition"
                    >
                        Môn Học
                    </Link>

                    <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="text-xs hover:text-white transition px-1"
                        aria-label="Mở danh sách môn học"
                    >
                        <span
                            className={`inline-block transition-transform duration-200 ${
                                dropdownOpen ? "rotate-180" : ""
                            }`}
                        >
                            ▾
                        </span>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="max-h-[200px] overflow-y-auto">
                                {monHocs.length === 0 ? (
                                    <p className="px-4 py-3 text-sm text-gray-400">
                                        Chưa có môn học
                                    </p>
                                ) : (
                                    monHocs.map((mon) => (
                                        <Link
                                            key={mon.id}
                                            to={`/mon-hoc?mon=${mon.id}`}
                                            onClick={() =>
                                                setDropdownOpen(false)
                                            }
                                            className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-700 hover:text-white transition border-b border-gray-700/50 last:border-0"
                                        >
                                            {mon.ten_mon}
                                        </Link>
                                    ))
                                )}
                            </div>

                            <Link
                                to="/mon-hoc"
                                onClick={() => setDropdownOpen(false)}
                                className="block px-4 py-2.5 text-sm text-center text-blue-400 hover:bg-gray-700 font-semibold border-t border-gray-700"
                            >
                                Xem tất cả môn học
                            </Link>
                        </div>
                    )}
                </div>

                <Link to="/gioi-thieu" className="hover:text-white transition">
                    Giới Thiệu
                </Link>
            </nav>

            <div className="flex gap-4 items-center">
                {isAuthenticated ? (
                    <div className="relative" ref={userDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setUserDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/70 px-4 py-2 text-left transition hover:border-blue-500 hover:bg-gray-800"
                            aria-expanded={userDropdownOpen}
                            aria-haspopup="menu"
                        >
                            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-blue-500 text-sm font-bold text-white">
                                {user?.anh_dai_dien ? (
                                    <img
                                        src={user.anh_dai_dien}
                                        alt="Ảnh đại diện"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    (user?.ho_ten || "HV").trim().charAt(0).toUpperCase()
                                )}
                            </span>
                            <span className="min-w-0">
                                <span className="block max-w-36 truncate text-sm font-semibold text-white">
                                    {user?.ho_ten}
                                </span>
                                <span className="block text-xs uppercase text-blue-300">
                                    {user?.vai_tro}
                                </span>
                            </span>
                            <span
                                className={`text-xs text-gray-300 transition-transform ${
                                    userDropdownOpen ? "rotate-180" : ""
                                }`}
                            >
                                ▾
                            </span>
                        </button>

                        {userDropdownOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-2xl"
                            >
                                <div className="border-b border-gray-700 px-4 py-3">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {user?.ho_ten}
                                    </p>
                                    <p className="mt-1 truncate text-xs text-gray-400">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="py-2">
                                    {user?.vai_tro === "hocvien" && (
                                        <>
                                            <Link
                                                to="/hoc-vien/lich-hoc"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-gray-700 hover:text-white"
                                            >
                                                Lịch học của tôi
                                            </Link>
                                            <Link
                                                to="/hoc-vien/ho-so"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-gray-700 hover:text-white"
                                            >
                                                Hồ sơ học viên
                                            </Link>
                                        </>
                                    )}

                                    {user?.vai_tro === "giasu" && (
                                        <Link
                                            to="/gia-su/quan-ly/ho-so"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-gray-700 hover:text-white"
                                        >
                                            Hồ sơ gia sư
                                        </Link>
                                    )}

                                    {user?.vai_tro === "admin" && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-gray-700 hover:text-white"
                                        >
                                            Trang quản trị
                                        </Link>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        setUserDropdownOpen(false);
                                        await logout();
                                        navigate("/login");
                                    }}
                                    className="block w-full border-t border-gray-700 px-4 py-2.5 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>                ) : (
                    <>
                        <Link
                            to="/login"
                            className="px-5 py-2 hover:text-blue-400 transition"
                        >
                            Đăng Nhập
                        </Link>

                        <Link
                            to="/register"
                            className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-xl transition"
                        >
                            Đăng Ký
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}

export default Navbar;
