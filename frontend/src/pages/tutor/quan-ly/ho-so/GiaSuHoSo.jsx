import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import BangCapChungChi from "./components/BangCapChungChi";
import DanhMucMonDay from "./components/DanhMucMonDay";
import ThongTinCaNhan from "./components/ThongTinCaNhan";
import ThongTinDauTrang from "./components/ThongTinDauTrang";
import useBangCap from "./hooks/useBangCap";
import useAvatarGiaSu from "./hooks/useAvatarGiaSu";
import useChuyenMon from "./hooks/useChuyenMon";
import useMonDay from "./hooks/useMonDay";
import useThongTinCaNhan from "./hooks/useThongTinCaNhan";

function GiaSuHoSo() {
    const { user, updateUser } = useAuth();
    const [thongBao, setThongBao] = useState(null);
    const boDemAnThongBao = useRef(null);

    const baoLoi = useCallback((noiDung) => {
        if (boDemAnThongBao.current) {
            clearTimeout(boDemAnThongBao.current);
            boDemAnThongBao.current = null;
        }
        setThongBao({ loai: "loi", noiDung });
    }, []);
    const baoThanhCong = useCallback((noiDung) => {
        if (boDemAnThongBao.current) {
            clearTimeout(boDemAnThongBao.current);
        }

        setThongBao({ loai: "thanh_cong", noiDung });
        boDemAnThongBao.current = setTimeout(() => {
            setThongBao(null);
            boDemAnThongBao.current = null;
        }, 3000);
    }, []);

    useEffect(
        () => () => {
            if (boDemAnThongBao.current) {
                clearTimeout(boDemAnThongBao.current);
            }
        },
        [],
    );

    const thongTinCaNhan = useThongTinCaNhan({
        updateUser,
        baoLoi,
        baoThanhCong,
    });
    const avatar = useAvatarGiaSu({
        avatarBanDau: thongTinCaNhan.thongTin.avatar_url,
        updateUser,
        baoLoi,
        baoThanhCong,
    });
    const chuyenMon = useChuyenMon({ baoLoi, baoThanhCong });
    const bangCap = useBangCap({
        baoLoi,
        baoThanhCong,
        danhMucTrinhDo: chuyenMon.danhMuc.trinh_do,
    });
    const monDay = useMonDay({
        baoLoi,
        baoThanhCong,
    });

    const tenGiaSu =
        thongTinCaNhan.thongTin.ho_ten || user?.ho_ten || "Gia sư";

    return (
        <div className="mx-auto max-w-6xl pb-10">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Hồ sơ gia sư
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                    Quản lý thông tin cá nhân, chuyên môn, môn đăng ký dạy và hồ
                    sơ xác minh của bạn.
                </p>
            </div>

            {thongBao && (
                <div
                    role="status"
                    className={[
                        "mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold",
                        thongBao.loai === "thanh_cong"
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                            : "border-red-400/30 bg-red-400/10 text-red-200",
                    ].join(" ")}
                >
                    {thongBao.noiDung}
                </div>
            )}

            <ThongTinDauTrang
                tenGiaSu={tenGiaSu}
                thongTin={thongTinCaNhan.thongTin}
                avatar={avatar}
            />

            <div className="mt-5 space-y-5">
                <ThongTinCaNhan duLieu={thongTinCaNhan} />
                <section className="overflow-hidden rounded-3xl border border-blue-400/20 bg-white/95 text-slate-900 shadow-2xl shadow-black/10">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">
                                    Khu vực xét duyệt
                                </p>
                                <h2 className="mt-2 text-xl font-extrabold text-slate-950">
                                    Thông tin chuyên môn cần xét duyệt
                                </h2>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                    Bao gồm bằng cấp/chứng chỉ và danh mục môn
                                    dạy. Các thay đổi chuyên môn sẽ được quản
                                    trị viên kiểm tra trước khi dùng để hiển thị
                                    hoặc tính giá chính thức.
                                </p>
                            </div>
                            <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                                Cần admin duyệt sau khi chỉnh
                            </span>
                        </div>
                    </div>

                    <div className="space-y-5 bg-slate-50/70 p-4 sm:p-5">
                        <BangCapChungChi duLieu={bangCap} />
                        <DanhMucMonDay duLieu={monDay} />
                    </div>
                </section>
            </div>
        </div>
    );
}

export default GiaSuHoSo;
