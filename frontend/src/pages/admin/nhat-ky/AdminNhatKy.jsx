import { useEffect, useMemo, useState } from "react";

const SO_DONG_MOI_TRANG = 10;

const BO_LOC_VAI_TRO = [
  { value: "", label: "Tất cả vai trò" },
  { value: "admin", label: "Admin" },
  { value: "giasu", label: "Gia sư" },
  { value: "hocvien", label: "Học viên" },
];

const BO_LOC_HANH_DONG = [
  { value: "", label: "Tất cả hành động" },
  { value: "tai_khoan", label: "Tài khoản" },
  { value: "ho_so", label: "Duyệt hồ sơ" },
  { value: "dat_goi", label: "Đặt gói" },
  { value: "thanh_toan", label: "Thanh toán" },
  { value: "lich_hoc", label: "Lịch học" },
  { value: "bai_viet", label: "Bài viết" },
  { value: "danh_muc", label: "Danh mục" },
];

const NHOM_HANH_DONG = {
  tai_khoan: ["khoa_tai_khoan", "mo_khoa_tai_khoan"],
  ho_so: [
    "duyet_ho_so_gia_su",
    "tu_choi_ho_so_gia_su",
    "duyet_yeu_cau_chuyen_mon",
    "tu_choi_yeu_cau_chuyen_mon",
  ],
  dat_goi: [
    "dat_goi_hoc",
    "gui_yeu_cau_cho_gia_su",
    "gia_su_dong_y",
    "gia_su_tu_choi",
  ],
  thanh_toan: [
    "gui_minh_chung_thanh_toan",
    "duyet_thanh_toan",
    "tu_choi_thanh_toan",
  ],
  lich_hoc: [
    "tao_lich_hoc",
    "xac_nhan_hoan_thanh_buoi_hoc",
    "huy_buoi_hoc",
    "yeu_cau_doi_buoi",
  ],
  bai_viet: ["tao_bai_viet", "sua_bai_viet", "xoa_bai_viet"],
  danh_muc: ["them_danh_muc", "sua_danh_muc", "xoa_danh_muc"],
};

const NHAN_HANH_DONG = {
  khoa_tai_khoan: "Khóa tài khoản",
  mo_khoa_tai_khoan: "Mở khóa tài khoản",
  duyet_ho_so_gia_su: "Duyệt hồ sơ gia sư",
  tu_choi_ho_so_gia_su: "Từ chối hồ sơ gia sư",
  duyet_yeu_cau_chuyen_mon: "Duyệt yêu cầu chuyên môn",
  tu_choi_yeu_cau_chuyen_mon: "Từ chối yêu cầu chuyên môn",
  dat_goi_hoc: "Đặt gói học",
  gui_yeu_cau_cho_gia_su: "Gửi yêu cầu cho gia sư",
  gia_su_dong_y: "Gia sư đồng ý",
  gia_su_tu_choi: "Gia sư từ chối",
  gui_minh_chung_thanh_toan: "Gửi minh chứng thanh toán",
  duyet_thanh_toan: "Duyệt thanh toán",
  tu_choi_thanh_toan: "Từ chối thanh toán",
  tao_lich_hoc: "Tạo lịch học",
  xac_nhan_hoan_thanh_buoi_hoc: "Xác nhận hoàn thành",
  huy_buoi_hoc: "Hủy buổi học",
  yeu_cau_doi_buoi: "Yêu cầu đổi buổi",
  tao_bai_viet: "Tạo bài viết",
  sua_bai_viet: "Sửa bài viết",
  xoa_bai_viet: "Xóa bài viết",
  them_danh_muc: "Thêm danh mục",
  sua_danh_muc: "Sửa danh mục",
  xoa_danh_muc: "Xóa danh mục",
};

