import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import BangCapChungChi from "./ho-so/components/BangCapChungChi";
import DanhMucMonDay from "./ho-so/components/DanhMucMonDay";
import ThongTinCaNhan from "./ho-so/components/ThongTinCaNhan";
import ThongTinDauTrang from "./ho-so/components/ThongTinDauTrang";
import TrinhDoKinhNghiem from "./ho-so/components/TrinhDoKinhNghiem";
import useBangCap from "./ho-so/hooks/useBangCap";
import useAvatarGiaSu from "./ho-so/hooks/useAvatarGiaSu";
import useChuyenMon from "./ho-so/hooks/useChuyenMon";
import useMonDay from "./ho-so/hooks/useMonDay";
import useThongTinCaNhan from "./ho-so/hooks/useThongTinCaNhan";

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
    const monDay = useMonDay({ baoLoi, baoThanhCong });
    const bangCap = useBangCap({
        baoLoi,
        baoThanhCong,
        danhMucTrinhDo: chuyenMon.danhMuc.trinh_do,
    });

    const tenGiaSu =
        thongTinCaNhan.thongTin.ho_ten || user?.ho_ten || "Gia sư";

    return (
        <div className="mx-auto max-w-6xl pb-10">
            <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Hồ sơ giảng dạy
                </div>
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
                <TrinhDoKinhNghiem duLieu={chuyenMon} />
                <BangCapChungChi duLieu={bangCap} />
                <DanhMucMonDay duLieu={monDay} />
            </div>
        </div>
    );
}

export default GiaSuHoSo;
