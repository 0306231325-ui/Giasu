import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Navbar() {
    const [monHocs, setMonHocs] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex justify-between items-center px-10 py-6 bg-gray-900 text-white">
            <Link to="/" className="text-3xl font-bold hover:text-blue-400 transition">
                DATN_GIASU
            </Link>

            <nav className="flex gap-10 text-gray-300 items-center">
                <Link to="/home" className="hover:text-white transition">
                    Trang Chủ
                </Link>
                <Link to="/gia-su" className="hover:text-white transition">
                    Gia Sư
                </Link>

                <div className="relative flex items-center gap-1" ref={dropdownRef}>
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
                                            onClick={() => setDropdownOpen(false)}
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

            <div className="flex gap-4">
                <button className="px-5 py-2 hover:text-blue-400 transition">
                    Đăng Nhập
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-xl transition">
                    Đăng Ký
                </button>
            </div>
        </header>
    );
}

export default Navbar;
