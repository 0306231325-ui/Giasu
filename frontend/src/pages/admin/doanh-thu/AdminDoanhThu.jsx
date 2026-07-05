import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

const TRANG_THAI_MAU = {
  cho_thanhtoan: "border-amber-300/30 bg-amber-500/10 text-amber-100",
  da_thanhtoan: "border-emerald-300/30 bg-emerald-500/10 text-emerald-100",
  that_bai: "border-red-300/30 bg-red-500/10 text-red-100",
};

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

function AdminDoanhThu() {
  const [duLieu, setDuLieu] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");
  const [boLoc, setBoLoc] = useState({
    tu_ngay: "",
    den_ngay: "",
  });

  const tongQuan = duLieu?.tongQuan || {};
  const theoThang = duLieu?.theoThang || [];
  const theoPhuongThuc = duLieu?.theoPhuongThuc || [];
  const giaoDichGanDay = duLieu?.giaoDichGanDay || [];
  const doanhThuCaoNhatTheoThang = useMemo(
    () => Math.max(...theoThang.map((item) => Number(item.tongTien || 0)), 1),
    [theoThang],
  );
  const doanhThuCaoNhatTheoPhuongThuc = useMemo(
    () => Math.max(...theoPhuongThuc.map((item) => Number(item.tongTien || 0)), 1),
    [theoPhuongThuc],
  );

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

  const datKhoangNgay = (kieu) => {
    const homNay = new Date();
    const dau = new Date(homNay);

    if (kieu === "thang") {
      dau.setDate(1);
    }

    if (kieu === "nam") {
      dau.setMonth(0, 1);
    }

    if (kieu === "tat_ca") {
      setBoLoc({ tu_ngay: "", den_ngay: "" });
      return;
    }

    setBoLoc({
      tu_ngay: dinhDangNgayInput(dau),
      den_ngay: dinhDangNgayInput(homNay),
    });
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-blue-300">
            Tài chính hệ thống
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Tổng doanh thu</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
            Theo dõi doanh thu từ các giao dịch đã thanh toán, tình trạng chờ duyệt và lịch sử thanh toán gần đây.
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
        <TheThongKe tieuDe="Doanh thu theo lọc" giaTri={dinhDangTien(tongQuan.tongDoanhThu)} moTa="Chỉ tính giao dịch đã thanh toán" noiBat />
        <TheThongKe tieuDe="Tháng này" giaTri={dinhDangTien(tongQuan.doanhThuThangNay)} moTa="Không phụ thuộc bộ lọc" />
        <TheThongKe tieuDe="Thành công" giaTri={tongQuan.soGiaoDichThanhCong || 0} moTa="Giao dịch đã duyệt" />
        <TheThongKe tieuDe="Chờ duyệt" giaTri={tongQuan.soGiaoDichChoDuyet || 0} moTa="Cần kiểm tra minh chứng" />
        <TheThongKe tieuDe="Trung bình" giaTri={dinhDangTien(tongQuan.giaTriTrungBinh)} moTa="Giá trị mỗi giao dịch" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <section className="rounded-2xl border border-white/10 bg-[#0a0f24] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">Doanh thu theo tháng</h2>
              <p className="mt-1 text-sm text-white/45">Tổng tiền đã thanh toán trong khoảng thời gian đang lọc.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {dangTai ? (
              <TrangThaiTrong noiDung="Đang tải biểu đồ..." />
            ) : theoThang.length === 0 ? (
              <TrangThaiTrong noiDung="Chưa có doanh thu trong khoảng thời gian này." />
            ) : (
              theoThang.map((item) => (
                <DongBieuDo
                  key={item.thang}
                  label={item.nhan}
                  value={dinhDangTien(item.tongTien)}
                  sub={`${item.soGiaoDich} giao dịch`}
                  percent={(Number(item.tongTien || 0) / doanhThuCaoNhatTheoThang) * 100}
                />
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0a0f24] p-5">
          <h2 className="text-lg font-extrabold">Phương thức thanh toán</h2>
          <p className="mt-1 text-sm text-white/45">Cơ cấu doanh thu theo kênh thanh toán.</p>

          <div className="mt-5 space-y-4">
            {dangTai ? (
              <TrangThaiTrong noiDung="Đang tải dữ liệu..." />
            ) : theoPhuongThuc.length === 0 ? (
              <TrangThaiTrong noiDung="Chưa có giao dịch thành công." />
            ) : (
              theoPhuongThuc.map((item) => (
                <DongBieuDo
                  key={item.phuongThuc}
                  label={item.nhan}
                  value={dinhDangTien(item.tongTien)}
                  sub={`${item.soGiaoDich} giao dịch`}
                  percent={(Number(item.tongTien || 0) / doanhThuCaoNhatTheoPhuongThuc) * 100}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f24]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold">Giao dịch gần đây</h2>
            <p className="mt-1 text-sm text-white/45">Hiển thị tối đa 20 giao dịch mới nhất theo bộ lọc.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-3">Giao dịch</th>
                <th className="px-4 py-3">Người học / gia sư</th>
                <th className="px-4 py-3">Gói học</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dangTai ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-white/50">Đang tải giao dịch...</td>
                </tr>
              ) : giaoDichGanDay.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-white/50">Chưa có giao dịch phù hợp.</td>
                </tr>
              ) : (
                giaoDichGanDay.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-white">{item.maGoi}</div>
                      <div className="mt-1 text-xs text-white/45">{item.ngayThanhToan || "Chưa có ngày"}</div>
                      <div className="mt-1 text-xs font-semibold text-blue-200">{item.phuongThucText}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white/80">HV: {item.hocVien?.hoTen || "Chưa cập nhật"}</div>
                      <div className="mt-1 text-xs text-white/50">GS: {item.giaSu?.hoTen || "Chưa cập nhật"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white/75">{item.goiHoc?.monHoc || "Chưa cập nhật"}</div>
                      <div className="mt-1 text-xs text-white/45">{item.goiHoc?.loaiGoi || "Gói học"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={[
                        "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                        TRANG_THAI_MAU[item.trangThai] || "border-white/15 bg-white/5 text-white/70",
                      ].join(" ")}
                      >
                        {item.trangThaiText}
                      </span>
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

function DongBieuDo({ label, value, sub, percent }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-bold text-white">{label}</div>
          <div className="mt-1 text-xs text-white/45">{sub}</div>
        </div>
        <div className="text-sm font-extrabold text-white">{value}</div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(percent, 4)}%` }} />
      </div>
    </div>
  );
}

function TrangThaiTrong({ noiDung }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/50">
      {noiDung}
    </div>
  );
}

export default AdminDoanhThu;
