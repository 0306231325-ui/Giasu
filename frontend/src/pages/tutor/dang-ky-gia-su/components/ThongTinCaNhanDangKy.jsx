import { LOP_INPUT, LOP_NHAN } from "../constants";
import { DauBatBuoc, TieuDePhan } from "./ThanhPhanChung";
import { useEffect, useState } from "react";
import ModalXemTaiLieu from "../../../../components/ModalXemTaiLieu";
import { layUrlAnhDaiDien } from "../../../../utils/urlTaiNguyen";

function ThongTinCaNhanDangKy({ user }) {
    const diaChi = user?.dia_chi || user?.hocvien?.dia_chi || user?.giasu?.dia_chi || "";
    const anhDaiDienHienCo = layUrlAnhDaiDien(user);
    const [anhXemTruoc, setAnhXemTruoc] = useState("");
    const [anhDangXem, setAnhDangXem] = useState(null);
    const anhHienThi = anhXemTruoc || anhDaiDienHienCo;

    useEffect(() => {
        return () => {
            if (anhXemTruoc) {
                URL.revokeObjectURL(anhXemTruoc);
            }
        };
    }, [anhXemTruoc]);

    const chonAnhChanDung = (event) => {
        const file = event.target.files?.[0];

        setAnhXemTruoc((hienTai) => {
            if (hienTai) URL.revokeObjectURL(hienTai);
            return file ? URL.createObjectURL(file) : "";
        });
    };

    return (
        <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
            <TieuDePhan soThuTu="1" tieuDe="Thông tin cá nhân" moTa="Thông tin dùng để liên hệ và xác minh hồ sơ của bạn." />
            <div className="grid gap-5 md:grid-cols-2">
                <Truong nhan="Họ và tên" name="ho_ten" placeholder="Nguyễn Văn An" defaultValue={user?.ho_ten || ""} />
                <Truong nhan="Ngày sinh" name="ngay_sinh" type="date" defaultValue={user?.ngay_sinh || ""} />
                <Truong nhan="Số điện thoại" name="so_dien_thoai" type="tel" placeholder="09xx xxx xxx" defaultValue={user?.sdt || ""} />
                <Truong nhan="Email" name="email" type="email" placeholder="email@example.com" defaultValue={user?.email || ""} />
                <Truong nhan="Địa chỉ hiện tại" name="dia_chi" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" defaultValue={diaChi} className="md:col-span-2" />
                <label className={`${LOP_NHAN} md:col-span-2`}>
                    Ảnh chân dung{!anhDaiDienHienCo && <DauBatBuoc />}
                    <input
                        className={`${LOP_INPUT} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700`}
                        type="file"
                        name="anh_chan_dung"
                        accept="image/*"
                        required={!anhDaiDienHienCo}
                        onChange={chonAnhChanDung}
                    />
                    <span className="mt-2 block text-xs font-normal leading-5 text-slate-500">
                        {anhDaiDienHienCo
                            ? "Bạn đã có ảnh đại diện. Có thể giữ nguyên hoặc chọn ảnh mới để thay thế."
                            : "Sử dụng ảnh rõ khuôn mặt, đủ sáng và không bị che khuất."}
                    </span>
                </label>
                {anhHienThi && (
                    <div className="md:col-span-2">
                        <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center">
                            <img
                                src={anhHienThi}
                                alt="Ảnh chân dung xem trước"
                                className="h-32 w-32 rounded-2xl object-cover ring-4 ring-white"
                            />
                            <div>
                                <p className="text-sm font-extrabold text-slate-900">
                                    {anhXemTruoc
                                        ? "Ảnh chân dung đã chọn"
                                        : "Ảnh chân dung hiện tại"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {anhXemTruoc
                                        ? "Ảnh này sẽ được gửi cùng hồ sơ để admin đối chiếu khi xét duyệt."
                                        : "Hệ thống sẽ dùng ảnh này nếu bạn không chọn ảnh mới."}
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAnhDangXem({
                                            urlTrucTiep: anhHienThi,
                                            tenFile: "anh-chan-dung.jpg",
                                            tieuDe: anhXemTruoc
                                                ? "Ảnh chân dung đã chọn"
                                                : "Ảnh chân dung hiện tại",
                                        })
                                    }
                                    className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50"
                                >
                                    Xem ảnh lớn
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ModalXemTaiLieu
                taiLieu={anhDangXem}
                onDong={() => setAnhDangXem(null)}
            />
        </div>
    );
}

function Truong({ nhan, name, type = "text", placeholder, defaultValue = "", className = "" }) {
    return (
        <label className={`${LOP_NHAN} ${className}`}>
            {nhan}<DauBatBuoc />
            <input
                key={`${name}-${defaultValue}`}
                className={LOP_INPUT}
                type={type}
                name={name}
                placeholder={placeholder}
                defaultValue={defaultValue}
            />
        </label>
    );
}

export default ThongTinCaNhanDangKy;
