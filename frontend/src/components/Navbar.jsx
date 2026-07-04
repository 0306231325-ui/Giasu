import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThongBaoDropdown from "./ThongBaoDropdown";

function Navbar() {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    const avatarUrl = layUrlAnhDaiDien(user?.anh_dai_dien);
    const laTaiKhoanGiaSu = user?.vai_tro === "giasu";
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target)
            ) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-between bg-gray-900 px-10 py-6 text-white">
            <Link
                to="/"
                className="text-3xl font-bold transition hover:text-blue-400"
            >
                DATN_GIASU
            </Link>

            <nav className="flex items-center gap-10 text-gray-300">
                <Link to="/home" className="transition hover:text-white">
                    Trang Chủ
                </Link>

                <Link to="/gia-su" className="transition hover:text-white">
                    Danh Sách Gia Sư
                </Link>

                {!laTaiKhoanGiaSu && (
                    <Link
                        to="/dang-ky-lam-gia-su"
                        className="transition hover:text-white"
                    >
                        Đăng Ký Làm Gia Sư
                    </Link>
                )}

                <Link to="/bai-viet" className="transition hover:text-white">
                    Bài viết
                </Link>

                <Link to="/gioi-thieu" className="transition hover:text-white">
                    Giới Thiệu
                </Link>
            </nav>

            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        <ThongBaoDropdown
                            moTaRong={
                                user?.vai_tro === "giasu"
                                    ? "Các cập nhật về hồ sơ, lịch dạy và yêu cầu đặt gia sư sẽ hiển thị tại đây."
                                    : "Các cập nhật về đặt lịch, thanh toán và buổi học sẽ hiển thị tại đây."
                            }
                        />

                        <div className="relative" ref={userDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setUserDropdownOpen((prev) => !prev)}
                                className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/70 px-4 py-2 text-left transition hover:border-blue-500 hover:bg-gray-800"
                                aria-expanded={userDropdownOpen}
                                aria-haspopup="menu"
                            >
                                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-blue-500 text-sm font-bold text-white">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
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
                        </div>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="px-5 py-2 transition hover:text-blue-400"
                        >
                            Đăng Nhập
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-xl bg-blue-500 px-5 py-2 transition hover:bg-blue-600"
                        >
                            Đăng Ký
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}

function layUrlAnhDaiDien(duongDan) {
    if (!duongDan) return "";
    if (/^https?:\/\//i.test(duongDan)) return duongDan;

    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
    const publicBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

    return `${publicBaseUrl}/${String(duongDan).replace(/^\/+/, "")}`;
}

export default Navbar;
