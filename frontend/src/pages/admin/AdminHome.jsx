function AdminHome() {
  return (
    <div className="space-y-4">
      <div className="text-2xl font-extrabold">Trang chủ Admin</div>
      <div className="text-white/80">
        Đây là trang tổng quan. Hiện tại chỉ dựng layout và điều hướng.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Học viên" desc="Danh sách tài khoản học viên (chưa load dữ liệu)" />
        <Card title="Gia sư" desc="Danh sách tài khoản gia sư (chưa load dữ liệu)" />
        <Card title="Hệ thống" desc="Cấu hình/giá/duyệt (làm sau)" />
      </div>
    </div>
  );
}

function Card({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="font-bold">{title}</div>
      <div className="mt-1 text-sm text-white/75">{desc}</div>
    </div>
  );
}

export default AdminHome;

