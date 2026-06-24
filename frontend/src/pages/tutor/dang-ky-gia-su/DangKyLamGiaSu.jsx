import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import CapHocMonDay from "./components/CapHocMonDay";
import FormThemHoSo from "./components/FormThemHoSo";
import GiaDuKien from "./components/GiaDuKien";
import KinhNghiemGiangDay from "./components/KinhNghiemGiangDay";
import ThongTinCaNhanDangKy from "./components/ThongTinCaNhanDangKy";
import TrinhDoHoSo from "./components/TrinhDoHoSo";
import XacNhanDangKy from "./components/XacNhanDangKy";
import useDanhMucDangKyGiaSu from "./hooks/useDanhMucDangKyGiaSu";
import useHoSoChuyenMon from "./hooks/useHoSoChuyenMon";
import useLuaChonGiangDay from "./hooks/useLuaChonGiangDay";

function DangKyLamGiaSu() {
    const dieuHuong = useNavigate();
    const viTri = useLocation();
    const { isAuthenticated, loading: dangTaiXacThuc } = useAuth();
    const { danhMuc, dangTai: dangTaiDanhMuc, loi: loiDanhMuc } =
        useDanhMucDangKyGiaSu();
    const luaChon = useLuaChonGiangDay(danhMuc);
    const { setTrinhDoIdDaChon } = luaChon;
    const hoSo = useHoSoChuyenMon();
    const formRef = useRef(null);
    const [dangGuiDon, setDangGuiDon] = useState(false);
    const [thongBao, setThongBao] = useState(null);

    const trinhDoCaoNhatId = useMemo(() => {
        const thuTuTheoId = new Map(
            danhMuc.trinh_do.map((muc) => [
                String(muc.id),
                Number(muc.thu_tu ?? 0),
            ]),
        );

        return hoSo.danhSach
            .filter((muc) => muc.trinh_do_giasu_id)
            .sort(
                (a, b) =>
                    (thuTuTheoId.get(String(b.trinh_do_giasu_id)) ?? 0) -
                    (thuTuTheoId.get(String(a.trinh_do_giasu_id)) ?? 0),
            )[0]?.trinh_do_giasu_id || "";
    }, [danhMuc.trinh_do, hoSo.danhSach]);

    useEffect(() => {
        setTrinhDoIdDaChon(trinhDoCaoNhatId);
    }, [setTrinhDoIdDaChon, trinhDoCaoNhatId]);

    const guiDonDangKy = async (event) => {
        event.preventDefault();

        if (dangGuiDon || !formRef.current) return;

        setThongBao(null);

        if (hoSo.danhSach.length === 0) {
            setThongBao({
                loai: "loi",
                noiDung: "Vui lòng thêm ít nhất một bằng cấp hoặc chứng chỉ.",
            });
            return;
        }

        if (luaChon.monHocIdsDaChon.length === 0) {
            setThongBao({
                loai: "loi",
                noiDung: "Vui lòng chọn ít nhất một môn học đăng ký dạy.",
            });
            return;
        }

        if (!trinhDoCaoNhatId) {
            setThongBao({
                loai: "loi",
                noiDung: "Vui lòng chọn trình độ xác minh cho hồ sơ chuyên môn.",
            });
            return;
        }

        const duLieuGui = new FormData(formRef.current);
        duLieuGui.delete("mon_hoc_ids[]");
        duLieuGui.delete("cap_hoc_ids[]");
        duLieuGui.delete("bang_cap");

        luaChon.monHocIdsDaChon.forEach((id) => {
            duLieuGui.append("mon_hoc_ids[]", id);
        });

        hoSo.danhSach.forEach((taiLieu, index) => {
            duLieuGui.append(`bang_cap[${index}][ten_bang]`, taiLieu.ten_bang);
            duLieuGui.append(`bang_cap[${index}][loai_bang]`, taiLieu.loai_bang);
            duLieuGui.append(`bang_cap[${index}][trinh_do_giasu_id]`, taiLieu.trinh_do_giasu_id);
            duLieuGui.append(`bang_cap[${index}][chuyen_nganh]`, taiLieu.chuyen_nganh || "");
            duLieuGui.append(`bang_cap[${index}][truong_don_vi]`, taiLieu.truong_don_vi);
            duLieuGui.append(`bang_cap[${index}][tai_lieu]`, taiLieu.tai_lieu);
        });

        setDangGuiDon(true);
        try {
            const response = await api.post("/dang-ky-gia-su", duLieuGui, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data?.success) {
                setThongBao({
                    loai: "thanh_cong",
                    noiDung: response.data.message,
                });
                formRef.current.reset();
                hoSo.reset();
                luaChon.reset();
            }
        } catch (error) {
            const loiValidate = error.response?.data?.errors;
            const noiDung =
                loiValidate
                    ? Object.values(loiValidate).flat()[0]
                    : error.response?.data?.message;

            setThongBao({
                loai: "loi",
                noiDung: noiDung || "Không thể gửi đơn đăng ký. Vui lòng kiểm tra lại thông tin.",
            });
        } finally {
            setDangGuiDon(false);
        }
    };

    useEffect(() => {
        if (!dangTaiXacThuc && !isAuthenticated) {
            dieuHuong(`/login?redirect=${encodeURIComponent(viTri.pathname)}`, {
                replace: true,
            });
        }
    }, [dangTaiXacThuc, dieuHuong, isAuthenticated, viTri.pathname]);

    if (dangTaiXacThuc || !isAuthenticated) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 text-slate-900">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-lg">
                    <p className="text-sm font-semibold text-slate-700">
                        Đang kiểm tra đăng nhập...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:py-16">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-950 to-slate-50" />
            <div className="relative mx-auto max-w-6xl">
                <div className="mx-auto mb-10 max-w-3xl text-center text-white">
                    <span className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-1.5 text-sm font-semibold text-blue-200">
                        Gia nhập đội ngũ gia sư
                    </span>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        Gửi đơn đăng ký gia sư
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                        Hoàn thiện thông tin bên dưới để chúng tôi hiểu rõ hơn về
                        chuyên môn và kinh nghiệm giảng dạy của bạn.
                    </p>
                </div>

                <form
                    ref={formRef}
                    onSubmit={guiDonDangKy}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-950/10"
                >
                    {loiDanhMuc && (
                        <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 sm:px-8 lg:px-10">
                            {loiDanhMuc}
                        </div>
                    )}
                    {thongBao && (
                        <div
                            className={[
                                "border-b px-6 py-4 text-sm font-semibold sm:px-8 lg:px-10",
                                thongBao.loai === "thanh_cong"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-red-200 bg-red-50 text-red-700",
                            ].join(" ")}
                        >
                            {thongBao.noiDung}
                        </div>
                    )}
                    <ThongTinCaNhanDangKy />
                    <TrinhDoHoSo
                        danhMuc={danhMuc}
                        hoSo={hoSo}
                    />
                    <CapHocMonDay
                        danhMuc={danhMuc}
                        dangTaiDanhMuc={dangTaiDanhMuc}
                        luaChon={luaChon}
                    />
                    <KinhNghiemGiangDay
                        danhMuc={danhMuc}
                        dangTaiDanhMuc={dangTaiDanhMuc}
                        luaChon={luaChon}
                    />
                    <GiaDuKien gia={luaChon.gia} />
                    <XacNhanDangKy dangGui={dangGuiDon} />
                </form>
            </div>
            <FormThemHoSo
                hoSo={hoSo}
                danhMuc={danhMuc}
                dangTaiDanhMuc={dangTaiDanhMuc}
            />
        </section>
    );
}

export default DangKyLamGiaSu;
