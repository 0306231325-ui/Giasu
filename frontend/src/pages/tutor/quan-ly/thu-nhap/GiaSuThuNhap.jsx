import BangThuNhap from "./components/BangThuNhap";
import BieuDoThuNhap from "./components/BieuDoThuNhap";
import BieuTuong from "./components/BieuTuong";
import BoLocThuNhap from "./components/BoLocThuNhap";
import CumThongKe from "./components/CumThongKe";
import ModalChiTietThuNhap from "./components/ModalChiTietThuNhap";
import { duLieuRong } from "./constants";
import useThuNhapGiaSu from "./hooks/useThuNhapGiaSu";

function GiaSuThuNhap() {
    const {
        boLoc,
        cauHinh,
        chiTietDangXem,
        dangTai,
        doiBoLoc,
        duLieu,
        giaTriBoLoc,
        setChiTietDangXem,
        setGiaTriBoLoc,
    } = useThuNhapGiaSu();

    const tongQuan = duLieu.tongQuan || duLieuRong.tongQuan;
    const chiTiet = duLieu.chiTiet || [];
    const bieuDo = duLieu.bieuDo || [];

    return (
        <div className="mx-auto max-w-7xl pb-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Thu nhập
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                        Theo dõi thu nhập từ các buổi học đã hoàn thành theo ngày,
                        tháng hoặc năm.
                    </p>
                </div>

                <BoLocThuNhap
                    boLoc={boLoc}
                    cauHinh={cauHinh}
                    giaTriBoLoc={giaTriBoLoc}
                    doiBoLoc={doiBoLoc}
                    setGiaTriBoLoc={setGiaTriBoLoc}
                />
            </div>

            <CumThongKe
                tongQuan={tongQuan}
                duLieu={duLieu}
                cauHinh={cauHinh}
                dangTai={dangTai}
            />

            <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#111b3a]">
                <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-extrabold">Biểu đồ thu nhập</h2>
                        <p className="mt-1 text-xs text-white/45">
                            {cauHinh.moTaBieuDo}
                        </p>
                    </div>
                </div>

                <BieuDoThuNhap duLieu={bieuDo} dangTai={dangTai} />
            </section>

            <BangThuNhap
                cauHinh={cauHinh}
                chiTiet={chiTiet}
                dangTai={dangTai}
                onXemChiTiet={setChiTietDangXem}
            />

            {chiTietDangXem && (
                <ModalChiTietThuNhap
                    dong={chiTietDangXem}
                    onDong={() => setChiTietDangXem(null)}
                />
            )}


        </div>
    );
}

export default GiaSuThuNhap;
