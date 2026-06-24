import { useState } from "react";
import TabDanhSachLichHoc from "./lich-day/TabDanhSachLichHoc";
import TabYeuCauDatGiaSu from "./lich-day/TabYeuCauDatGiaSu";
import {
    danhSachLichHocMau,
    danhSachYeuCauMau,
} from "./lich-day/duLieuQuanLyLich";

function GiaSuLichDay() {
    const [tab, setTab] = useState("lich_hoc");
    const danhSachYeuCau = danhSachYeuCauMau;

    const soYeuCauChoPhanHoi = danhSachYeuCau.filter(
        (yeuCau) => yeuCau.trangThai === "cho_phan_hoi",
    ).length;

    return (
        <div className="mx-auto max-w-7xl pb-10">
            <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Quản lý giảng dạy
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Quản lý lịch học
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                    Tiếp nhận yêu cầu đặt gia sư được quản trị viên chuyển đến và
                    quản lý những buổi học đã được xác nhận.
                </p>
            </div>

            <div className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 sm:grid-cols-2">
                <NutTab
                    dangChon={tab === "lich_hoc"}
                    onClick={() => setTab("lich_hoc")}
                    tieuDe="Danh sách lịch học"
                    moTa="Các buổi học đã được xác nhận"
                    soLuong={danhSachLichHocMau.length}
                />
                <NutTab
                    dangChon={tab === "yeu_cau"}
                    onClick={() => setTab("yeu_cau")}
                    tieuDe="Yêu cầu đặt gia sư"
                    moTa="Yêu cầu đang chờ bạn phản hồi"
                    soLuong={soYeuCauChoPhanHoi}
                    canChuY={soYeuCauChoPhanHoi > 0}
                />
            </div>

            {tab === "lich_hoc" ? (
                <TabDanhSachLichHoc danhSach={danhSachLichHocMau} />
            ) : (
                <TabYeuCauDatGiaSu
                    danhSach={danhSachYeuCau}
                />
            )}
        </div>
    );
}

function NutTab({
    dangChon,
    onClick,
    tieuDe,
    moTa,
    soLuong,
    canChuY = false,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition",
                dangChon
                    ? "border-blue-400/30 bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                    : "border-transparent text-white/65 hover:bg-white/5 hover:text-white",
            ].join(" ")}
        >
            <span>
                <span className="block text-sm font-extrabold">{tieuDe}</span>
                <span
                    className={[
                        "mt-1 block text-xs",
                        dangChon ? "text-blue-100/75" : "text-white/35",
                    ].join(" ")}
                >
                    {moTa}
                </span>
            </span>
            <span
                className={[
                    "flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-extrabold",
                    canChuY && !dangChon
                        ? "bg-amber-400 text-slate-950"
                        : dangChon
                            ? "bg-white/15 text-white"
                            : "bg-white/10 text-white/60",
                ].join(" ")}
            >
                {soLuong}
            </span>
        </button>
    );
}

export default GiaSuLichDay;