const MOCK_NHAT_KY = [
  {
    id: 1,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "khoa_tai_khoan",
    doi_tuong_id: 12,
    noi_dung: "Admin khóa tài khoản học viên Nguyễn Minh Anh.",
    created_at: "2026-07-06 08:10",
  },
  {
    id: 2,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "mo_khoa_tai_khoan",
    doi_tuong_id: 12,
    noi_dung: "Admin mở khóa tài khoản học viên Nguyễn Minh Anh.",
    created_at: "2026-07-06 08:18",
  },
  {
    id: 3,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "duyet_ho_so_gia_su",
    doi_tuong_id: 5,
    noi_dung: "Admin duyệt hồ sơ gia sư Trần Hồng Kỳ.",
    created_at: "2026-07-06 08:35",
  },
  {
    id: 4,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "tu_choi_ho_so_gia_su",
    doi_tuong_id: 6,
    noi_dung: "Admin từ chối hồ sơ gia sư Lê Công Minh vì hồ sơ chưa rõ.",
    created_at: "2026-07-06 08:45",
  },
  {
    id: 5,
    user_id: 4,
    nguoiThucHien: "Võ Tấn Hiền",
    vai_tro: "hocvien",
    hanh_dong: "dat_goi_hoc",
    doi_tuong_id: 21,
    noi_dung: "Học viên gửi yêu cầu đặt gói Tiếng Anh THPT.",
    created_at: "2026-07-06 09:00",
  },
  {
    id: 6,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "gui_yeu_cau_cho_gia_su",
    doi_tuong_id: 21,
    noi_dung: "Admin gửi yêu cầu đặt gói GH000021 cho gia sư Trần Hồng Kỳ.",
    created_at: "2026-07-06 09:05",
  },
  {
    id: 7,
    user_id: 2,
    nguoiThucHien: "Trần Hồng Kỳ",
    vai_tro: "giasu",
    hanh_dong: "gia_su_dong_y",
    doi_tuong_id: 21,
    noi_dung: "Gia sư đồng ý nhận lớp Tiếng Anh THPT.",
    created_at: "2026-07-06 09:12",
  },
  {
    id: 8,
    user_id: 4,
    nguoiThucHien: "Võ Tấn Hiền",
    vai_tro: "hocvien",
    hanh_dong: "gui_minh_chung_thanh_toan",
    doi_tuong_id: 15,
    noi_dung: "Học viên gửi minh chứng thanh toán cho gói học GH000021.",
    created_at: "2026-07-06 09:30",
  },
  {
    id: 9,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "duyet_thanh_toan",
    doi_tuong_id: 15,
    noi_dung: "Admin xác nhận thanh toán thành công.",
    created_at: "2026-07-06 09:40",
  },
  {
    id: 10,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "tao_lich_hoc",
    doi_tuong_id: 40,
    noi_dung: "Hệ thống tạo lịch học sau khi thanh toán được duyệt.",
    created_at: "2026-07-06 09:42",
  },
  {
    id: 11,
    user_id: 2,
    nguoiThucHien: "Trần Hồng Kỳ",
    vai_tro: "giasu",
    hanh_dong: "xac_nhan_hoan_thanh_buoi_hoc",
    doi_tuong_id: 40,
    noi_dung: "Gia sư xác nhận hoàn thành buổi học Toán Học.",
    created_at: "2026-07-06 10:20",
  },
  {
    id: 12,
    user_id: 4,
    nguoiThucHien: "Võ Tấn Hiền",
    vai_tro: "hocvien",
    hanh_dong: "xac_nhan_hoan_thanh_buoi_hoc",
    doi_tuong_id: 40,
    noi_dung: "Học viên xác nhận đã hoàn thành buổi học.",
    created_at: "2026-07-06 10:25",
  },
  {
    id: 13,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "duyet_yeu_cau_chuyen_mon",
    doi_tuong_id: 8,
    noi_dung: "Admin duyệt yêu cầu thêm môn dạy Vật Lý THCS.",
    created_at: "2026-07-06 10:40",
  },
  {
    id: 14,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "tu_choi_yeu_cau_chuyen_mon",
    doi_tuong_id: 9,
    noi_dung: "Admin từ chối yêu cầu thêm bằng cấp do tài liệu không rõ.",
    created_at: "2026-07-06 10:48",
  },
  {
    id: 15,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "tao_bai_viet",
    doi_tuong_id: 3,
    noi_dung: "Admin tạo bài viết hướng dẫn chọn gia sư phù hợp.",
    created_at: "2026-07-06 11:00",
  },
  {
    id: 16,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "sua_bai_viet",
    doi_tuong_id: 3,
    noi_dung: "Admin cập nhật nội dung bài viết hướng dẫn chọn gia sư.",
    created_at: "2026-07-06 11:10",
  },
  {
    id: 17,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "xoa_bai_viet",
    doi_tuong_id: 4,
    noi_dung: "Admin đưa bài viết cũ vào thùng rác.",
    created_at: "2026-07-06 11:15",
  },
  {
    id: 18,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "them_danh_muc",
    doi_tuong_id: 7,
    noi_dung: "Admin thêm danh mục trình độ gia sư mới.",
    created_at: "2026-07-06 11:25",
  },
  {
    id: 19,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "sua_danh_muc",
    doi_tuong_id: 7,
    noi_dung: "Admin chỉnh giá cộng thêm của trình độ gia sư.",
    created_at: "2026-07-06 11:32",
  },
  {
    id: 20,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "xoa_danh_muc",
    doi_tuong_id: 7,
    noi_dung: "Admin xóa danh mục không còn sử dụng.",
    created_at: "2026-07-06 11:40",
  },
  {
    id: 21,
    user_id: 3,
    nguoiThucHien: "Lê Công Minh",
    vai_tro: "giasu",
    hanh_dong: "gia_su_tu_choi",
    doi_tuong_id: 22,
    noi_dung: "Gia sư từ chối nhận lớp vì trùng lịch dạy.",
    created_at: "2026-07-06 12:05",
  },
  {
    id: 22,
    user_id: 4,
    nguoiThucHien: "Võ Tấn Hiền",
    vai_tro: "hocvien",
    hanh_dong: "yeu_cau_doi_buoi",
    doi_tuong_id: 41,
    noi_dung: "Học viên gửi yêu cầu đổi buổi học ngày 08/07/2026.",
    created_at: "2026-07-06 12:25",
  },
  {
    id: 23,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "huy_buoi_hoc",
    doi_tuong_id: 41,
    noi_dung: "Admin hủy buổi học theo yêu cầu xử lý.",
    created_at: "2026-07-06 12:40",
  },
  {
    id: 24,
    user_id: 1,
    nguoiThucHien: "Vu Thien Phu",
    vai_tro: "admin",
    hanh_dong: "tu_choi_thanh_toan",
    doi_tuong_id: 18,
    noi_dung: "Admin từ chối minh chứng thanh toán do ảnh không rõ.",
    created_at: "2026-07-06 13:05",
  },
  {
    id: 25,
    user_id: 5,
    nguoiThucHien: "Mai Phương Nhi",
    vai_tro: "hocvien",
    hanh_dong: "dat_goi_hoc",
    doi_tuong_id: 23,
    noi_dung: "Học viên gửi yêu cầu đặt gói Toán Học THCS.",
    created_at: "2026-07-06 13:20",
  },
];

