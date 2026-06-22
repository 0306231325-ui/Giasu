import { useMemo, useState } from "react";
import ChiTietXetDuyet from "./gia-su/ChiTietXetDuyet";
import DanhSachChoDuyet from "./gia-su/DanhSachChoDuyet";
import DanhSachGiaSuAdmin from "./gia-su/DanhSachGiaSuAdmin";
import ModalTuChoi from "./gia-su/ModalTuChoi";
import { hoSoChoDuyet } from "./gia-su/duLieuXetDuyet";

function AdminGiaSu() {
    const [tab, setTab] = useState("xet_duyet");
    const [tuKhoa, setTuKhoa] = useState("");
    const [hoSoDangChon, setHoSoDangChon] = useState(hoSoChoDuyet[0]);
    const [hoSoTuChoi, setHoSoTuChoi] = useState(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState("");

    const danhSachDaLoc = useMemo(() => {
        const tuKhoaChuan = tuKhoa.trim().toLocaleLowerCase("vi");
        if (!tuKhoaChuan) return hoSoChoDuyet;
        return hoSoChoDuyet.filter((hoSo) =>
            [hoSo.hoTen, hoSo.email, hoSo.sdt].some((giaTri) =>
                giaTri.toLocaleLowerCase("vi").includes(tuKhoaChuan),
            ),
        );
    }, [tuKhoa]);

    return (
        <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="text-2xl font-extrabold">Quản lý gia sư</div>
                    <p className="mt-2 text-sm text-white/60">
                        Xét duyệt hồ sơ đăng ký và quản lý gia sư trên hệ thống.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:flex">
                    <ThongKe nhan="Chờ duyệt" giaTri="3" mau="amber" />
                    <ThongKe nhan="Đã duyệt" giaTri="24" mau="emerald" />
                    <ThongKe nhan="Từ chối" giaTri="2" mau="red" />
                </div>
            </div>

            <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1">
                <Tab
                    active={tab === "xet_duyet"}
                    onClick={() => setTab("xet_duyet")}
                    label="Xét duyệt hồ sơ"
                    badge={hoSoChoDuyet.length}
                />
                <Tab
                    active={tab === "danh_sach"}
                    onClick={() => setTab("danh_sach")}
                    label="Danh sách gia sư"
                />
            </div>

            {tab === "xet_duyet" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
                    <DanhSachChoDuyet
                        danhSach={danhSachDaLoc}
                        hoSoDangChon={hoSoDangChon}
                        tuKhoa={tuKhoa}
                        onDoiTuKhoa={(event) => setTuKhoa(event.target.value)}
                        onChon={setHoSoDangChon}
                    />
                    <ChiTietXetDuyet
                        hoSo={hoSoDangChon}
                        onDuyet={() => {}}
                        onTuChoi={() => {
                            setLyDoTuChoi("");
                            setHoSoTuChoi(hoSoDangChon);
                        }}
                    />
                </div>
            ) : (
                <DanhSachGiaSuAdmin />
            )}

            <ModalTuChoi
                hoSo={hoSoTuChoi}
                lyDo={lyDoTuChoi}
                onDoiLyDo={(event) => setLyDoTuChoi(event.target.value)}
                onDong={() => setHoSoTuChoi(null)}
            />
        </div>
    );
}

function Tab({ active, onClick, label, badge }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-bold transition",
                active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-white/55 hover:bg-white/5 hover:text-white",
            ].join(" ")}
        >
            {label}
            {badge !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white/20" : "bg-amber-400/15 text-amber-300"}`}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function ThongKe({ nhan, giaTri, mau }) {
    const lopMau = {
        amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        red: "border-red-400/20 bg-red-400/10 text-red-300",
    }[mau];
    return (
        <div className={`min-w-24 rounded-xl border px-3 py-2 text-center ${lopMau}`}>
            <p className="text-lg font-extrabold">{giaTri}</p>
            <p className="text-[11px] font-semibold opacity-75">{nhan}</p>
        </div>
    );
}

export default AdminGiaSu;
