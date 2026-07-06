import { useMemo, useState } from "react";
import IconLichDay from "./IconLichDay";

const TRANG_THAI = {
    cho_gia_su_xac_nhan: {
        nhan: "Chờ phản hồi",
        lop: "bg-amber-50 text-amber-700",
    },
    giasu_dong_y: {
        nhan: "Đã đồng ý",
        lop: "bg-emerald-50 text-emerald-700",
    },
    giasu_tu_choi: {
        nhan: "Đã từ chối",
        lop: "bg-red-50 text-red-700",
    },
    da_duyet: {
        nhan: "Admin đã duyệt",
        lop: "bg-blue-50 text-blue-700",
    },
    tu_choi: {
        nhan: "Admin từ chối",
        lop: "bg-slate-100 text-slate-600",
    },
};

function TabYeuCauDoiBuoi({ danhSach, dangXuLyId, onDongY, onTuChoi }) {
    const [boLoc, setBoLoc] = useState("cho_gia_su_xac_nhan");

    const danhSachDaLoc = useMemo(
        () => danhSach.filter((yeuCau) => yeuCau.trangThai === boLoc),
        [boLoc, danhSach],
    );

    return (
        <section className="mt-5">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100/80">
                Admin đã kiểm tra yêu cầu đổi buổi và gửi sang bạn. Bạn chỉ cần đồng ý hoặc từ chối, admin sẽ là người chốt cập nhật lịch.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(TRANG_THAI).map(([giaTri, trangThai]) => {
                    const soLuong = danhSach.filter((yeuCau) => yeuCau.trangThai === giaTri).length;

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
                            {trangThai.nhan} ({soLuong})
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 space-y-4">
                {danhSach.length === 0 ? (
                    <TrangThaiRong tieuDe="Chưa có yêu cầu đổi buổi" noiDung="Khi admin gửi yêu cầu đổi buổi, danh sách sẽ xuất hiện ở đây." />
                ) : danhSachDaLoc.length === 0 ? (
                    <TrangThaiRong tieuDe="Không có yêu cầu trong nhóm này" noiDung="Thử đổi bộ lọc trạng thái để xem các yêu cầu khác." />
                ) : (
                    danhSachDaLoc.map((yeuCau) => (
                        <TheYeuCauDoiBuoi
                            key={yeuCau.id}
                            yeuCau={yeuCau}
                            dangXuLy={dangXuLyId === `doi-buoi-${yeuCau.id}`}
                            onDongY={() => onDongY(yeuCau)}
                            onTuChoi={() => {
                                const lyDo = window.prompt("Nhập lý do từ chối đổi buổi:");
                                if (lyDo === null) return;
                                onTuChoi(yeuCau, lyDo.trim());
                            }}
                        />
                    ))
                )}
            </div>
        </section>
    );
}

function TheYeuCauDoiBuoi({ yeuCau, dangXuLy, onDongY, onTuChoi }) {
    const trangThai = TRANG_THAI[yeuCau.trangThai] || TRANG_THAI.cho_gia_su_xac_nhan;
    const dangCho = yeuCau.trangThai === "cho_gia_su_xac_nhan";

    return (
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a132d]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wide text-white/35">{yeuCau.maYeuCau}</span>
                    <span className="ml-3 text-xs text-white/35">Gửi lúc {yeuCau.ngayYeuCau}</span>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${trangThai.lop}`}>
                    {trangThai.nhan}
                </span>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)_auto] lg:items-center">
                <div>
                    <p className="text-lg font-extrabold">{yeuCau.monHoc?.tenHienThi || "Buổi học"}</p>
                    <p className="mt-1 text-sm text-white/45">Học viên {yeuCau.hocVien?.hoTen || "Chưa cập nhật"}</p>
                    <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm leading-6 text-white/65">{yeuCau.lyDo}</p>
                </div>

                <div className="grid gap-3 text-sm text-white/55 sm:grid-cols-2 lg:grid-cols-1">
                    <DongLich ngay={yeuCau.ngayHocText} gio={yeuCau.khungGio} />
                </div>

                {dangCho && (
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button
                            type="button"
                            onClick={onTuChoi}
                            disabled={dangXuLy}
                            className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                        >
                            Từ chối
                        </button>
                        <button
                            type="button"
                            onClick={onDongY}
                            disabled={dangXuLy}
                            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                        >
                            {dangXuLy ? "Đang xử lý..." : "Đồng ý đổi buổi"}
                        </button>
                    </div>
                )}
            </div>

        </article>
    );
}

function DongLich({ ngay, gio }) {
    if (!ngay && !gio) return null;

    return (
        <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-white/35">
                <IconLichDay ten="calendar" className="h-4 w-4" />
                Lịch đề xuất
            </div>
            <div className="mt-2 font-bold text-white">{ngay || "Chưa rõ"}</div>
            <div>{gio || ""}</div>
        </div>
    );
}

function TrangThaiRong({ tieuDe, noiDung }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-blue-200">
                <IconLichDay ten="calendar" />
            </div>
            <p className="mt-4 text-sm font-extrabold text-white">{tieuDe}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">{noiDung}</p>
        </div>
    );
}

export default TabYeuCauDoiBuoi;
