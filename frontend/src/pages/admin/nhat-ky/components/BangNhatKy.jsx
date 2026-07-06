import { useState } from "react";
import { NHAN_HANH_DONG, SO_DONG_MOI_TRANG } from "../constants";
import ModalChiTietNhatKy from "./ModalChiTietNhatKy";
import NhanVaiTro from "./NhanVaiTro";
import PhanTrangNhatKy from "./PhanTrangNhatKy";

function BangNhatKy({
  danhSach,
  dangTai,
  loi,
  trangHopLe,
  tongSoTrang,
  chuyenTrang,
  veTrangTruoc,
  veTrangSau,
}) {
  const [nhatKyDangXem, setNhatKyDangXem] = useState(null);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              Danh sách nhật ký
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Mỗi trang hiển thị {SO_DONG_MOI_TRANG} dòng.
            </p>
          </div>
          <div className="text-sm font-bold text-white/55">
            Trang {trangHopLe}/{tongSoTrang}
          </div>
        </div>

        {loi && (
          <div className="border-b border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-200">
            {loi}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-5 py-4">Thời gian</th>
                <th className="px-5 py-4">Người thực hiện</th>
                <th className="min-w-[150px] px-5 py-4">Vai trò</th>
                <th className="min-w-[250px] px-5 py-4">Hành động</th>
                <th className="px-5 py-4">Đối tượng</th>
                <th className="min-w-[520px] px-5 py-4">Nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dangTai ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm font-semibold text-white/50"
                  >
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : danhSach.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm font-semibold text-white/50"
                  >
                    Không có nhật ký phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                danhSach.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-white/70">
                      {item.created_at || "Chưa có thời gian"}
                    </td>
                    <td className="min-w-[190px] px-5 py-4">
                      <p className="font-extrabold text-white">
                        {item.nguoi_thuc_hien || "Hệ thống"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        {item.user_id ? `User #${item.user_id}` : "Không gắn user"}
                      </p>
                    </td>
                    <td className="min-w-[150px] px-5 py-4">
                      <NhanVaiTro vaiTro={item.vai_tro} />
                    </td>
                    <td className="min-w-[250px] px-5 py-4">
                      <span className="inline-flex whitespace-nowrap rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold text-blue-200">
                        {NHAN_HANH_DONG[item.hanh_dong] || item.hanh_dong}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-white/70">
                      {item.doi_tuong_id ? `#${item.doi_tuong_id}` : "—"}
                    </td>
                    <td className="min-w-[520px] px-5 py-4 leading-6 text-white/70">
                      <div className="grid grid-cols-[minmax(0,1fr)_130px] items-center gap-4">
                        <p className="truncate">
                          {item.noi_dung}
                        </p>
                        <button
                          type="button"
                          onClick={() => setNhatKyDangXem(item)}
                          className="w-[130px] rounded-lg border border-blue-300/25 bg-blue-500/10 px-3 py-1.5 text-xs font-extrabold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PhanTrangNhatKy
          dangTai={dangTai}
          trangHopLe={trangHopLe}
          tongSoTrang={tongSoTrang}
          chuyenTrang={chuyenTrang}
          veTrangTruoc={veTrangTruoc}
          veTrangSau={veTrangSau}
        />
      </section>

      <ModalChiTietNhatKy
        nhatKy={nhatKyDangXem}
        onClose={() => setNhatKyDangXem(null)}
      />
    </>
  );
}

export default BangNhatKy;
