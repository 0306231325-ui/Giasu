import { useMemo, useState } from "react";
import IconLichDay from "./IconLichDay";
import ModalChiTietYeuCau from "./ModalChiTietYeuCau";
import ModalTuChoiYeuCau from "./ModalTuChoiYeuCau";
import { trangThaiYeuCau } from "./duLieuQuanLyLich";

function TabYeuCauDatGiaSu({
    danhSach,
    dangXuLyId,
    onDongY,
    onTuChoi,
}) {
    const [boLoc, setBoLoc] = useState("cho_phan_hoi");
    const [yeuCauDangXem, setYeuCauDangXem] = useState(null);
    const [yeuCauDangTuChoi, setYeuCauDangTuChoi] = useState(null);

    const danhSachDaLoc = useMemo(
        () =>
            danhSach.filter(
                (yeuCau) => yeuCau.trangThai === boLoc,
            ),
        [boLoc, danhSach],
    );

    return (
        <>
            <section className="mt-5">
                <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4 text-sm leading-6 text-blue-100/80">
                    Đây là các yêu cầu học viên đã chọn bạn và được quản trị viên
                    chuyển sang. Hãy kiểm tra lịch mong muốn trước khi đồng ý
                    nhận lớp.
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {[
                        ["cho_phan_hoi", "Chờ phản hồi"],
                        ["da_dong_y", "Đã đồng ý"],
                        ["tu_choi", "Đã từ chối"],
                    ].map(([giaTri, nhan]) => {
                        const soLuong = danhSach.filter(
                            (yeuCau) =>
                                yeuCau.trangThai === giaTri,
                        ).length;

                        return (
                            <button
                                key={giaTri}
                                type="button"
                                onClick={() => setBoLoc(giaTri)}
                                className={[
                                    "rounded-xl border px-4 py-2.5 text-sm font-bold transition",
                                    boLoc === giaTri
                                        ? "border-blue-400/30 bg-blue-600 text-white"
                                        : "border-white/10 bg-white/5 text-white/55 hover:text-white",
                                ].join(" ")}
                            >
                                {nhan} ({soLuong})
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 space-y-4">
                    {danhSach.length === 0 ? (
                        <TrangThaiRong
                            tieuDe="Chưa có yêu cầu đặt gia sư"
                            noiDung="Khu vực các yêu cầu sẽ xuất hiện ở đây."
                        />
                    ) : danhSachDaLoc.length === 0 ? (
                        <TrangThaiRong
                            tieuDe="Không có yêu cầu trong nhóm này"
                            noiDung="Thử đổi bộ lọc trạng thái để xem các yêu cầu khác."
                        />
                    ) : (
                        danhSachDaLoc.map((yeuCau) => (
                            <TheYeuCau
                                key={yeuCau.id}
                                yeuCau={yeuCau}
                                onXem={() => setYeuCauDangXem(yeuCau)}
                                dangXuLy={dangXuLyId === yeuCau.id}
                                onDongY={() => onDongY(yeuCau)}
                                onTuChoi={() =>
                                    setYeuCauDangTuChoi(yeuCau)
                                }
                            />
                        ))
                    )}
                </div>
            </section>

            {yeuCauDangXem && (
                <ModalChiTietYeuCau
                    yeuCau={
                        danhSach.find(
                            (yeuCau) =>
                                yeuCau.id === yeuCauDangXem.id,
                        ) || yeuCauDangXem
                    }
                    onDong={() => setYeuCauDangXem(null)}
                    dangXuLy={dangXuLyId === yeuCauDangXem.id}
                    onDongY={() => onDongY(yeuCauDangXem)}
                    onTuChoi={() =>
                        setYeuCauDangTuChoi(yeuCauDangXem)
                    }
                />
            )}

            {yeuCauDangTuChoi && (
                <ModalTuChoiYeuCau
                    yeuCau={yeuCauDangTuChoi}
                    onDong={() => setYeuCauDangTuChoi(null)}
                    dangXuLy={dangXuLyId === yeuCauDangTuChoi.id}
                    onXacNhan={(yeuCau, lyDo) => {
                        onTuChoi(yeuCau, lyDo);
                        setYeuCauDangTuChoi(null);
                    }}
                />
            )}
        </>
    );
}

function TheYeuCau({ yeuCau, dangXuLy, onXem, onDongY, onTuChoi }) {
    const trangThai = trangThaiYeuCau[yeuCau.trangThai];
    const dangCho = yeuCau.trangThai === "cho_phan_hoi";

    return (
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a132d]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wide text-white/35">
                        {yeuCau.maYeuCau}
                    </span>
                    <span className="ml-3 text-xs text-white/35">
                        Admin gửi lúc {yeuCau.guiLuc}
                    </span>
                </div>
                <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${trangThai.lop}`}
                >
                    {trangThai.nhan}
                </span>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)_auto] lg:items-center">
                <div>
                    <p className="text-lg font-extrabold">
                        {yeuCau.mon} · {yeuCau.capHoc}
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                        {yeuCau.lop} · {yeuCau.soBuoi} buổi ·{" "}
                        {yeuCau.gioMoiBuoi} giờ/buổi
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white/65">
                        <IconLichDay ten="user" className="h-4 w-4" />
                        {yeuCau.hocVien}
                    </p>
                </div>

                <div className="space-y-2 text-sm text-white/55">
                    <p className="flex gap-2">
                        <IconLichDay
                            ten="calendar"
                            className="mt-0.5 h-4 w-4 shrink-0"
                        />
                        <span>{yeuCau.lichMongMuon}</span>
                    </p>
                    <p className="flex gap-2">
                        <IconLichDay
                            ten={
                                yeuCau.hinhThuc === "Trực tuyến"
                                    ? "video"
                                    : "location"
                            }
                            className="mt-0.5 h-4 w-4 shrink-0"
                        />
                        <span>
                            {yeuCau.hinhThuc} · {yeuCau.diaDiem}
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                        type="button"
                        onClick={onXem}
                        className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-blue-200 hover:bg-blue-500/10"
                    >
                        Xem chi tiết
                    </button>
                    {dangCho && (
                        <>
                            <button
                                type="button"
                                onClick={onTuChoi}
                                disabled={dangXuLy}
                                className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-200 hover:bg-red-500/20"
                            >
                                Từ chối
                            </button>
                            <button
                                type="button"
                                onClick={onDongY}
                                disabled={dangXuLy}
                                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {dangXuLy ? "Đang xử lý..." : "Đồng ý nhận lớp"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {yeuCau.lyDoTuChoi && (
                <div className="border-t border-red-400/15 bg-red-400/5 px-5 py-3 text-sm text-red-200">
                    <span className="font-bold">Lý do từ chối:</span>{" "}
                    {yeuCau.lyDoTuChoi}
                </div>
            )}
        </article>
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

export default TabYeuCauDatGiaSu;
