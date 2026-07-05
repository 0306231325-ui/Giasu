import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function ModalXemTaiLieu({ taiLieu, onDong, onLoi }) {
    const [duongDanTam, setDuongDanTam] = useState("");
    const [dangTai, setDangTai] = useState(false);
    const [loi, setLoi] = useState("");

    const tenFile = taiLieu?.tenFile || taiLieu?.ten || "Tài liệu minh chứng";
    const laPdf = useMemo(() => tenFile.toLowerCase().endsWith(".pdf"), [tenFile]);
    const duongDanHienThi = taiLieu?.urlTrucTiep || duongDanTam;
    const dangTaiHienThi = !taiLieu?.urlTrucTiep && dangTai;
    const loiHienThi = taiLieu?.urlTrucTiep ? "" : loi;

    useEffect(() => {
        if (!taiLieu || taiLieu.urlTrucTiep || !taiLieu.urlXem) return undefined;

        let conHieuLuc = true;
        let urlTam = "";

        const taiFile = async () => {
            setDangTai(true);
            setLoi("");

            try {
                const response = await api.get(taiLieu.urlXem, { responseType: "blob" });
                if (!conHieuLuc) return;

                urlTam = URL.createObjectURL(response.data);
                setDuongDanTam(urlTam);
            } catch (error) {
                if (!conHieuLuc) return;

                const thongBao = error.response?.data?.message || "Không thể mở file minh chứng.";
                setLoi(thongBao);
                onLoi?.(thongBao);
            } finally {
                if (conHieuLuc) setDangTai(false);
            }
        };

        taiFile();

        return () => {
            conHieuLuc = false;
            if (urlTam) {
                URL.revokeObjectURL(urlTam);
            }
        };
    }, [onLoi, taiLieu]);

    if (!taiLieu) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-extrabold">{taiLieu.tieuDe || tenFile}</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{tenFile}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onDong}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </div>

                <div className="min-h-[420px] flex-1 overflow-auto bg-slate-100 p-4">
                    {dangTaiHienThi && (
                        <div className="flex min-h-[420px] items-center justify-center text-sm font-bold text-slate-500">
                            Đang tải tài liệu...
                        </div>
                    )}

                    {!dangTaiHienThi && loiHienThi && (
                        <div className="flex min-h-[420px] items-center justify-center text-center text-sm font-bold text-red-600">
                            {loiHienThi}
                        </div>
                    )}

                    {!dangTaiHienThi && !loiHienThi && duongDanHienThi && (
                        laPdf ? (
                            <iframe
                                title={tenFile}
                                src={duongDanHienThi}
                                className="h-[72vh] w-full rounded-2xl border border-slate-200 bg-white"
                            />
                        ) : (
                            <div className="flex min-h-[420px] items-center justify-center">
                                <img
                                    src={duongDanHienThi}
                                    alt={tenFile}
                                    className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow"
                                />
                            </div>
                        )
                    )}
                </div>

                {duongDanHienThi && (
                    <div className="flex justify-end border-t border-slate-200 px-5 py-4">
                        <a
                            href={duongDanHienThi}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-500"
                        >
                            Mở tab mới
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModalXemTaiLieu;
