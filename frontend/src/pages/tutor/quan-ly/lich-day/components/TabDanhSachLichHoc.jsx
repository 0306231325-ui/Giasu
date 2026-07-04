import { useMemo, useState } from "react";
import IconLichDay from "./IconLichDay";
import ModalChiTietLichHoc from "./ModalChiTietLichHoc";
import { trangThaiLichHoc } from "../constants";

function TabDanhSachLichHoc({ danhSach, dangXuLyId, onXacNhan }) {
    const [tuKhoa, setTuKhoa] = useState("");
    const [trangThai, setTrangThai] = useState("");
    const [lichDangXem, setLichDangXem] = useState(null);

    const danhSachDaLoc = useMemo(() => {
        const tuKhoaChuan = tuKhoa.trim().toLocaleLowerCase("vi");

        return danhSach.filter((lichHoc) => {
            const khopTuKhoa =
                !tuKhoaChuan
                || [lichHoc.hocVien, lichHoc.mon, lichHoc.capHoc]
                    .some((giaTri) =>
                        giaTri.toLocaleLowerCase("vi").includes(tuKhoaChuan),
                    );

            return khopTuKhoa
                && (!trangThai || lichHoc.trangThai === trangThai);
        });
    }, [danhSach, trangThai, tuKhoa]);

    const sapDienRa = danhSach.filter(
        (lichHoc) => lichHoc.trangThai === "sap_dien_ra",
    ).length;
    const hoanThanh = danhSach.filter(
        (lichHoc) => lichHoc.trangThai === "hoan_thanh",
    ).length;

    return (
        <>
            <section className="mt-5">
                <div className="grid gap-4 sm:grid-cols-3">
                    <TheThongKe
                        nhan="Tổng buổi học"
                        giaTri={danhSach.length}
                        phuDe="Đã được tạo lịch"
                        icon="calendar"
                    />
                    <TheThongKe
                        nhan="Sắp diễn ra"
                        giaTri={sapDienRa}
                        phuDe="Cần chuẩn bị giảng dạy"
                        icon="clock"
                    />
                    <TheThongKe
                        nhan="Đã hoàn thành"
                        giaTri={hoanThanh}
                        phuDe="Buổi học đã kết thúc"
                        icon="check"
                    />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <label className="relative min-w-0 flex-1">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/30">
                                <IconLichDay
                                    ten="search"
                                    className="h-4 w-4"
                                />
                            </span>
                            <input
                                type="search"
                                value={tuKhoa}
                                onChange={(event) =>
                                    setTuKhoa(event.target.value)
                                }
                                placeholder="Tìm học viên, môn hoặc cấp học..."
                                className="h-11 w-full rounded-xl border border-white/10 bg-[#0a132d] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-blue-400"
                            />
                        </label>
                        <select
                            value={trangThai}
                            onChange={(event) =>
                                setTrangThai(event.target.value)
                            }
                            className="h-11 rounded-xl border border-white/10 bg-[#0a132d] px-4 text-sm font-semibold text-white outline-none focus:border-blue-400 md:w-52"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="sap_dien_ra">Sắp diễn ra</option>
                            <option value="cho_xac_nhan">Chờ xác nhận</option>
                            <option value="hoan_thanh">Hoàn thành</option>
                            <option value="da_huy">Đã hủy</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-[#070d22] p-3 pr-2 [scrollbar-width:thin]">
                    {danhSach.length === 0 ? (
                        <TrangThaiRong
                            tieuDe="Chưa có lịch học"
                            noiDung="Khu vực các buổi học sẽ hiển thị ở đây."
                        />
                    ) : danhSachDaLoc.length === 0 ? (
                        <TrangThaiRong
                            tieuDe="Không tìm thấy lịch học"
                            noiDung="Không có buổi học nào phù hợp với bộ lọc hiện tại."
                        />
                    ) : (
                        danhSachDaLoc.map((lichHoc) => (
                            <DongLichHoc
                                key={lichHoc.id}
                                lichHoc={lichHoc}
                                onXem={() => setLichDangXem(lichHoc)}
                            />
                        ))
                    )}
                </div>
            </section>

            {lichDangXem && (
                <ModalChiTietLichHoc
                    lichHoc={lichDangXem}
                    dangXuLy={dangXuLyId === `lich-${lichDangXem.id}`}
                    onXacNhan={onXacNhan}
                    onDong={() => setLichDangXem(null)}
                />
            )}
        </>
    );
}

function DongLichHoc({ lichHoc, onXem }) {
    const trangThai = trangThaiLichHoc[lichHoc.trangThai];

    return (
        <article className="rounded-2xl border border-white/10 bg-[#0a132d] p-4 transition hover:border-blue-400/25 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1.2fr)_minmax(190px,0.8fr)_150px] lg:items-center">
                <div>
                    <p className="text-lg font-extrabold text-blue-200">
                        {lichHoc.batDau} – {lichHoc.ketThuc}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/50">
                        {lichHoc.thu}, {lichHoc.ngayHoc}
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                        {lichHoc.loaiBuoi}
                    </p>
                </div>

                <div>
                    <p className="font-extrabold">
                        {lichHoc.mon} · {lichHoc.capHoc}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/55">
                        <IconLichDay ten="user" className="h-4 w-4" />
                        {lichHoc.hocVien}
                    </p>
                </div>

                <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/65">
                        <IconLichDay
                            ten={
                                lichHoc.hinhThuc === "Trực tuyến"
                                    ? "video"
                                    : "location"
                            }
                            className="h-4 w-4"
                        />
                        {lichHoc.hinhThuc}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/35">
                        {lichHoc.diaDiem}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                    <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${trangThai.lop}`}
                    >
                        {trangThai.nhan}
                    </span>
                    <button
                        type="button"
                        onClick={onXem}
                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/10"
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>
        </article>
    );
}

function TheThongKe({ nhan, giaTri, phuDe, icon }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-white/45">{nhan}</p>
                    <p className="mt-2 text-3xl font-extrabold">{giaTri}</p>
                    <p className="mt-2 text-xs text-white/35">{phuDe}</p>
                </div>
                <span className="rounded-xl bg-blue-400/10 p-3 text-blue-300">
                    <IconLichDay ten={icon} />
                </span>
            </div>
        </div>
    );
}

function TrangThaiRong({ tieuDe, noiDung }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-blue-200">
                <IconLichDay ten="calendar" />
            </div>
            <p className="mt-4 text-sm font-extrabold text-white">
                {tieuDe}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                {noiDung}
            </p>
        </div>
    );
}

export default TabDanhSachLichHoc;
