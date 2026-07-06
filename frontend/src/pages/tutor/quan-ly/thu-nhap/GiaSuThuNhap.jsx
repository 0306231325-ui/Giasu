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

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-blue-100">
                <span className="mt-0.5 shrink-0 text-blue-300">
                    <BieuTuong ten="info" />
                </span>
                <p className="leading-6">
                    Thu nhập chỉ được ghi nhận từ những buổi học đã hoàn thành.
                    Hệ thống lấy số tiền từ cột <span className="font-bold">tien_giasu_nhan</span>;
                    nếu dữ liệu cũ chưa có tiền nhận thì tạm tính bằng tiền học trừ phí hoa hồng.
                </p>
            </div>
        </div>
    );
}

export default GiaSuThuNhap;
