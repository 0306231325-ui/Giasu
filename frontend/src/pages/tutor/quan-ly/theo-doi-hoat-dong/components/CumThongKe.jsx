import TheThongKe from "./TheThongKe";

function CumThongKe({ tongQuan, dangTai }) {
    return (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TheThongKe
                nhan="Điểm trung bình"
                giaTri={dangTai ? "..." : tongQuan.tongPhanHoi > 0 ? `${Number(tongQuan.diemTrungBinh).toFixed(1)}/5` : "—"}
                phuDe={tongQuan.tongPhanHoi > 0 ? `${tongQuan.tongPhanHoi} lượt đánh giá` : "Chưa có đánh giá"}
                bieuTuong="star"
                mau="amber"
            />
            <TheThongKe
                nhan="Tổng phản hồi"
                giaTri={dangTai ? "..." : tongQuan.tongPhanHoi}
                phuDe="Từ học viên"
                bieuTuong="message"
                mau="blue"
            />
            <TheThongKe
                nhan="Đánh giá tích cực"
                giaTri={dangTai ? "..." : tongQuan.danhGiaTichCuc}
                phuDe="Từ 4 sao trở lên"
                bieuTuong="check"
                mau="emerald"
            />
            <TheThongKe
                nhan="Đánh giá tiêu cực"
                giaTri={dangTai ? "..." : tongQuan.danhGiaTieuCuc}
                phuDe="Dưới 4 sao"
                bieuTuong="alert"
                mau="red"
            />
        </div>
    );
}

export default CumThongKe;
