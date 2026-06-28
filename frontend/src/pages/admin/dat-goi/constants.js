export const BO_LOC_TRANG_THAI = [
    { value: "cho_xu_ly", label: "Chờ xử lý" },
    { value: "da_phan_hoi", label: "Đã phản hồi" },
    { value: "cho_thanh_toan", label: "Chờ thanh toán" },
    { value: "xac_nhan_thanh_toan", label: "Xác nhận thanh toán" },
    { value: "danh_sach_goi_hoc", label: "Danh sách gói học" },
    { value: "da_huy", label: "Đã huỷ" },
];

export const TRANG_THAI_MAC_DINH = "cho_xu_ly";

export const TRANG_THAI_GOI = {
    cho_xu_ly: {
        label: "Chờ xử lý",
        className: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    },
    giasu_dong_y: {
        label: "Gia sư đồng ý",
        className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    },
    giasu_tu_choi: {
        label: "Gia sư từ chối",
        className: "border-red-400/25 bg-red-400/10 text-red-200",
    },
    cho_thanh_toan: {
        label: "Chờ thanh toán",
        className: "border-purple-400/25 bg-purple-400/10 text-purple-200",
    },
    xac_nhan_thanh_toan: {
        label: "Xác nhận thanh toán",
        className: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    },
    da_tao_lich: {
        label: "Đang học",
        className: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    },
    da_huy: {
        label: "Đã huỷ",
        className: "border-white/10 bg-white/5 text-white/55",
    },
};
