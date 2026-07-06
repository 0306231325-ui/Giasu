import { useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
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
    const toast = useToast();

    const baoLoi = useCallback((noiDung) => {
        toast.error(noiDung || "Có lỗi xảy ra. Vui lòng thử lại.");
    }, [toast]);

    const baoThanhCong = useCallback((noiDung) => {
        toast.success(noiDung || "Thao tác thành công.");
    }, [toast]);

    const thongTinCaNhan = useThongTinCaNhan({
        updateUser,
        baoLoi,
        baoThanhCong,
    });
    const avatar = useAvatarGiaSu({
        avatarBanDau:
            thongTinCaNhan.thongTin.avatar_url
            || thongTinCaNhan.thongTin.avatar
            || user?.anh_dai_dien,
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

            <ThongTinDauTrang
                tenGiaSu={tenGiaSu}
                thongTin={thongTinCaNhan.thongTin}
                avatar={avatar}
            />

            <div className="mt-5 space-y-5">
                <ThongTinCaNhan duLieu={thongTinCaNhan} />
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-950">
                                    Thông tin chuyên môn
                                </h2>
                                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                                    Quản lý bằng cấp/chứng chỉ và danh mục môn dạy.
                                    Các thay đổi chuyên môn sẽ được admin xét duyệt trước khi áp dụng.
                                </p>
                            </div>
                            <span className="inline-flex w-fit rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                                Cần admin duyệt
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 bg-slate-50/60 p-4">
                        <BangCapChungChi duLieu={bangCap} />
                        <DanhMucMonDay duLieu={monDay} />
                    </div>
                </section>
            </div>
        </div>
    );
}

export default GiaSuHoSo;
