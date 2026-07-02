import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import TabDanhSachLichHoc from "./lich-day/TabDanhSachLichHoc";
import TabLichTuan from "./lich-day/TabLichTuan";
import TabYeuCauDatGiaSu from "./lich-day/TabYeuCauDatGiaSu";

function GiaSuLichDay() {
    const [tab, setTab] = useState("lich_hoc");
    const [danhSachLichHoc, setDanhSachLichHoc] = useState([]);
    const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
    const [dangTai, setDangTai] = useState(false);
    const [dangXuLyId, setDangXuLyId] = useState(null);
    const [thongBao, setThongBao] = useState("");
    const boDemThongBao = useRef(null);

    const hienThongBao = (noiDung) => {
        if (boDemThongBao.current) {
            clearTimeout(boDemThongBao.current);
        }

        setThongBao(noiDung);
        boDemThongBao.current = setTimeout(() => {
            setThongBao("");
            boDemThongBao.current = null;
        }, 3000);
    };

    const taiDuLieu = useCallback(async () => {
        setDangTai(true);

        try {
            const [lichHocResponse, yeuCauResponse] = await Promise.all([
                api.get("/gia-su/lich-day"),
                api.get("/gia-su/yeu-cau-dat-goi"),
            ]);

            setDanhSachLichHoc(lichHocResponse.data.data || []);
            setDanhSachYeuCau(yeuCauResponse.data.data || []);
        } catch (error) {
            console.error("Không thể tải lịch dạy gia sư:", error);
            hienThongBao(error.response?.data?.message || "Không thể tải dữ liệu lịch dạy.");
        } finally {
            setDangTai(false);
        }
    }, []);

    useEffect(() => {
        const boDemTaiLanDau = setTimeout(() => {
            taiDuLieu();
        }, 0);

        return () => {
            clearTimeout(boDemTaiLanDau);
            if (boDemThongBao.current) {
                clearTimeout(boDemThongBao.current);
            }
        };
    }, [taiDuLieu]);

    const soYeuCauChoPhanHoi = danhSachYeuCau.filter(
        (yeuCau) => yeuCau.trangThai === "cho_phan_hoi",
    ).length;

    const capNhatYeuCau = (yeuCauMoi) => {
        setDanhSachYeuCau((hienTai) =>
            hienTai.map((yeuCau) =>
                yeuCau.id === yeuCauMoi.id ? yeuCauMoi : yeuCau,
            ),
        );
    };

    const capNhatLichHoc = (lichMoi) => {
        setDanhSachLichHoc((hienTai) =>
            hienTai.map((lichHoc) =>
                lichHoc.id === lichMoi.id ? lichMoi : lichHoc,
            ),
        );
    };

    const xacNhanBuoiHoc = async (lichHoc, payload) => {
        if (!lichHoc || dangXuLyId) return;

        setDangXuLyId(`lich-${lichHoc.id}`);

        try {
            const response = await api.post(
                `/gia-su/lich-day/${lichHoc.id}/xac-nhan-hoan-thanh`,
                payload,
            );

            capNhatLichHoc(response.data.data);
            hienThongBao(response.data.message || "Da ghi nhan xac nhan buoi hoc.");
        } catch (error) {
            console.error("Khong the xac nhan buoi hoc:", error);
            hienThongBao(error.response?.data?.message || "Khong the xac nhan buoi hoc.");
        } finally {
            setDangXuLyId(null);
        }
    };

    const phanHoiYeuCau = async (yeuCau, ketQua, lyDo = "") => {
        if (!yeuCau || dangXuLyId) return;

        setDangXuLyId(yeuCau.id);

        try {
            const response = await api.patch(`/gia-su/yeu-cau-dat-goi/${yeuCau.id}/phan-hoi`, {
                phan_hoi: ketQua,
                ly_do: lyDo,
            });

            capNhatYeuCau(response.data.data);
            hienThongBao(response.data.message || "Đã ghi nhận phản hồi của bạn.");

            if (ketQua === "dong_y") {
                taiDuLieu();
            }
        } catch (error) {
            console.error("Không thể phản hồi yêu cầu đặt gói:", error);
            hienThongBao(error.response?.data?.message || "Không thể phản hồi yêu cầu đặt gói.");
        } finally {
            setDangXuLyId(null);
        }
    };

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

            {thongBao && (
                <div className="mt-4 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100">
                    {thongBao}
                </div>
            )}

            <div className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 lg:grid-cols-3">
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
                />
            ) : tab === "lich_tuan" ? (
                <TabLichTuan
                    danhSach={danhSachLichHoc}
                    dangXuLyId={dangXuLyId}
                    onXacNhan={xacNhanBuoiHoc}
                />
            ) : (
                <TabYeuCauDatGiaSu
                    danhSach={danhSachYeuCau}
                    dangXuLyId={dangXuLyId}
                    onDongY={(yeuCau) => phanHoiYeuCau(yeuCau, "dong_y")}
                    onTuChoi={(yeuCau, lyDo) => phanHoiYeuCau(yeuCau, "tu_choi", lyDo)}
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
