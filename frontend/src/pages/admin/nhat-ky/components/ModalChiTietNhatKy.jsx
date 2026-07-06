import { NHAN_HANH_DONG } from "../constants";
import NhanVaiTro from "./NhanVaiTro";

function ModalChiTietNhatKy({ nhatKy, onClose }) {
  if (!nhatKy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111a35] text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blue-300">
              Chi tiết nhật ký
            </p>
            <h3 className="mt-2 text-xl font-extrabold">
              {NHAN_HANH_DONG[nhatKy.hanh_dong] || nhatKy.hanh_dong}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-extrabold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <ThongTin label="Thời gian" value={nhatKy.created_at || "Chưa có thời gian"} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                Vai trò
              </p>
              <div className="mt-2">
                <NhanVaiTro vaiTro={nhatKy.vai_tro} />
              </div>
            </div>
            <ThongTin label="Người thực hiện" value={nhatKy.nguoi_thuc_hien || "Hệ thống"} />
            <ThongTin
              label="Đối tượng"
              value={nhatKy.doi_tuong_id ? `#${nhatKy.doi_tuong_id}` : "—"}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-white/40">
              Nội dung
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-7 text-white/80">
              {nhatKy.noi_dung || "Không có nội dung."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThongTin({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-extrabold text-white/80">
        {value}
      </p>
    </div>
  );
}

export default ModalChiTietNhatKy;
