export const SO_DONG_MOI_TRANG = 10;

export const BO_LOC_VAI_TRO = [
  { value: "", label: "Tất cả vai trò" },
  { value: "admin", label: "Admin" },
  { value: "giasu", label: "Gia sư" },
  { value: "hocvien", label: "Học viên" },
];

export const BO_LOC_HANH_DONG = [
  { value: "", label: "Tất cả hành động" },
  { value: "tai_khoan", label: "Tài khoản" },
  { value: "ho_so", label: "Duyệt hồ sơ" },
  { value: "dat_goi", label: "Đặt gói" },
  { value: "thanh_toan", label: "Thanh toán" },
  { value: "lich_hoc", label: "Lịch học" },
  { value: "bai_viet", label: "Bài viết" },
  { value: "danh_muc", label: "Danh mục" },
];

export const NHAN_HANH_DONG = {
  khoa_tai_khoan: "Khóa tài khoản",
  mo_khoa_tai_khoan: "Mở khóa tài khoản",
  gui_don_dang_ky_gia_su: "Gửi đơn đăng ký gia sư",
  them_bang_cap_gia_su: "Thêm bằng cấp/chứng chỉ",
  them_mon_day_gia_su: "Thêm môn dạy",
  duyet_ho_so_gia_su: "Duyệt hồ sơ gia sư",
  tu_choi_ho_so_gia_su: "Từ chối hồ sơ gia sư",
  duyet_yeu_cau_chuyen_mon: "Duyệt yêu cầu chuyên môn",
  tu_choi_yeu_cau_chuyen_mon: "Từ chối yêu cầu chuyên môn",
  dat_goi_hoc: "Đặt gói học",
  gui_yeu_cau_cho_gia_su: "Gửi yêu cầu cho gia sư",
  chuyen_cho_thanh_toan: "Chuyển chờ thanh toán",
  gia_su_dong_y: "Gia sư đồng ý",
  gia_su_tu_choi: "Gia sư từ chối",
  huy_goi_hoc: "Hủy gói học",
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

export const META_MAC_DINH = {
  current_page: 1,
  last_page: 1,
  per_page: SO_DONG_MOI_TRANG,
  total: 0,
};
