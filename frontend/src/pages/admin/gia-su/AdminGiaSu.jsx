import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import ChiTietXetDuyet from "./ChiTietXetDuyet";
import DanhSachChoDuyet from "./DanhSachChoDuyet";
import DanhSachGiaSuAdmin from "./DanhSachGiaSuAdmin";
import ModalTuChoi from "./ModalTuChoi";

function AdminGiaSu() {
    const [tab, setTab] = useState("xet_duyet");
    const [tuKhoa, setTuKhoa] = useState("");
    const [danhSachChoDuyet, setDanhSachChoDuyet] = useState([]);
    const [hoSoDangChon, setHoSoDangChon] = useState(null);
    const [hoSoTuChoi, setHoSoTuChoi] = useState(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState("");
    const [heSoGiaDuyet, setHeSoGiaDuyet] = useState("0");
    const [thongKe, setThongKe] = useState({
        choDuyet: 0,
        daDuyet: 0,
        tuChoi: 0,
    });
    const [dangTai, setDangTai] = useState(false);
    const [dangXuLy, setDangXuLy] = useState(false);
    const [thongBao, setThongBao] = useState("");
    const boDemThongBao = useRef(null);

    const hienThongBao = useCallback((noiDung) => {
        if (boDemThongBao.current) {
            clearTimeout(boDemThongBao.current);
        }

        setThongBao(noiDung);
        boDemThongBao.current = setTimeout(() => {
            setThongBao("");
            boDemThongBao.current = null;
        }, 3000);
    }, []);

    const taiHoSoChoDuyet = useCallback(async (tuKhoaTimKiem = "", { capNhatDanhSach = true } = {}) => {
        setDangTai(true);
        try {
            const response = await api.get("/admin/gia-su/xet-duyet", {
                params: { q: tuKhoaTimKiem || undefined },
            });

            if (response.data?.success) {
                const danhSach = response.data.data?.hoSo ?? [];
                setDanhSachChoDuyet(danhSach);
                setThongKe(response.data.data?.thongKe ?? {
                    choDuyet: danhSach.length,
                    daDuyet: 0,
                    tuChoi: 0,
                });

                if (!capNhatDanhSach) {
                    return;
                }

                const hoSoDuocChon =
                    danhSach.find((hoSo) => hoSo.id === hoSoDangChon?.id) ??
                    danhSach[0] ??
                    null;
                setHoSoDangChon(hoSoDuocChon);
                setHeSoGiaDuyet(String(hoSoDuocChon?.heSoGia ?? 0));
            }
        } catch (error) {
            hienThongBao(error.response?.data?.message || "Không thể tải hồ sơ chờ duyệt.");
            if (capNhatDanhSach) {
                setDanhSachChoDuyet([]);
                setHoSoDangChon(null);
                setHeSoGiaDuyet("0");
            }
        } finally {
            setDangTai(false);
        }
    }, [hienThongBao, hoSoDangChon?.id]);

    useEffect(() => {
        return () => {
            if (boDemThongBao.current) {
                clearTimeout(boDemThongBao.current);
            }
        };
    }, []);

    useEffect(() => {
        if (tab !== "xet_duyet") return undefined;

        const boDem = setTimeout(() => {
            taiHoSoChoDuyet(tuKhoa);
        }, 350);

        return () => clearTimeout(boDem);
    }, [taiHoSoChoDuyet, tuKhoa, tab]);

    useEffect(() => {
        const lamMoi = () => {
            if (tab === "xet_duyet") {
                taiHoSoChoDuyet(tuKhoa);
                return;
            }

            taiHoSoChoDuyet("", { capNhatDanhSach: false });
        };

        window.addEventListener("admin:refresh", lamMoi);

        return () => {
            window.removeEventListener("admin:refresh", lamMoi);
        };
    }, [taiHoSoChoDuyet, tuKhoa, tab]);

    const xuLyHoSo = async (hoSo, hanhDong, lyDo = "", heSoGia = 0) => {
        if (!hoSo || dangXuLy) return;

        setDangXuLy(true);
        try {
            const response = await api.patch(`/admin/gia-su/xet-duyet/${hoSo.id}`, {
                hanh_dong: hanhDong,
                he_so_gia: hanhDong === "duyet" ? Number(heSoGia || 0) : undefined,
                ly_do: lyDo || undefined,
            });

            if (response.data?.success) {
                hienThongBao(response.data.message);
                setHoSoTuChoi(null);
                setLyDoTuChoi("");
                await taiHoSoChoDuyet(tuKhoa);
            }
        } catch (error) {
            hienThongBao(error.response?.data?.message || "Không thể xử lý hồ sơ.");
        } finally {
            setDangXuLy(false);
        }
    };

    const xemTaiLieu = async (taiLieu) => {
        if (!taiLieu?.urlXem) return;

        try {
            const response = await api.get(taiLieu.urlXem, {
                responseType: "blob",
            });
            const duongDanTam = URL.createObjectURL(response.data);
            window.open(duongDanTam, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(duongDanTam), 60_000);
        } catch (error) {
            hienThongBao(error.response?.data?.message || "Không thể mở file tài liệu.");
        }
    };

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
                    <ThongKe
                        nhan="Chờ duyệt"
                        giaTri={thongKe.choDuyet}
                        mau="amber"
                        active={tab === "xet_duyet"}
                        onClick={() => setTab("xet_duyet")}
                    />
                    <ThongKe
                        nhan="Đã duyệt"
                        giaTri={thongKe.daDuyet}
                        mau="emerald"
                        active={tab === "danh_sach"}
                        onClick={() => setTab("danh_sach")}
                    />
                    <ThongKe
                        nhan="Từ chối"
                        giaTri={thongKe.tuChoi}
                        mau="red"
                        active={tab === "tu_choi"}
                        onClick={() => setTab("tu_choi")}
                    />
                </div>
            </div>

            {thongBao && (
                <div className="mt-5 rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100">
                    {thongBao}
                </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1">
                    <Tab
                        active={tab === "xet_duyet"}
                        onClick={() => setTab("xet_duyet")}
                        label="Xét duyệt hồ sơ"
                        badge={thongKe.choDuyet}
                    />
                    <Tab
                        active={tab === "danh_sach"}
                        onClick={() => setTab("danh_sach")}
                        label="Danh sách gia sư"
                    />
                    <Tab
                        active={tab === "tu_choi"}
                        onClick={() => setTab("tu_choi")}
                        label="Hồ sơ bị từ chối"
                        badge={thongKe.tuChoi}
                    />
                </div>

                {tab === "xet_duyet" && (
                    <button
                        type="button"
                        onClick={() => taiHoSoChoDuyet(tuKhoa)}
                        disabled={dangTai}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/80 transition hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className={dangTai ? "animate-spin" : ""}>↻</span>
                        {dangTai ? "Đang làm mới..." : "Làm mới"}
                    </button>
                )}
            </div>

            {tab === "xet_duyet" ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
                    <DanhSachChoDuyet
                        danhSach={danhSachChoDuyet}
                        hoSoDangChon={hoSoDangChon}
                        tuKhoa={tuKhoa}
                        dangTai={dangTai}
                        onDoiTuKhoa={(event) => setTuKhoa(event.target.value)}
                        onChon={(hoSo) => {
                            setHoSoDangChon(hoSo);
                            setHeSoGiaDuyet(String(hoSo?.heSoGia ?? 0));
                        }}
                    />
                    <ChiTietXetDuyet
                        hoSo={hoSoDangChon}
                        heSoGia={heSoGiaDuyet}
                        onDoiHeSoGia={(event) => setHeSoGiaDuyet(event.target.value)}
                        dangXuLy={dangXuLy}
                        onDuyet={() => xuLyHoSo(hoSoDangChon, "duyet", "", heSoGiaDuyet)}
                        onTuChoi={() => {
                            setLyDoTuChoi("");
                            setHoSoTuChoi(hoSoDangChon);
                        }}
                        onXemTaiLieu={xemTaiLieu}
                    />
                </div>
            ) : (
                <DanhSachGiaSuAdmin
                    key={tab}
                    trangThaiHoSo={tab === "tu_choi" ? "tu_choi" : "duyet"}
                />
            )}

            <ModalTuChoi
                hoSo={hoSoTuChoi}
                lyDo={lyDoTuChoi}
                onDoiLyDo={(event) => setLyDoTuChoi(event.target.value)}
                onDong={() => setHoSoTuChoi(null)}
                dangXuLy={dangXuLy}
                onXacNhan={() => xuLyHoSo(hoSoTuChoi, "tu_choi", lyDoTuChoi)}
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

function ThongKe({ nhan, giaTri, mau, active, onClick }) {
    const lopMau = {
        amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        red: "border-red-400/20 bg-red-400/10 text-red-300",
    }[mau];
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "min-w-24 rounded-xl border px-3 py-2 text-center transition hover:scale-[1.02]",
                lopMau,
                active ? "ring-2 ring-white/20" : "",
            ].join(" ")}
        >
            <p className="text-lg font-extrabold">{giaTri}</p>
            <p className="text-[11px] font-semibold opacity-75">{nhan}</p>
        </button>
    );
}

export default AdminGiaSu;
