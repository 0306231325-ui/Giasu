const homNay = new Date();

export const cauHinhBoLoc = {
    ngay: {
        nhanThoiGian: "ngày đã chọn",
        loaiInput: "date",
        moTaBieuDo: "Thu nhập theo từng buổi trong ngày",
    },
    thang: {
        nhanThoiGian: "tháng đã chọn",
        loaiInput: "month",
        moTaBieuDo: "Thu nhập theo từng tuần trong tháng",
    },
    nam: {
        nhanThoiGian: "năm đã chọn",
        loaiInput: "number",
        moTaBieuDo: "Thu nhập theo từng tháng trong năm",
    },
};

export const giaTriMacDinh = {
    ngay: homNay.toISOString().slice(0, 10),
    thang: homNay.toISOString().slice(0, 7),
    nam: String(homNay.getFullYear()),
};

export const duLieuRong = {
    boLoc: {},
    tongQuan: {
        tongThuNhap: 0,
        soBuoiHoanThanh: 0,
    },
    bieuDo: [],
    chiTiet: [],
};
