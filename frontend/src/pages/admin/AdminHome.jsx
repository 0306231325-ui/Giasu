import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const dinhDangTien = (value) => {
  const soTien = Number(value || 0);
  return `${soTien.toLocaleString("vi-VN")} đ`;
};

const dinhDangNgayInput = (date) => {
  const nam = date.getFullYear();
  const thang = String(date.getMonth() + 1).padStart(2, "0");
  const ngay = String(date.getDate()).padStart(2, "0");

  return `${nam}-${thang}-${ngay}`;
};

function AdminHome() {
  const [duLieu, setDuLieu] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [cheDoBieuDo, setCheDoBieuDo] = useState("thang");
  const [boLoc, setBoLoc] = useState({
    tu_ngay: "",
    den_ngay: "",
  });

  const tongQuan = duLieu?.tongQuan || {};
  const bieuDo = duLieu?.bieuDo || {};
  const duLieuBieuDo = bieuDo[cheDoBieuDo] || [];
  const giaoDichGanDay = duLieu?.giaoDichGanDay || [];

  const taiDoanhThu = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const response = await api.get("/admin/doanh-thu", { params: boLoc });
      if (response.data.success) {
        setDuLieu(response.data.data);
      }
    } catch (error) {
      setLoi(error.response?.data?.message || "Không tải được dữ liệu doanh thu.");
    } finally {
      setDangTai(false);
    }
  }, [boLoc]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void taiDoanhThu();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [taiDoanhThu]);

  useEffect(() => {
    const lamMoi = () => {
      void taiDoanhThu();
    };

    window.addEventListener("admin:refresh", lamMoi);
    return () => window.removeEventListener("admin:refresh", lamMoi);
  }, [taiDoanhThu]);

  const capNhatBoLoc = (field, value) => {
    setBoLoc((hienTai) => ({ ...hienTai, [field]: value }));
  };

  const datKhoangNgay = (loai) => {
    const homNay = new Date();

    if (loai === "thang") {
      const dauThang = new Date(homNay.getFullYear(), homNay.getMonth(), 1);
      setBoLoc({
        tu_ngay: dinhDangNgayInput(dauThang),
        den_ngay: dinhDangNgayInput(homNay),
      });
      return;
    }

    if (loai === "nam") {
      const dauNam = new Date(homNay.getFullYear(), 0, 1);
      setBoLoc({
        tu_ngay: dinhDangNgayInput(dauNam),
        den_ngay: dinhDangNgayInput(homNay),
      });
      return;
    }

    setBoLoc({ tu_ngay: "", den_ngay: "" });
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-300">
            Trang chủ Admin
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Tổng quan tài chính</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
            Theo dõi doanh số học viên thanh toán, hoa hồng hệ thống và số tiền trả cho gia sư.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="grid gap-3 lg:grid-cols-[180px_180px_minmax(0,1fr)]">
          <input
            type="date"
            value={boLoc.tu_ngay}
            onChange={(event) => capNhatBoLoc("tu_ngay", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
          />
          <input
            type="date"
            value={boLoc.den_ngay}
            onChange={(event) => capNhatBoLoc("den_ngay", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => datKhoangNgay("thang")} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/75 transition hover:bg-white/5 hover:text-white">
              Tháng này
            </button>
            <button type="button" onClick={() => datKhoangNgay("nam")} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/75 transition hover:bg-white/5 hover:text-white">
              Năm nay
            </button>
            <button type="button" onClick={() => datKhoangNgay("tat_ca")} className="rounded-lg border border-blue-300/30 px-3 py-2 text-xs font-bold text-blue-100 transition hover:bg-blue-500/15">
              Tất cả
            </button>
          </div>
        </div>
      </section>

      {loi && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
          {loi}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <TheThongKe tieuDe="Hoa hồng hệ thống" giaTri={dinhDangTien(tongQuan.hoaHongHeThong)} moTa="Doanh thu thật theo bộ lọc" noiBat />
        <TheThongKe tieuDe="Doanh số" giaTri={dinhDangTien(tongQuan.doanhSo)} moTa="Tổng tiền học viên thanh toán" />
        <TheThongKe tieuDe="Gia sư nhận" giaTri={dinhDangTien(tongQuan.giaSuNhan)} moTa="Tổng tiền cần trả gia sư" />
        <TheThongKe tieuDe="Hoa hồng tháng này" giaTri={dinhDangTien(tongQuan.doanhThuThangNay)} moTa="Không phụ thuộc bộ lọc" />
        <TheThongKe tieuDe="Chờ duyệt" giaTri={tongQuan.soGiaoDichChoDuyet || 0} moTa="Cần admin kiểm tra" />
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0a0f24] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Biểu đồ hoa hồng</h2>
            <p className="mt-1 text-sm text-white/45">Đường lên xuống của doanh thu thật theo 30 ngày, 12 tháng hoặc 5 năm gần nhất.</p>
          </div>
          <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {[
              { key: "ngay", label: "30 ngày" },
              { key: "thang", label: "12 tháng" },
              { key: "nam", label: "5 năm" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCheDoBieuDo(item.key)}
                className={[
                  "rounded-lg px-3 py-2 text-xs font-bold transition",
                  cheDoBieuDo === item.key
                    ? "bg-blue-600 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {dangTai ? (
            <TrangThaiTrong noiDung="Đang tải biểu đồ..." />
          ) : duLieuBieuDo.length === 0 ? (
            <TrangThaiTrong noiDung="Chưa có dữ liệu doanh thu." />
          ) : (
            <BieuDoDuong items={duLieuBieuDo} />
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold">Giao dịch gần đây</h2>
            <p className="mt-1 text-sm text-white/45">Tối đa 8 giao dịch mới nhất theo bộ lọc.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.025] text-xs uppercase text-white/45">
              <tr>
                <th className="px-4 py-3">Gói học</th>
                <th className="px-4 py-3">Người học</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dangTai ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-white/50">Đang tải giao dịch...</td>
                </tr>
              ) : giaoDichGanDay.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-white/50">Chưa có giao dịch phù hợp.</td>
                </tr>
              ) : (
                giaoDichGanDay.slice(0, 8).map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-white">{item.maGoi}</div>
                      <div className="mt-1 text-xs text-white/45">{item.goiHoc?.monHoc || "Chưa cập nhật"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white/80">{item.hocVien?.hoTen || "Chưa cập nhật"}</div>
                      <div className="mt-1 text-xs text-white/45">GS: {item.giaSu?.hoTen || "Chưa cập nhật"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-blue-200">{item.phuongThucText}</div>
                      <div className="mt-1 text-xs text-white/45">{item.ngayThanhToan || "Chưa có ngày"}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-white">{dinhDangTien(item.soTien)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TheThongKe({ tieuDe, giaTri, moTa, noiBat }) {
  return (
    <section className={[
      "rounded-2xl border p-4",
      noiBat ? "border-blue-400/50 bg-blue-600 text-white" : "border-white/10 bg-white/[0.03] text-white",
    ].join(" ")}
    >
      <div className={noiBat ? "text-sm font-bold text-white/80" : "text-sm font-bold text-white/55"}>{tieuDe}</div>
      <div className="mt-3 text-2xl font-extrabold">{giaTri}</div>
      <div className={noiBat ? "mt-2 text-xs font-semibold text-white/75" : "mt-2 text-xs font-semibold text-white/40"}>{moTa}</div>
    </section>
  );
}

function BieuDoDuong({ items }) {
  const rong = 720;
  const cao = 260;
  const padding = { top: 24, right: 24, bottom: 44, left: 44 };
  const giaTriCaoNhat = Math.max(...items.map((item) => Number(item.tongTien || 0)), 1);
  const chieuRongVe = rong - padding.left - padding.right;
  const chieuCaoVe = cao - padding.top - padding.bottom;
  const buocX = items.length > 1 ? chiaChieuRongVe(chieuRongVe, items.length - 1) : 0;

  const diem = items.map((item, index) => {
    const x = padding.left + index * buocX;
    const y = padding.top + chieuCaoVe - (Number(item.tongTien || 0) / giaTriCaoNhat) * chieuCaoVe;

    return { ...item, x, y };
  });
  const duong = diem.map((item, index) => `${index === 0 ? "M" : "L"} ${item.x} ${item.y}`).join(" ");
  const vung = [
    duong,
    `L ${diem[diem.length - 1]?.x || padding.left} ${padding.top + chieuCaoVe}`,
    `L ${diem[0]?.x || padding.left} ${padding.top + chieuCaoVe}`,
    "Z",
  ].join(" ");
  const nhanCanHien = new Set(
    diem
      .filter((_, index) => index === 0 || index === diem.length - 1 || index % Math.ceil(diem.length / 6) === 0)
      .map((item) => item.moc),
  );

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <svg viewBox={`0 0 ${rong} ${cao}`} className="block h-[300px] w-full" role="img" aria-label="Biểu đồ doanh thu">
          {[0, 0.25, 0.5, 0.75, 1].map((tyLe) => {
            const y = padding.top + chieuCaoVe * tyLe;
            const giaTri = giaTriCaoNhat * (1 - tyLe);

            return (
              <g key={tyLe}>
                <line x1={padding.left} y1={y} x2={rong - padding.right} y2={y} stroke="rgba(255,255,255,0.08)" />
                <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-white/40 text-[10px] font-bold">
                  {rutGonTien(giaTri)}
                </text>
              </g>
            );
          })}

          <path d={vung} fill="rgba(37, 99, 235, 0.18)" />
          <path d={duong} fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {diem.map((item) => (
            <g key={item.moc}>
              <circle cx={item.x} cy={item.y} r="4.5" fill="#93c5fd" stroke="#0a0f24" strokeWidth="3">
                <title>{`${item.nhan}: ${dinhDangTien(item.tongTien)} - ${item.soGiaoDich} giao dịch`}</title>
              </circle>
              {nhanCanHien.has(item.moc) && (
                <text x={item.x} y={cao - 16} textAnchor="middle" className="fill-white/45 text-[11px] font-bold">
                  {item.nhan}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {items.slice(-3).map((item) => (
          <div key={item.moc} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <div className="text-xs font-bold text-white/45">{item.nhan}</div>
            <div className="mt-1 text-sm font-extrabold text-white">{dinhDangTien(item.tongTien)}</div>
            <div className="mt-1 text-xs font-semibold text-blue-200">{item.soGiaoDich} giao dịch</div>
            <div className="mt-1 text-xs text-white/45">Doanh số {dinhDangTien(item.doanhSo)}</div>
            <div className="mt-0.5 text-xs text-white/45">Gia sư nhận {dinhDangTien(item.giaSuNhan)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function chiaChieuRongVe(chieuRongVe, soKhoang) {
  return soKhoang > 0 ? chieuRongVe / soKhoang : 0;
}

function rutGonTien(value) {
  const soTien = Number(value || 0);

  if (soTien >= 1_000_000_000) return `${Math.round(soTien / 1_000_000_000)} tỷ`;
  if (soTien >= 1_000_000) return `${Math.round(soTien / 1_000_000)} tr`;
  if (soTien >= 1_000) return `${Math.round(soTien / 1_000)}k`;
  return `${Math.round(soTien)}`;
}

function TrangThaiTrong({ noiDung }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/50">
      {noiDung}
    </div>
  );
}

export default AdminHome;

