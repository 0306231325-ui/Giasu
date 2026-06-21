export function dinhDangNgay(ngay) {
    if (!ngay) return "";
    const [nam, thang, ngayTrongThang] = ngay.split("-");
    return `${ngayTrongThang}/${thang}/${nam}`;
}

export function dinhDangMucKinhNghiem(mucKinhNghiem) {
    if (!mucKinhNghiem) return "Chưa cập nhật";
    if (
        Number(mucKinhNghiem.tu_khoang) === 0 &&
        Number(mucKinhNghiem.den_khoang) === 0
    ) {
        return "Chưa có kinh nghiệm";
    }
    if (mucKinhNghiem.den_khoang === null) {
        return `Từ ${mucKinhNghiem.tu_khoang} năm trở lên`;
    }
    return `Từ ${mucKinhNghiem.tu_khoang} đến ${mucKinhNghiem.den_khoang} năm`;
}

export function layChuCaiDau(hoTen) {
    return hoTen
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((tu) => tu.charAt(0).toUpperCase())
        .join("");
}

export function nhanTrangThaiBangCap(trangThai) {
    return {
        cho_duyet: "Đang xét duyệt",
        duyet: "Đã xác minh",
        tu_choi: "Bị từ chối",
    }[trangThai] || "Chưa xác định";
}

export function lopTrangThaiBangCap(trangThai) {
    return {
        cho_duyet: "bg-amber-50 text-amber-700",
        duyet: "bg-emerald-50 text-emerald-700",
        tu_choi: "bg-red-50 text-red-700",
    }[trangThai] || "bg-slate-100 text-slate-600";
}
