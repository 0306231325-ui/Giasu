export function dinhDangMucKinhNghiem(mucKinhNghiem) {
    if (mucKinhNghiem.tu_khoang === 0 && mucKinhNghiem.den_khoang === 0) {
        return "Chưa có kinh nghiệm";
    }
    if (mucKinhNghiem.den_khoang === null) {
        return `Từ ${mucKinhNghiem.tu_khoang} năm trở lên`;
    }
    return `Từ ${mucKinhNghiem.tu_khoang} đến ${mucKinhNghiem.den_khoang} năm`;
}

export function dinhDangTien(giaTri) {
    return `${Number(giaTri).toLocaleString("vi-VN")}đ`;
}
