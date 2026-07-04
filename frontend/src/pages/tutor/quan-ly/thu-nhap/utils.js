export function dinhDangTien(giaTri) {
    return `${Math.round(Number(giaTri) || 0).toLocaleString("vi-VN")}đ`;
}
