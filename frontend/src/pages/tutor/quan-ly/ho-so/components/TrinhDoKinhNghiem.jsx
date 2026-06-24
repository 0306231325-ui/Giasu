import { LOP_NHAP_LIEU } from "../constants";
import { dinhDangMucKinhNghiem } from "../utils/dinhDangHoSo";
import KhoiNoiDung from "./KhoiNoiDung";

function TrinhDoKinhNghiem({ duLieu }) {
    return (
        <KhoiNoiDung
            bieuTuong="book"
            tieuDe="Kinh nghiệm giảng dạy"
            moTa="Mức kinh nghiệm dùng để hỗ trợ tính giá giảng dạy."
            hanhDong={duLieu.dangSua ? "Hủy" : "Chỉnh sửa"}
            onHanhDong={duLieu.dangSua ? duLieu.huySua : duLieu.batDauSua}
            voHieuHoaHanhDong={duLieu.dangTai || duLieu.dangLuu}
        >
            {duLieu.dangTai ? (
                <p className="text-sm font-semibold text-slate-500">Đang tải thông tin chuyên môn...</p>
            ) : (
                <form onSubmit={duLieu.luu} className="grid gap-5">
                    <Truong
                        nhan="Mức kinh nghiệm"
                        name="muc_kinh_nghiem_id"
                        value={duLieu.banNhap.muc_kinh_nghiem_id || ""}
                        hienThi={dinhDangMucKinhNghiem(duLieu.chuyenMon.muc_kinh_nghiem)}
                        dangSua={duLieu.dangSua}
                        onChange={duLieu.thayDoi}
                        loi={duLieu.loi.muc_kinh_nghiem_id}
                        luaChon={duLieu.danhMuc.muc_kinh_nghiem.map((muc) => ({ value: muc.id, label: dinhDangMucKinhNghiem(muc) }))}
                    />
                    {duLieu.dangSua && (
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={duLieu.huySua} disabled={duLieu.dangLuu} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
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

function Truong({ nhan, name, value, hienThi, dangSua, onChange, loi, luaChon }) {
    if (!dangSua) {
        return <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{nhan}</p><p className="mt-2 text-sm font-semibold text-slate-800">{hienThi}</p></div>;
    }
    const loiDauTien = Array.isArray(loi) ? loi[0] : loi;
    return (
        <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{nhan} <span className="text-red-500">*</span></span>
            <select name={name} value={value} onChange={onChange} required className={`${LOP_NHAP_LIEU} ${loi ? "border-red-400" : ""}`}>
                <option value="" disabled>Chọn {nhan.toLowerCase()}</option>
                {luaChon.map((muc) => <option key={muc.value} value={muc.value}>{muc.label}</option>)}
            </select>
            {loiDauTien && <span className="mt-1.5 block text-xs font-semibold text-red-600">{loiDauTien}</span>}
        </label>
    );
}

export default TrinhDoKinhNghiem;