function AdminNhatKy() {
  const [tuKhoa, setTuKhoa] = useState("");
  const [vaiTro, setVaiTro] = useState("");
  const [nhomHanhDong, setNhomHanhDong] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);

  const danhSachLoc = useMemo(() => {
    const tuKhoaChuanHoa = tuKhoa.trim().toLowerCase();
    const cacHanhDongTrongNhom = nhomHanhDong
      ? NHOM_HANH_DONG[nhomHanhDong] ?? []
      : [];

    return MOCK_NHAT_KY.filter((item) => {
      const dungVaiTro = !vaiTro || item.vai_tro === vaiTro;
      const dungHanhDong =
        !nhomHanhDong || cacHanhDongTrongNhom.includes(item.hanh_dong);
      const dungTuKhoa =
        !tuKhoaChuanHoa ||
        [
          item.nguoiThucHien,
          item.hanh_dong,
          item.noi_dung,
          String(item.doi_tuong_id),
        ]
          .join(" ")
          .toLowerCase()
          .includes(tuKhoaChuanHoa);

      return dungVaiTro && dungHanhDong && dungTuKhoa;
    });
  }, [nhomHanhDong, tuKhoa, vaiTro]);

  const tongSoTrang = Math.max(
    Math.ceil(danhSachLoc.length / SO_DONG_MOI_TRANG),
    1,
  );
  const trangHopLe = Math.min(trangHienTai, tongSoTrang);
  const danhSachDangHienThi = useMemo(() => {
    const batDau = (trangHopLe - 1) * SO_DONG_MOI_TRANG;

    return danhSachLoc.slice(batDau, batDau + SO_DONG_MOI_TRANG);
  }, [danhSachLoc, trangHopLe]);

  useEffect(() => {
    const lamMoi = () => {
      setTrangHienTai(1);
    };

    window.addEventListener("admin:refresh", lamMoi);

    return () => {
      window.removeEventListener("admin:refresh", lamMoi);
    };
  }, []);

  const lamMoiBoLoc = () => {
    setTuKhoa("");
    setVaiTro("");
    setNhomHanhDong("");
    setTrangHienTai(1);
  };

  const xuLyDoiTuKhoa = (event) => {
    setTuKhoa(event.target.value);
    setTrangHienTai(1);
  };

  const xuLyDoiVaiTro = (event) => {
    setVaiTro(event.target.value);
    setTrangHienTai(1);
  };

  const xuLyDoiNhomHanhDong = (event) => {
    setNhomHanhDong(event.target.value);
    setTrangHienTai(1);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-blue-300">
              Nhật ký hệ thống
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-white">
              Theo dõi lịch sử thao tác
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              Giao diện mock để xem các thao tác quan trọng như khóa tài khoản,
              duyệt hồ sơ, đặt gói, thanh toán, lịch học, bài viết và danh mục.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-100">
            Tổng sau lọc: {danhSachLoc.length}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_220px_240px_auto]">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/45">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={tuKhoa}
              onChange={xuLyDoiTuKhoa}
              placeholder="Tìm nội dung, người thực hiện, mã đối tượng..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/70"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/45">
              Vai trò
            </label>
            <select
              value={vaiTro}
              onChange={xuLyDoiVaiTro}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-blue-400/70"
            >
              {BO_LOC_VAI_TRO.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/45">
              Nhóm hành động
            </label>
            <select
              value={nhomHanhDong}
              onChange={xuLyDoiNhomHanhDong}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#081027] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-blue-400/70"
            >
              {BO_LOC_HANH_DONG.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={lamMoiBoLoc}
            className="mt-auto inline-flex h-[46px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-extrabold text-white/80 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white"
          >
            Làm mới lọc
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              Danh sách nhật ký
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Mock dữ liệu, mỗi trang hiển thị {SO_DONG_MOI_TRANG} dòng.
            </p>
          </div>
          <div className="text-sm font-bold text-white/55">
            Trang {trangHopLe}/{tongSoTrang}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-5 py-4">Thời gian</th>
                <th className="px-5 py-4">Người thực hiện</th>
                <th className="px-5 py-4">Vai trò</th>
                <th className="px-5 py-4">Hành động</th>
                <th className="px-5 py-4">Đối tượng</th>
                <th className="px-5 py-4">Nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {danhSachDangHienThi.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm font-semibold text-white/50"
                  >
                    Không có nhật ký phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                danhSachDangHienThi.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-white/70">
                      {item.created_at}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-white">
                        {item.nguoiThucHien}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        User #{item.user_id}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <NhanVaiTro vaiTro={item.vai_tro} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold text-blue-200">
                        {NHAN_HANH_DONG[item.hanh_dong] || item.hanh_dong}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-white/70">
                      #{item.doi_tuong_id}
                    </td>
                    <td className="min-w-[320px] px-5 py-4 leading-6 text-white/70">
                      {item.noi_dung}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-white/50">
            Hiển thị {danhSachDangHienThi.length} / {danhSachLoc.length} nhật ký
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={trangHopLe <= 1}
              onClick={() => setTrangHienTai((trang) => Math.max(1, trang - 1))}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>
            {Array.from({ length: tongSoTrang }, (_, index) => index + 1).map(
              (trang) => (
                <button
                  key={trang}
                  type="button"
                  onClick={() => setTrangHienTai(trang)}
                  className={[
                    "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-extrabold transition",
                    trangHopLe === trang
                      ? "border-blue-400 bg-blue-600 text-white"
                      : "border-white/10 text-white/65 hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white",
                  ].join(" ")}
                >
                  {trang}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={trangHopLe >= tongSoTrang}
              onClick={() =>
                setTrangHienTai((trang) => Math.min(tongSoTrang, trang + 1))
              }
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function NhanVaiTro({ vaiTro }) {
  const cauHinh = {
    admin: "border-purple-300/30 bg-purple-300/10 text-purple-200",
    giasu: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    hocvien: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  };

  const nhan = {
    admin: "Admin",
    giasu: "Gia sư",
    hocvien: "Học viên",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
        cauHinh[vaiTro] || "border-white/10 bg-white/5 text-white/70",
      ].join(" ")}
    >
      {nhan[vaiTro] || vaiTro || "Không rõ"}
    </span>
  );
}

export default AdminNhatKy;
