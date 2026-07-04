import BangDanhGia from "./components/BangDanhGia";
import BoLocThoiGian from "./components/BoLocThoiGian";
import CumThongKe from "./components/CumThongKe";
import KhoiPhanBoDanhGia from "./components/KhoiPhanBoDanhGia";
import { duLieuRong } from "./constants";
import useTheoDoiHoatDong from "./hooks/useTheoDoiHoatDong";

function GiaSuTheoDoiHoatDong() {
    const {
        boLocDanhGia,
        setBoLocDanhGia,
        boLocThoiGian,
        setBoLocThoiGian,
        dangTai,
        duLieu,
        loi,
    } = useTheoDoiHoatDong();

    const tongQuan = duLieu.tongQuan || duLieuRong.tongQuan;
    const phanBoDanhGia = duLieu.phanBoDanhGia || duLieuRong.phanBoDanhGia;
    const danhSach = duLieu.danhSach || [];

    return (
        <div className="mx-auto max-w-7xl pb-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Theo dõi hoạt động
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                        Xem lại đánh giá, phản hồi của học viên sau các buổi học
                        đã hoàn thành để theo dõi chất lượng giảng dạy.
                    </p>
                </div>

                <BoLocThoiGian
                    value={boLocThoiGian}
                    onChange={setBoLocThoiGian}
                />
            </div>

            <CumThongKe tongQuan={tongQuan} dangTai={dangTai} />

            {loi && (
                <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                    {loi}
                </div>
            )}

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <BangDanhGia
                    boLocDanhGia={boLocDanhGia}
                    setBoLocDanhGia={setBoLocDanhGia}
                    danhSach={danhSach}
                    dangTai={dangTai}
                />

                <KhoiPhanBoDanhGia phanBoDanhGia={phanBoDanhGia} />
            </div>
        </div>
    );
}

export default GiaSuTheoDoiHoatDong;
