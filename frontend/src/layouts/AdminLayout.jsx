import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ThongBaoDropdown from "../components/ThongBaoDropdown";
import { useAuth } from "../context/AuthContext";
import useAdminDemCanXuLy from "../hooks/useAdminDemCanXuLy";

function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const isAdmin = user?.vai_tro === "admin";
  const { dem: demCanXuLy, taiSoLuong: taiDemCanXuLy } = useAdminDemCanXuLy({
    kichHoat: isAdmin,
  });
  const lamMoiTrangAdmin = () => {
    window.dispatchEvent(new CustomEvent("admin:refresh"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1026] text-white flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1026] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-white/10 bg-[#0a0f24]">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="text-xl font-extrabold tracking-wide">
            ADMIN | CDTH23 WEBC
          </div>
          <div className="mt-2 text-sm text-white/70">
            {isAdmin ? (
              <>
                Xin chào,{" "}
                <span className="text-white font-semibold">{user?.ho_ten}</span>
              </>
            ) : (
              "Bạn chưa đăng nhập admin"
            )}
          </div>
        </div>

        <nav className="p-3 space-y-1">
          <NavItem to="/admin" end label="Trang chủ" />
          <NavItem to="/admin/hoc-vien" label="Tài khoản học viên" badge={demCanXuLy.hocVien} />
          <NavItem to="/admin/gia-su" label="Tài khoản gia sư" badge={demCanXuLy.giaSu} />
          <NavItem to="/admin/danh-muc" label="Môn học" badge={demCanXuLy.danhMuc} />
          <NavItem to="/admin/quan-ly-dat-goi" label="Quản lý đặt gói" badge={demCanXuLy.datGoi} />
          <NavItem to="/admin/lich-hoc" label="Quản lý lịch học" badge={demCanXuLy.lichHoc} />
          <NavItem to="/admin/bai-viet" label="Bài viết" badge={demCanXuLy.baiViet} />
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="w-full px-4 py-2 rounded-xl border border-white/15 hover:bg-white/5 transition text-sm"
          >
            Đăng xuất
          </button>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="w-full mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-semibold"
          >
            Về trang người dùng
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <header className="h-16 flex items-center justify-between gap-4 px-6 border-b border-white/10 bg-[#0a0f24]">
          <div className="text-sm text-white/70">
            {isAdmin ? "Quản trị hệ thống" : "Chỉ admin mới được dùng trang này"}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <ThongBaoDropdown
                tieuDe="Thông báo admin"
                moTaRong="Các yêu cầu xét duyệt, đặt gói, thanh toán và lịch học cần xử lý sẽ hiển thị tại đây."
              />
              <button
                type="button"
                onClick={lamMoiTrangAdmin}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white"
              >
                <span>↻</span>
                Làm mới
              </button>
            </div>
          )}
        </header>

        <main className="p-6">
          {!isAdmin ? (
            <div className="max-w-2xl bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
              <div className="font-bold text-red-200">Không có quyền</div>
              <div className="mt-1 text-sm text-white/80">
                Bạn cần đăng nhập bằng tài khoản admin để truy cập trang quản trị.
              </div>
            </div>
          ) : (
            <Outlet context={{ demCanXuLy, taiDemCanXuLy }} />
          )}
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, end, label, badge = 0 }) {
  const labelHienThi = to === "/admin/danh-muc" ? "Danh mục hệ thống" : label;
  const coBadge = Number(badge || 0) > 0;

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition",
          isActive
            ? "bg-blue-600 text-white"
            : "text-white/80 hover:bg-white/5 hover:text-white",
        ].join(" ")
      }
    >
      <span className="min-w-0 truncate">{labelHienThi}</span>
      {coBadge && (
        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-amber-400/20 px-1.5 text-[11px] font-extrabold leading-none text-amber-300">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default AdminLayout;

