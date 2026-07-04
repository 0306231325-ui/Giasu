import { dinhDangTien } from "../utils";
import TheThongKe from "./TheThongKe";

function CumThongKe({ tongQuan, duLieu, cauHinh, dangTai }) {
    return (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TheThongKe
                tieuDe="Tổng thu nhập"
                giaTri={dinhDangTien(tongQuan.tongThuNhap)}
                phuDe={`Trong ${duLieu.boLoc?.nhanThoiGian || cauHinh.nhanThoiGian}`}
                bieuTuong="wallet"
                mau="blue"
                dangTai={dangTai}
            />
            <TheThongKe
                tieuDe="Buổi đã hoàn thành"
                giaTri={tongQuan.soBuoiHoanThanh}
                phuDe="Chỉ tính buổi trạng thái hoàn thành"
                bieuTuong="calendar"
                mau="emerald"
                dangTai={dangTai}
            />
        </div>
    );
}

export default CumThongKe;
