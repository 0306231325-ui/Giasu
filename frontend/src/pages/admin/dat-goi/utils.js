export function dinhDangNgay(ngay) {
    if (!ngay) return "Chưa cập nhật";
    const [nam, thang, ngayTrongThang] = String(ngay).split("-");
    if (!nam || !thang || !ngayTrongThang) return ngay;
    return `${ngayTrongThang}/${thang}/${nam}`;
}

export function layHanhDong(yeuCau) {
    const nutChinh = "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700";
    const nutPhu = "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50";
    const nutDo = "rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100";

    const map = {
        cho_xu_ly: [
            { key: "gui_gia_su", label: "Gửi/Nhắc gia sư", className: nutChinh },
            { key: "huy_yeu_cau", label: "Huỷ yêu cầu", className: nutDo },
        ],
        giasu_dong_y: [
            { key: "cho_thanh_toan", label: "Chuyển sang chờ thanh toán", className: nutChinh },
            { key: "xem_thanh_toan", label: "Xem thông tin thanh toán", className: nutPhu },
        ],
        giasu_tu_choi: [
            { key: "huy_yeu_cau", label: "Huỷ yêu cầu", className: nutDo },
        ],
        cho_thanh_toan: [
            { key: "nhac_thanh_toan", label: "Nhắc học viên thanh toán", className: nutChinh },
            { key: "huy_yeu_cau", label: "Huỷ yêu cầu", className: nutDo },
        ],
        da_tao_lich: [
            { key: "xem_lich", label: "Xem lịch học", className: nutChinh },
        ],
        da_huy: [
            { key: "xem_huy", label: "Xem chi tiết huỷ", className: nutPhu },
        ],
    };

    return map[yeuCau.trangThai] ?? [];
}
