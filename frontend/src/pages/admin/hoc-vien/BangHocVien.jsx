import NhanTrangThaiHocVien from "./NhanTrangThaiHocVien";

function BangHocVien({
  danhSachHocVien,
  dangTai,
  loi,
  thongBao,
  dangCapNhatId,
  xuLyChuyenTrangThai,
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#0a0f24]">
      {thongBao ? (
        <div className="border-b border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {thongBao}
        </div>
      ) : null}

      {loi ? (
        <div className="p-5 text-sm text-red-200">{loi}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-white/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Học viên</th>
                <th className="px-4 py-3 font-semibold">Liên hệ</th>
                <th className="px-4 py-3 font-semibold">Lớp / trường</th>
                <th className="px-4 py-3 font-semibold">Phụ huynh</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dangTai ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-white/70">
                    Đang tải danh sách học viên...
                  </td>
                </tr>
              ) : danhSachHocVien.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-white/70">
                    Không có tài khoản học viên phù hợp.
                  </td>
                </tr>
              ) : (
                danhSachHocVien.map((hocVien) => (
                  <HangHocVien
                    key={hocVien.id}
                    hocVien={hocVien}
                    dangCapNhat={dangCapNhatId === hocVien.id}
                    xuLyChuyenTrangThai={xuLyChuyenTrangThai}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HangHocVien({ hocVien, dangCapNhat, xuLyChuyenTrangThai }) {
  return (
    <tr className="align-top hover:bg-white/[0.03]">
      <td className="px-4 py-4">
        <div className="font-semibold text-white">{hocVien.ho_ten}</div>
        <div className="mt-1 text-xs text-white/50">ID: {hocVien.id}</div>
      </td>
      <td className="px-4 py-4 text-white/75">
        <div>{hocVien.email}</div>
        <div className="mt-1">{hocVien.sdt || "Chưa cập nhật SĐT"}</div>
      </td>
      <td className="px-4 py-4 text-white/75">
        <div>{hocVien.hocvien?.lop || "Chưa cập nhật lớp"}</div>
        <div className="mt-1 text-white/50">
          {hocVien.hocvien?.truong_hoc || "Chưa cập nhật trường"}
        </div>
      </td>
      <td className="px-4 py-4 text-white/75">
        <div>{hocVien.hocvien?.ten_phu_huynh || "Chưa cập nhật"}</div>
        <div className="mt-1 text-white/50">
          {hocVien.hocvien?.sdt_phu_huynh || "Chưa có SĐT"}
        </div>
      </td>
      <td className="px-4 py-4">
        <NhanTrangThaiHocVien trangThai={hocVien.trang_thai} />
      </td>
      <td className="px-4 py-4">
        <button
          type="button"
          disabled={dangCapNhat}
          onClick={() => xuLyChuyenTrangThai(hocVien)}
          className={[
            "min-w-24 rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
            hocVien.trang_thai === "hoatdong"
              ? "bg-red-500/15 text-red-100 hover:bg-red-500/25"
              : "bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25",
          ].join(" ")}
        >
          {dangCapNhat
            ? "Đang lưu"
            : hocVien.trang_thai === "hoatdong"
              ? "Khóa"
              : "Mở khóa"}
        </button>
      </td>
    </tr>
  );
}

export default BangHocVien;
