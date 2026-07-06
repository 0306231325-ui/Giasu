import { useMemo, useState } from "react";
import IconLichDay from "./IconLichDay";
import ModalChiTietLichHoc from "./ModalChiTietLichHoc";
import { trangThaiLichHoc } from "../constants";

const GIO_BAT_DAU = 7;
const GIO_KET_THUC = 22;
const CHIEU_CAO_MOI_GIO = 76;
const CAC_THU = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

function TabLichTuan({ danhSach, dangXuLyId, onXacNhan }) {
    const [ngayTrongTuan, setNgayTrongTuan] = useState(() => new Date());
    const [lichDangXem, setLichDangXem] = useState(null);
    const lichDangXemMoiNhat = useMemo(
        () => danhSach.find((lichHoc) => lichHoc.id === lichDangXem?.id) || lichDangXem,
        [danhSach, lichDangXem],
    );

    const ngayDauTuan = useMemo(
        () => layNgayDauTuan(ngayTrongTuan),
        [ngayTrongTuan],
    );

    const cacNgayTrongTuan = useMemo(
        () =>
            Array.from({ length: 7 }, (_, index) => {
                const ngay = new Date(ngayDauTuan);
                ngay.setDate(ngayDauTuan.getDate() + index);
                return ngay;
            }),
        [ngayDauTuan],
    );

    const danhSachTrongTuan = useMemo(
        () =>
            danhSach.filter((lichHoc) => {
                const ngayHoc = docNgayVietNam(lichHoc.ngayHoc);
                if (!ngayHoc) return false;

                return ngayHoc >= cacNgayTrongTuan[0]
                    && ngayHoc <= ketThucNgay(cacNgayTrongTuan[6]);
            }),
        [cacNgayTrongTuan, danhSach],
    );

    const doLechTuan = tinhDoLechTuan(ngayDauTuan, layNgayDauTuan(new Date()));

    const chuyenTuan = (soTuan) => {
        setNgayTrongTuan((hienTai) => {
            const ngayMoi = new Date(hienTai);
            ngayMoi.setDate(hienTai.getDate() + soTuan * 7);
            return ngayMoi;
        });
    };

    const veTuanHienTai = () => {
        setNgayTrongTuan(new Date());
    };

    const gioTrongNgay = Array.from(
        { length: GIO_KET_THUC - GIO_BAT_DAU + 1 },
        (_, index) => GIO_BAT_DAU + index,
    );

    return (
        <>
            <section className="mt-5">
                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold">Lịch tuần</h2>
                        <p className="mt-1 text-sm text-white/45">
                            Xem nhanh các buổi học trong tuần theo ngày và khung giờ.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <NutChuyenTuan
                            active={doLechTuan < 0}
                            onClick={() => chuyenTuan(-1)}
                        >
                            Tuần trước
                        </NutChuyenTuan>
                        <NutChuyenTuan
                            active={doLechTuan === 0}
                            onClick={veTuanHienTai}
                        >
                            Tuần này
                        </NutChuyenTuan>
                        <NutChuyenTuan
                            active={doLechTuan > 0}
                            onClick={() => chuyenTuan(1)}
                        >
                            Tuần sau
                        </NutChuyenTuan>
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0a132d]">
                    <div className="grid grid-cols-[76px_repeat(7,minmax(130px,1fr))] border-b border-white/10 bg-white/[0.03]">
                        <div className="sticky left-0 z-20 border-r border-white/10 bg-[#0d1733] px-3 py-4 text-xs font-bold uppercase tracking-wide text-white/35">
                            Giờ
                        </div>
                        {cacNgayTrongTuan.map((ngay, index) => (
                            <div
                                key={ngay.toISOString()}
                                className="border-r border-white/10 px-3 py-3 text-center last:border-r-0"
                            >
                                <p className="text-sm font-extrabold text-white">
                                    {CAC_THU[index]}
                                </p>
                                <p className={[
                                    "mt-1 text-xs font-semibold",
                                    laHomNay(ngay) ? "text-blue-200" : "text-white/40",
                                ].join(" ")}
                                >
                                    {dinhDangNgayNgan(ngay)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="max-h-[680px] overflow-auto">
                        <div
                            className="relative grid min-w-[1040px] grid-cols-[76px_repeat(7,minmax(130px,1fr))]"
                            style={{ height: (GIO_KET_THUC - GIO_BAT_DAU) * CHIEU_CAO_MOI_GIO }}
                        >
                            <div className="sticky left-0 z-10 border-r border-white/10 bg-[#0d1733]">
                                {gioTrongNgay.slice(0, -1).map((gio) => (
                                    <div
                                        key={gio}
                                        className="border-b border-white/10 px-3 pt-2 text-xs font-bold text-white/35"
                                        style={{ height: CHIEU_CAO_MOI_GIO }}
                                    >
                                        {String(gio).padStart(2, "0")}:00
                                    </div>
                                ))}
                            </div>

                            {cacNgayTrongTuan.map((ngay) => (
                                <div
                                    key={ngay.toISOString()}
                                    className="relative border-r border-white/10 last:border-r-0"
                                >
                                    {gioTrongNgay.slice(0, -1).map((gio) => (
                                        <div
                                            key={gio}
                                            className="border-b border-white/10"
                                            style={{ height: CHIEU_CAO_MOI_GIO }}
                                        />
                                    ))}

                                    {danhSachTrongTuan
                                        .filter((lichHoc) => cungNgay(docNgayVietNam(lichHoc.ngayHoc), ngay))
                                        .map((lichHoc) => (
                                            <TheLichHocTuan
                                                key={lichHoc.id}
                                                lichHoc={lichHoc}
                                                onClick={() => setLichDangXem(lichHoc)}
                                            />
                                        ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {danhSachTrongTuan.length === 0 && (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center">
                        <IconLichDay ten="calendar" className="mx-auto h-8 w-8 text-blue-200" />
                        <p className="mt-3 text-sm font-extrabold text-white">
                            Tuần này chưa có lịch học
                        </p>
                        <p className="mt-2 text-sm text-white/45">
                            Thử chuyển sang tuần khác hoặc kiểm tra lại danh sách lịch học.
                        </p>
                    </div>
                )}
            </section>

            {lichDangXem && (
                <ModalChiTietLichHoc
                    lichHoc={lichDangXemMoiNhat}
                    dangXuLy={dangXuLyId === `lich-${lichDangXem.id}`}
                    onXacNhan={onXacNhan}
                    onDong={() => setLichDangXem(null)}
                />
            )}
        </>
    );
}

function NutChuyenTuan({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "rounded-xl border px-3 py-2 text-sm font-bold transition",
                active
                    ? "border-blue-400/30 bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                    : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function TheLichHocTuan({ lichHoc, onClick }) {
    const batDau = doiGioSangPhut(lichHoc.batDau);
    const ketThuc = doiGioSangPhut(lichHoc.ketThuc);
    const top = Math.max((batDau - GIO_BAT_DAU * 60) / 60 * CHIEU_CAO_MOI_GIO, 0);
    const height = Math.max((ketThuc - batDau) / 60 * CHIEU_CAO_MOI_GIO, 46);
    const trangThai = trangThaiLichHoc[lichHoc.trangThai] || trangThaiLichHoc.sap_dien_ra;

    return (
        <button
            type="button"
            onClick={onClick}
            className="absolute left-1.5 right-1.5 overflow-hidden rounded-xl border border-blue-300/25 bg-blue-500/20 p-2 text-left shadow-lg shadow-black/10 transition hover:border-blue-200/60 hover:bg-blue-500/30"
            style={{ top: top + 4, height: height - 8 }}
        >
            <p className="truncate text-xs font-extrabold text-white">
                {lichHoc.mon} · {lichHoc.capHoc}
            </p>
            <p className="mt-1 truncate text-[11px] font-semibold text-blue-100/80">
                {lichHoc.batDau} - {lichHoc.ketThuc}
            </p>
            <p className="mt-1 truncate text-[11px] text-white/60">
                {lichHoc.hocVien}
            </p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${trangThai.lop}`}>
                {trangThai.nhan}
            </span>
        </button>
    );
}

function layNgayDauTuan(ngay) {
    const ketQua = new Date(ngay);
    const thu = ketQua.getDay() || 7;
    ketQua.setHours(0, 0, 0, 0);
    ketQua.setDate(ketQua.getDate() - thu + 1);
    return ketQua;
}

function tinhDoLechTuan(tuanDangXem, tuanHienTai) {
    const soNgayLech = Math.round((tuanDangXem - tuanHienTai) / 86400000);
    return Math.round(soNgayLech / 7);
}

function ketThucNgay(ngay) {
    const ketQua = new Date(ngay);
    ketQua.setHours(23, 59, 59, 999);
    return ketQua;
}

function docNgayVietNam(giaTri) {
    if (!giaTri) return null;
    const [ngay, thang, nam] = String(giaTri).split("/");
    if (!ngay || !thang || !nam) return null;
    return new Date(Number(nam), Number(thang) - 1, Number(ngay));
}

function cungNgay(ngayA, ngayB) {
    if (!ngayA || !ngayB) return false;
    return ngayA.getFullYear() === ngayB.getFullYear()
        && ngayA.getMonth() === ngayB.getMonth()
        && ngayA.getDate() === ngayB.getDate();
}

function laHomNay(ngay) {
    return cungNgay(ngay, new Date());
}

function dinhDangNgayNgan(ngay) {
    return `${String(ngay.getDate()).padStart(2, "0")}/${String(ngay.getMonth() + 1).padStart(2, "0")}`;
}

function doiGioSangPhut(gio) {
    const [gioPhan, phutPhan] = String(gio || "00:00").split(":");
    return Number(gioPhan) * 60 + Number(phutPhan || 0);
}

export default TabLichTuan;
