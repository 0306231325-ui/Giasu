import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ModalXacNhan from "./ModalXacNhan";

function ThongBaoDropdown({
    tieuDe = "Thông báo",
    moTaRong = "Các cập nhật mới của bạn sẽ hiển thị tại đây.",
}) {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [dangMo, setDangMo] = useState(false);
    const [dangTai, setDangTai] = useState(false);
    const [dangXoaTatCa, setDangXoaTatCa] = useState(false);
    const [moXacNhanXoaTatCa, setMoXacNhanXoaTatCa] = useState(false);
    const [danhSach, setDanhSach] = useState([]);
    const [soLuongChuaDoc, setSoLuongChuaDoc] = useState(0);
    const hopThongBaoRef = useRef(null);

    const taiThongBao = useCallback(async () => {
        setDangTai(true);
        try {
            const response = await api.get("/thong-bao");
            if (response.data?.success) {
                setDanhSach(response.data.data?.danhSach ?? []);
                setSoLuongChuaDoc(response.data.data?.chuaDoc ?? 0);
            }
        } catch {
            setDanhSach([]);
            setSoLuongChuaDoc(0);
        } finally {
            setDangTai(false);
        }
    }, []);

    useEffect(() => {
        const boDem = setTimeout(() => {
            taiThongBao();
        }, 0);

        return () => clearTimeout(boDem);
    }, [taiThongBao]);

    useEffect(() => {
        const langNgheLamMoi = () => {
            taiThongBao();
        };

        window.addEventListener("giasu:refresh", langNgheLamMoi);
        window.addEventListener("admin:refresh", langNgheLamMoi);

        return () => {
            window.removeEventListener("giasu:refresh", langNgheLamMoi);
            window.removeEventListener("admin:refresh", langNgheLamMoi);
        };
    }, [taiThongBao]);

    useEffect(() => {
        const dongKhiBamNgoai = (event) => {
            if (
                hopThongBaoRef.current &&
                !hopThongBaoRef.current.contains(event.target)
            ) {
                setDangMo(false);
            }
        };

        document.addEventListener("mousedown", dongKhiBamNgoai);

        return () => {
            document.removeEventListener("mousedown", dongKhiBamNgoai);
        };
    }, []);

    const bamThongBao = async (thongBao) => {
        if (!thongBao.daDoc) {
            setDanhSach((hienTai) =>
                hienTai.map((item) =>
                    item.id === thongBao.id ? { ...item, daDoc: true } : item,
                ),
            );
            setSoLuongChuaDoc((hienTai) => Math.max(0, hienTai - 1));

            try {
                await api.patch(`/thong-bao/${thongBao.id}/da-doc`);
            } catch {
                // Không chặn điều hướng nếu đánh dấu đã đọc thất bại.
            }
        }

        if (thongBao.url) {
            setDangMo(false);
            if (thongBao.url.startsWith("/gia-su/quan-ly")) {
                try {
                    const response = await api.get("/me");
                    if (response.data?.success) {
                        updateUser(response.data.data);
                    }
                } catch {
                    // Nếu cập nhật user thất bại vẫn cho điều hướng, layout sẽ tự chặn nếu chưa đủ quyền.
                }
            }
            navigate(thongBao.url);
        }
    };

    const moHopThoaiXoaTatCa = (event) => {
        event.stopPropagation();

        if (dangXoaTatCa || danhSach.length === 0) {
            return;
        }

        setMoXacNhanXoaTatCa(true);
    };

    const xoaTatCaThongBao = async () => {
        const danhSachCu = danhSach;
        const soLuongChuaDocCu = soLuongChuaDoc;

        setDangXoaTatCa(true);
        setMoXacNhanXoaTatCa(false);
        setDanhSach([]);
        setSoLuongChuaDoc(0);

        try {
            await api.delete("/thong-bao");
        } catch {
            setDanhSach(danhSachCu);
            setSoLuongChuaDoc(soLuongChuaDocCu);
        } finally {
            setDangXoaTatCa(false);
        }
    };

    const xoaThongBao = async (event, thongBao) => {
        event.stopPropagation();

        setDanhSach((hienTai) =>
            hienTai.filter((item) => item.id !== thongBao.id),
        );
        if (!thongBao.daDoc) {
            setSoLuongChuaDoc((hienTai) => Math.max(0, hienTai - 1));
        }

        try {
            await api.delete(`/thong-bao/${thongBao.id}`);
        } catch {
            taiThongBao();
        }
    };

    return (
        <div className="relative" ref={hopThongBaoRef}>
            <button
                type="button"
                onClick={() => {
                    setDangMo((giaTriHienTai) => {
                        const seMo = !giaTriHienTai;
                        if (seMo) {
                            taiThongBao();
                        }
                        return seMo;
                    });
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-blue-400/70 hover:bg-blue-500/15"
                aria-label="Mở thông báo"
                aria-expanded={dangMo}
                aria-haspopup="menu"
            >
                <IconChuong />

                {soLuongChuaDoc > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-[#081027]">
                        {soLuongChuaDoc > 9 ? "9+" : soLuongChuaDoc}
                    </span>
                )}
            </button>

            {dangMo && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-3 w-96 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1b3d] text-white shadow-2xl"
                >
                    <div className="border-b border-white/10 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base font-bold">{tieuDe}</h3>
                            <div className="flex items-center gap-2">
                                {danhSach.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={moHopThoaiXoaTatCa}
                                        disabled={dangXoaTatCa}
                                        className="rounded-full px-3 py-1 text-xs font-semibold text-white/45 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {dangXoaTatCa ? "Đang xoá..." : "Xoá hết"}
                                    </button>
                                )}
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                                    {soLuongChuaDoc} mới
                                </span>
                            </div>
                        </div>
                    </div>

                    {dangTai ? (
                        <div className="px-5 py-8 text-center text-sm font-semibold text-white/60">
                            Đang tải thông báo...
                        </div>
                    ) : danhSach.length === 0 ? (
                        <TrangThaiRong moTaRong={moTaRong} />
                    ) : (
                        <div className="max-h-[420px] overflow-y-auto p-2 [scrollbar-width:thin]">
                            {danhSach.map((thongBao) => (
                                <div
                                    key={thongBao.id}
                                    className={[
                                        "group rounded-xl border transition",
                                        thongBao.daDoc
                                            ? "border-transparent hover:bg-white/5"
                                            : "border-blue-400/25 bg-blue-500/10 hover:bg-blue-500/15",
                                    ].join(" ")}
                                >
                                    <button
                                        type="button"
                                        onClick={() => bamThongBao(thongBao)}
                                        className="w-full p-3 text-left"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={[
                                                    "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                                                    thongBao.daDoc
                                                        ? "bg-white/20"
                                                        : "bg-blue-400",
                                                ].join(" ")}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="text-sm font-extrabold text-white">
                                                        {thongBao.tieuDe}
                                                    </p>
                                                    <span className="shrink-0 text-[11px] font-semibold text-white/35">
                                                        {thongBao.thoiGian}
                                                    </span>
                                                </div>
                                                <p className="mt-1 line-clamp-3 text-xs leading-5 text-white/65">
                                                    {thongBao.noiDung}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                    <div className="flex items-center justify-between gap-3 px-8 pb-3 pl-9 text-[11px] font-semibold">
                                        <button
                                            type="button"
                                            onClick={(event) =>
                                                xoaThongBao(event, thongBao)
                                            }
                                            className="text-white/45 transition hover:text-red-300"
                                        >
                                            Xoá thông báo
                                        </button>
                                        {thongBao.url && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    bamThongBao(thongBao)
                                                }
                                                className="text-blue-300 transition hover:text-blue-200"
                                            >
                                                Nhấn để xem
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <ModalXacNhan
                mo={moXacNhanXoaTatCa}
                tieuDe="Xoá hết thông báo"
                moTa="Bạn có chắc muốn xoá toàn bộ thông báo hiện có? Thao tác này không thể hoàn tác."
                nutXacNhan="Xoá hết"
                bienThe="danger"
                dangXuLy={dangXoaTatCa}
                onDong={() => setMoXacNhanXoaTatCa(false)}
                onXacNhan={xoaTatCaThongBao}
            />
        </div>
    );
}

function TrangThaiRong({ moTaRong }) {
    return (
        <div className="px-5 py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-200">
                <IconThu />
            </div>
            <p className="mt-4 text-sm font-bold text-white">
                Chưa có thông báo mới
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
                {moTaRong}
            </p>
        </div>
    );
}

function IconChuong() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function IconThu() {
    return (
        <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 4h16v16H4z" />
            <path d="m22 6-10 7L2 6" />
        </svg>
    );
}

export default ThongBaoDropdown;
