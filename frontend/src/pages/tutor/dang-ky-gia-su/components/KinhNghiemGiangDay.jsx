import { LOP_INPUT, LOP_NHAN } from "../constants";
import { dinhDangMucKinhNghiem } from "../utils/dinhDangDangKy";
import { DauBatBuoc, TieuDePhan } from "./ThanhPhanChung";

function KinhNghiemGiangDay({ danhMuc, dangTaiDanhMuc, luaChon }) {
    return (
        <div className="border-b border-slate-100 p-6 sm:p-8 lg:p-10">
            <TieuDePhan soThuTu="4" tieuDe="Kinh nghiệm giảng dạy" moTa="Mô tả kinh nghiệm và phương pháp giúp bạn tạo ra kết quả học tập tốt." />
            <div className="grid gap-5">
                <label className={LOP_NHAN}>Mức kinh nghiệm<DauBatBuoc /><select className={LOP_INPUT} name="muc_kinh_nghiem_id" value={luaChon.mucKinhNghiemIdDaChon} onChange={(e) => luaChon.setMucKinhNghiemIdDaChon(e.target.value)} disabled={dangTaiDanhMuc}><option value="" disabled>{dangTaiDanhMuc ? "Đang tải mức kinh nghiệm..." : "Chọn mức kinh nghiệm"}</option>{danhMuc.muc_kinh_nghiem.map((muc) => <option key={muc.id} value={muc.id}>{dinhDangMucKinhNghiem(muc)}</option>)}</select></label>
                <label className={LOP_NHAN}>Giới thiệu bản thân và phương pháp dạy<DauBatBuoc /><textarea className={`${LOP_INPUT} min-h-36 resize-y`} name="gioi_thieu" placeholder="Giới thiệu ngắn gọn về bản thân, phong cách và phương pháp giảng dạy của bạn..." /></label>
            </div>
        </div>
    );
}

export default KinhNghiemGiangDay;
