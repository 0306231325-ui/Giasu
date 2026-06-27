export function dinhDangNgay(ngay) {
    if (!ngay) return "";
    const [nam, thang, ngayTrongThang] = ngay.split("-");
    return `${ngayTrongThang}/${thang}/${nam}`;
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
