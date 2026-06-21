import { LOP_NHAP_LIEU } from "../constants";
import { dinhDangNgay } from "../utils/dinhDangHoSo";
import KhoiNoiDung from "./KhoiNoiDung";

function ThongTinCaNhan({ duLieu }) {
    return (
        <KhoiNoiDung
            bieuTuong="user"
            tieuDe="Thông tin cá nhân"
            moTa="Thông tin liên hệ và giới thiệu hiển thị trên hồ sơ."
            hanhDong={duLieu.dangChinhSua ? "Hủy" : "Chỉnh sửa"}
            onHanhDong={duLieu.dangChinhSua ? duLieu.huySua : duLieu.batDauSua}
            voHieuHoaHanhDong={duLieu.dangTai || duLieu.dangLuu}
        >
            {duLieu.dangTai ? (
                <p className="text-sm font-semibold text-slate-500">Đang tải thông tin cá nhân...</p>
            ) : (
                <form onSubmit={duLieu.luu} className="grid gap-5 md:grid-cols-2">
                    <TruongCaNhan nhan="Họ và tên" name="ho_ten" value={duLieu.banNhap.ho_ten} {...thuocTinhForm(duLieu)} batBuoc />
                    <TruongCaNhan nhan="Ngày sinh" name="ngay_sinh" type="date" value={duLieu.banNhap.ngay_sinh} giaTriHienThi={dinhDangNgay(duLieu.banNhap.ngay_sinh)} {...thuocTinhForm(duLieu)} batBuoc />
                    <TruongCaNhan nhan="Số điện thoại" name="sdt" type="tel" value={duLieu.banNhap.sdt} {...thuocTinhForm(duLieu)} batBuoc />
                    <TruongCaNhan nhan="Email" name="email" type="email" value={duLieu.banNhap.email} {...thuocTinhForm(duLieu)} batBuoc />
                    <TruongCaNhan nhan="Địa chỉ hiện tại" name="dia_chi" value={duLieu.banNhap.dia_chi} {...thuocTinhForm(duLieu)} batBuoc className="md:col-span-2" />
                    <TruongCaNhan nhan="Giới thiệu bản thân" name="mo_ta" value={duLieu.banNhap.mo_ta} {...thuocTinhForm(duLieu)} nhieuDong className="md:col-span-2" />
                    {duLieu.dangChinhSua && (
                        <div className="flex justify-end gap-3 md:col-span-2">
                            <button type="button" onClick={duLieu.huySua} disabled={duLieu.dangLuu} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                                Hủy
                            </button>
                            <button type="submit" disabled={duLieu.dangLuu} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
                                {duLieu.dangLuu ? "Đang lưu..." : "Lưu thông tin"}
                            </button>
                        </div>
                    )}
                </form>
            )}
        </KhoiNoiDung>
    );
}

function thuocTinhForm(duLieu) {
    return {
        dangChinhSua: duLieu.dangChinhSua,
        onChange: duLieu.thayDoi,
        loi: duLieu.loi,
    };
}

function TruongCaNhan({ nhan, name, value, giaTriHienThi, type = "text", dangChinhSua, onChange, loi, batBuoc = false, nhieuDong = false, className = "" }) {
    const loiTruong = loi[name];
    if (!dangChinhSua) {
        return (
            <div className={className}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{nhan}</p>
                <p className={`mt-2 text-sm font-semibold text-slate-800 ${nhieuDong ? "leading-7" : ""}`}>
                    {giaTriHienThi || value || "Chưa cập nhật"}
                </p>
            </div>
        );
    }
    const thuocTinh = {
        id: `thong-tin-${name}`,
        name,
        value: value || "",
        onChange,
        required: batBuoc,
        className: `${LOP_NHAP_LIEU} ${loiTruong ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`,
    };
    return (
        <label htmlFor={`thong-tin-${name}`} className={`block ${className}`}>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {nhan}{batBuoc && <span className="text-red-500"> *</span>}
            </span>
            {nhieuDong ? <textarea {...thuocTinh} rows={5} maxLength={2000} /> : <input {...thuocTinh} type={type} />}
            {loiTruong && <span className="mt-1.5 block text-xs font-semibold text-red-600">{Array.isArray(loiTruong) ? loiTruong[0] : loiTruong}</span>}
        </label>
    );
}

export default ThongTinCaNhan;
