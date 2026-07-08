import { useCallback, useEffect } from "react";
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
import ModalXemTaiLieu from "../../../../components/ModalXemTaiLieu";
import ModalXacNhan from "../../../../components/ModalXacNhan";

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
    const { taiThongTin } = thongTinCaNhan;
    const { taiChuyenMon } = chuyenMon;
    const { taiDanhSach: taiDanhSachBangCap } = bangCap;
    const { taiDanhSach: taiDanhSachMonDay } = monDay;

    useEffect(() => {
        const lamMoi = async () => {
            try {
                await Promise.all([
                    taiThongTin(),
                    taiChuyenMon(),
                    taiDanhSachBangCap(),
                    taiDanhSachMonDay(),
                ]);
                baoThanhCong("Đã làm mới dữ liệu hồ sơ gia sư.");
            } catch {
                baoLoi("Không thể làm mới đầy đủ dữ liệu hồ sơ.");
            }
        };

        window.addEventListener("giasu:refresh", lamMoi);

        return () => {
            window.removeEventListener("giasu:refresh", lamMoi);
        };
    }, [baoLoi, baoThanhCong, taiChuyenMon, taiDanhSachBangCap, taiDanhSachMonDay, taiThongTin]);

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

            {bangCap.taiLieuDangXem && (
                <ModalXemTaiLieu
                    taiLieu={bangCap.taiLieuDangXem}
                    onDong={bangCap.dongXem}
                />
            )}

            <ModalXacNhan
                mo={Boolean(bangCap.bangCapDangXoa)}
                tieuDe="Xóa tài liệu"
                moTa={`Bạn có chắc muốn xóa tài liệu "${bangCap.bangCapDangXoa?.ten_bang}"? Thao tác này không thể hoàn tác.`}
                nutXacNhan="Xóa"
                bienThe="danger"
                dangXuLy={Boolean(bangCap.idDangXoa)}
                onDong={bangCap.huyXoa}
                onXacNhan={bangCap.xacNhanXoa}
            />

            <ModalXacNhan
                mo={Boolean(monDay.monDangXoa)}
                tieuDe="Xóa môn dạy"
                moTa={`Bạn có chắc muốn xóa môn "${monDay.monDangXoa?.tenMon}" khỏi hồ sơ? Thao tác này không thể hoàn tác.`}
                nutXacNhan="Xóa"
                bienThe="danger"
                dangXuLy={Boolean(monDay.idDangXoa)}
                onDong={monDay.huyXoaMon}
                onXacNhan={monDay.xacNhanXoaMon}
            />
        </div>
    );
}

export default GiaSuHoSo;
