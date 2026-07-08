import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RefreshButton from "../components/RefreshButton";
import ThongBaoDropdown from "../components/ThongBaoDropdown";
import useGiaSuDemCanXuLy from "../hooks/useGiaSuDemCanXuLy";

function GiaSuLayout() {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();
    const laGiaSu = user?.vai_tro === "giasu";
    const { dem: demCanXuLy } = useGiaSuDemCanXuLy({ kichHoat: laGiaSu });

    const lamMoiTrangGiaSu = () => {
        window.dispatchEvent(new CustomEvent("giasu:refresh"));
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07112f] text-white">
                Đang tải...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#07112f] text-white">
            <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-[#081027]">
                <div className="border-b border-white/10 px-6 py-5">
                    <div className="text-xl font-extrabold tracking-wide">
                        GIA SƯ | 23 WEBC
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                        {laGiaSu ? (
                            <>
                                Xin chào, {" "}
                                <span className="font-semibold text-white">
                                    {user?.ho_ten}
                                </span>
                            </>
                        ) : (
                            "Bạn chưa có quyền gia sư"
                        )}
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-3">
                    <MucDieuHuong to="/gia-su/quan-ly" end label="Tổng quan" />
                    <MucDieuHuong to="/gia-su/quan-ly/ho-so" label="Hồ sơ gia sư" badge={demCanXuLy.hoSo} />
                    <MucDieuHuong to="/gia-su/quan-ly/lich-day" label="Lịch dạy" badge={demCanXuLy.lichDay} />
                    <MucDieuHuong to="/gia-su/quan-ly/thu-nhap" label="Thu nhập" />
                    <MucDieuHuong to="/gia-su/quan-ly/theo-doi-hoat-dong" label="Theo dõi hoạt động" />
                </nav>

                <div className="border-t border-white/10 p-4">
                    <button
                        type="button"
                        onClick={async () => {
                            await logout();
                            navigate("/login");
                        }}
                        className="w-full rounded-xl border border-white/15 px-4 py-2 text-sm transition hover:bg-white/5"
                    >
                        Đăng xuất
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/home")}
                        className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-700"
                    >
                        Về trang người dùng
                    </button>
                </div>
            </aside>

            <div className="min-w-0 flex-1">
                <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#081027] px-6">
                    <div className="text-sm text-white/70">
                        {laGiaSu
                            ? "Quản lý hoạt động dạy học"
                            : "Chỉ tài khoản gia sư mới được dùng khu vực này"}
                    </div>
                    {laGiaSu && (
                        <div className="flex items-center gap-3">
                            <ThongBaoDropdown
                                tieuDe="Thông báo gia sư"
                                moTaRong="Các cập nhật về yêu cầu đặt gia sư, lịch dạy, hồ sơ xét duyệt và thu nhập sẽ hiển thị tại đây."
                            />
                            <RefreshButton onClick={lamMoiTrangGiaSu} />
                        </div>
                    )}
                </header>

                <main className="p-6">
                    {!laGiaSu ? (
                        <div className="max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
                            <div className="font-bold text-amber-100">Chưa có quyền gia sư</div>
                            <div className="mt-1 text-sm text-white/80">
                                Tài khoản cần được duyệt hồ sơ gia sư trước khi truy cập khu vực này.
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/dang-ky-lam-gia-su")}
                                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-700"
                            >
                                Gửi đơn đăng ký gia sư
                            </button>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>
        </div>
    );
}

function MucDieuHuong({ to, end, label, badge }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                [
                    "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                    isActive
                        ? "bg-blue-600 text-white"
                        : "text-white/80 hover:bg-white/5 hover:text-white",
                ].join(" ")
            }
        >
            <span>{label}</span>
            {Number(badge) > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-extrabold text-slate-950">
                    {badge > 9 ? "9+" : badge}
                </span>
            )}
        </NavLink>
    );
}

export default GiaSuLayout;
