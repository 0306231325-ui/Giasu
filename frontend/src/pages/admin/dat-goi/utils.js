export function dinhDangNgay(ngay) {
    if (!ngay) return "Chưa cập nhật";
    const [nam, thang, ngayTrongThang] = String(ngay).split("-");
    if (!nam || !thang || !ngayTrongThang) return ngay;
    return `${ngayTrongThang}/${thang}/${nam}`;
}

export function coThongTinChoXacNhanThanhToan(yeuCau) {
    const thanhToan = yeuCau?.thanhToan;

    if (!thanhToan) return false;

    const trangThaiThanhToan = thanhToan.trangThai || thanhToan.trang_thai;

    if (trangThaiThanhToan !== "cho_thanhtoan") return false;

    return Boolean(
        thanhToan.anhMinhChung ||
        thanhToan.anh_minh_chung ||
        thanhToan.maGiaoDich ||
        thanhToan.ma_giaodich ||
        thanhToan.ngayThanhToan ||
        thanhToan.ngay_thanhtoan,
    );
}

export function layNhanThanhToanPhu(yeuCau) {
    if (yeuCau?.trangThai === "dang_hoc" || yeuCau?.trangThai === "hoan_thanh") {
        return {
            nhan: yeuCau?.kieuGoi === "hoc_thu" ? "Không cần thanh toán" : "Đã thanh toán",
            className: "bg-emerald-400/10 text-emerald-200",
        };
    }

    if (yeuCau?.trangThai !== "cho_thanh_toan") {
        return null;
    }

    const trangThaiThanhToan = yeuCau?.thanhToan?.trangThai || yeuCau?.thanhToan?.trang_thai;

    if (trangThaiThanhToan === "that_bai") {
        return {
            nhan: "TT bị từ chối",
            className: "bg-red-400/10 text-red-200",
        };
    }

    if (coThongTinChoXacNhanThanhToan(yeuCau)) {
        return {
            nhan: "Chờ xác nhận TT",
            className: "bg-sky-400/10 text-sky-200",
        };
    }

    return null;
}

export function layHanhDong(yeuCau) {
    const nutChinh = "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700";
    const nutPhu = "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50";
    const nutDo = "rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100";

    const hanhDongChoThanhToan = coThongTinChoXacNhanThanhToan(yeuCau)
        ? [
            { key: "duyet_thanh_toan", label: "Duyệt thanh toán", className: nutChinh },
            { key: "tu_choi_thanh_toan", label: "Từ chối thanh toán", className: nutDo },
        ]
        : [
            { key: "nhac_thanh_toan", label: "Nhắc học viên thanh toán", className: nutChinh },
            { key: "huy_yeu_cau", label: "Hủy yêu cầu", className: nutDo },
        ];

    const map = {
        cho_xu_ly: [
            { key: "gui_gia_su", label: "Gửi/Nhắc gia sư", className: nutChinh },
            { key: "huy_yeu_cau", label: "Hủy yêu cầu", className: nutDo },
        ],
        cho_thanh_toan: hanhDongChoThanhToan,
        dang_hoc: [],
        hoan_thanh: [],
        da_huy: [
            { key: "xem_huy", label: "Xem chi tiết hủy", className: nutPhu },
        ],
    };

    return map[yeuCau.trangThai] ?? [];
}
