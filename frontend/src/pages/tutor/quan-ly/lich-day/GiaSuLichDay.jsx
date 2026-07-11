import TabDanhSachLichHoc from "./components/TabDanhSachLichHoc";
import TabLichTuan from "./components/TabLichTuan";
import TabYeuCauDatGiaSu from "./components/TabYeuCauDatGiaSu";
import TabYeuCauDoiBuoi from "./components/TabYeuCauDoiBuoi";
import useQuanLyLichDay from "./hooks/useQuanLyLichDay";

function GiaSuLichDay() {
    const {
        tab,
        setTab,
        danhSachLichHoc,
        danhSachYeuCau,
        danhSachYeuCauDoiBuoi,
        dangTai,
        dangXuLyId,
        soYeuCauChoPhanHoi,
        soYeuCauDoiBuoiChoPhanHoi,
        xacNhanBuoiHoc,
        capNhatLinkHocOnline,
        phanHoiYeuCau,
        phanHoiYeuCauDoiBuoi,
        layKhoangThoiGianBan,
        guiYeuCauDoiBuoi,
    } = useQuanLyLichDay();

    return (
        <div className="mx-auto max-w-7xl pb-10">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Quản lý lịch học
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                    Tiếp nhận yêu cầu đặt gia sư được quản trị viên chuyển đến và
                    quản lý những buổi học đã được xác nhận.
                </p>
            </div>

            <div className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 lg:grid-cols-4">
                <NutTab
                    dangChon={tab === "lich_hoc"}
                    onClick={() => setTab("lich_hoc")}
                    tieuDe="Danh sách lịch học"
                    moTa="Các buổi học đã được xác nhận"
                    soLuong={danhSachLichHoc.length}
                />
                <NutTab
                    dangChon={tab === "lich_tuan"}
                    onClick={() => setTab("lich_tuan")}
                    tieuDe="Lịch tuần"
                    moTa="Xem lịch theo thứ và khung giờ"
                    soLuong={danhSachLichHoc.length}
                />
                <NutTab
                    dangChon={tab === "yeu_cau"}
                    onClick={() => setTab("yeu_cau")}
                    tieuDe="Yêu cầu đặt gia sư"
                    moTa="Yêu cầu đang chờ bạn phản hồi"
                    soLuong={soYeuCauChoPhanHoi}
                    canChuY={soYeuCauChoPhanHoi > 0}
                />
                <NutTab
                    dangChon={tab === "doi_buoi"}
                    onClick={() => setTab("doi_buoi")}
                    tieuDe="Yêu cầu đổi buổi"
                    moTa="Admin gửi để bạn xác nhận"
                    soLuong={soYeuCauDoiBuoiChoPhanHoi}
                    canChuY={soYeuCauDoiBuoiChoPhanHoi > 0}
                />
            </div>

            {dangTai ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-12 text-center text-sm font-semibold text-white/55">
                    Đang tải dữ liệu lịch dạy...
                </div>
            ) : tab === "lich_hoc" ? (
                <TabDanhSachLichHoc
                    danhSach={danhSachLichHoc}
                    dangXuLyId={dangXuLyId}
                    onXacNhan={xacNhanBuoiHoc}
                    onCapNhatLinkHocOnline={capNhatLinkHocOnline}
                    onLayKhoangThoiGianBan={layKhoangThoiGianBan}
                    onGuiYeuCauDoiBuoi={guiYeuCauDoiBuoi}
                />
            ) : tab === "lich_tuan" ? (
                <TabLichTuan
                    danhSach={danhSachLichHoc}
                    dangXuLyId={dangXuLyId}
                    onXacNhan={xacNhanBuoiHoc}
                    onCapNhatLinkHocOnline={capNhatLinkHocOnline}
                    onLayKhoangThoiGianBan={layKhoangThoiGianBan}
                    onGuiYeuCauDoiBuoi={guiYeuCauDoiBuoi}
                />
            ) : tab === "yeu_cau" ? (
                <TabYeuCauDatGiaSu
                    danhSach={danhSachYeuCau}
                    dangXuLyId={dangXuLyId}
                    onDongY={(yeuCau) => phanHoiYeuCau(yeuCau, "dong_y")}
                    onTuChoi={(yeuCau, lyDo) => phanHoiYeuCau(yeuCau, "tu_choi", lyDo)}
                />
            ) : (
                <TabYeuCauDoiBuoi
                    danhSach={danhSachYeuCauDoiBuoi}
                    dangXuLyId={dangXuLyId}
                    onDongY={(yeuCau) => phanHoiYeuCauDoiBuoi(yeuCau, "dong_y")}
                    onTuChoi={(yeuCau, lyDo) => phanHoiYeuCauDoiBuoi(yeuCau, "tu_choi", lyDo)}
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
