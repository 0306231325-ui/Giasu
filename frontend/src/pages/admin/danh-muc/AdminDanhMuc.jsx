import { useCallback, useEffect, useState } from "react";
import api from "../../../services/api";
import AdminMonHoc from "../mon-hoc/AdminMonHoc";

const tabs = [
  { key: "cap-hoc", label: "Cấp học" },
  { key: "mon-hoc", label: "Môn học" },
  { key: "loai-goi", label: "Loại gói học" },
  { key: "trinh-do-gia-su", label: "Trình độ gia sư" },
  { key: "muc-kinh-nghiem", label: "Mức kinh nghiệm" },
];

const cauHinh = {
  "cap-hoc": {
    dataKey: "cap_hoc",
    apiKey: "cap-hoc",
    title: "Cấp học",
    empty: { ma: "", ten: "", thu_tu: "" },
    fields: [
      { name: "ma", label: "Mã", required: true },
      { name: "ten", label: "Tên cấp học", required: true },
      { name: "thu_tu", label: "Thứ tự", type: "number" },
    ],
    columns: [
      { key: "ma", label: "Mã" },
      { key: "ten", label: "Tên" },
      { key: "thu_tu", label: "Thứ tự" },
      { key: "so_mon_hoc", label: "Môn học" },
      { key: "so_gia_su", label: "Gia sư" },
    ],
  },
  "loai-goi": {
    dataKey: "loai_goi",
    apiKey: "loai-goi",
    title: "Loại gói học",
    empty: { ten_loai_goi: "", so_thang: "", phan_tram_giam: "", mo_ta: "" },
    fields: [
      { name: "ten_loai_goi", label: "Tên gói", required: true },
      { name: "so_thang", label: "Số tháng", type: "number", required: true },
      { name: "phan_tram_giam", label: "% giảm", type: "number" },
      { name: "mo_ta", label: "Mô tả", textarea: true },
    ],
    columns: [
      { key: "ten_loai_goi", label: "Tên gói" },
      { key: "so_thang", label: "Số tháng" },
      { key: "phan_tram_giam", label: "% giảm", render: (item) => `${item.phan_tram_giam || 0}%` },
      { key: "so_goi_hoc", label: "Gói đã đặt" },
    ],
  },
  "trinh-do-gia-su": {
    dataKey: "trinh_do_giasu",
    apiKey: "trinh-do-gia-su",
    title: "Trình độ gia sư",
    empty: { ma: "", ten: "", gia_cong_them: "", thu_tu: "" },
    fields: [
      { name: "ma", label: "Mã", required: true },
      { name: "ten", label: "Tên trình độ", required: true },
      { name: "gia_cong_them", label: "Giá cộng thêm", type: "number" },
      { name: "thu_tu", label: "Thứ tự", type: "number" },
    ],
    columns: [
      { key: "ma", label: "Mã" },
      { key: "ten", label: "Tên" },
      { key: "gia_cong_them", label: "Giá cộng", render: (item) => dinhDangTien(item.gia_cong_them) },
      { key: "so_gia_su", label: "Gia sư" },
    ],
  },
  "muc-kinh-nghiem": {
    dataKey: "muc_kinh_nghiem",
    apiKey: "muc-kinh-nghiem",
    title: "Mức kinh nghiệm",
    empty: { tu_khoang: "", den_khoang: "", gia_cong_them: "" },
    fields: [
      { name: "tu_khoang", label: "Từ năm", type: "number", required: true },
      { name: "den_khoang", label: "Đến năm", type: "number" },
      { name: "gia_cong_them", label: "Giá cộng thêm", type: "number" },
    ],
    columns: [
      { key: "tu_khoang", label: "Khoảng năm", render: (item) => item.den_khoang === null ? `${item.tu_khoang}+ năm` : `${item.tu_khoang} - ${item.den_khoang} năm` },
      { key: "gia_cong_them", label: "Giá cộng", render: (item) => dinhDangTien(item.gia_cong_them) },
      { key: "so_gia_su", label: "Gia sư" },
    ],
  },
};

function dinhDangTien(value) {
  const soTien = Number(value || 0);
  return soTien ? `${soTien.toLocaleString("vi-VN")} đ` : "0 đ";
}

function AdminDanhMuc() {
  const [tab, setTab] = useState("cap-hoc");

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-extrabold">Danh mục hệ thống</div>
        <div className="mt-2 text-sm text-white/70">
          Quản lý dữ liệu nền: cấp học, môn học, loại gói học, trình độ và kinh nghiệm.
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={[
              "rounded-xl px-4 py-2 text-sm font-bold transition",
              tab === item.key ? "bg-blue-600 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "mon-hoc" ? (
        <AdminMonHoc compact />
      ) : (
        <DanhMucCrud key={tab} config={cauHinh[tab]} />
      )}
    </div>
  );
}

function DanhMucCrud({ config }) {
  const [danhSach, setDanhSach] = useState([]);
  const [form, setForm] = useState(config.empty);
  const [dangSua, setDangSua] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");

  const taiDanhMuc = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const response = await api.get("/admin/danh-muc");
      if (response.data.success) {
        setDanhSach(response.data.data[config.dataKey] || []);
      }
    } catch (err) {
      setLoi(err.response?.data?.message || "Không tải được danh mục.");
    } finally {
      setDangTai(false);
    }
  }, [config.dataKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void taiDanhMuc();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [taiDanhMuc]);

  const capNhatForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setLoi("");
    setThongBao("");
  };

  const chonSua = (item) => {
    const next = { ...config.empty };
    Object.keys(next).forEach((key) => {
      next[key] = item[key] ?? "";
    });
    setForm(next);
    setDangSua(item);
  };

  const huySua = () => {
    setForm(config.empty);
    setDangSua(null);
  };

  const luu = async (event) => {
    event.preventDefault();
    setDangLuu(true);
    setLoi("");
    setThongBao("");

    try {
      const response = dangSua
        ? await api.patch(`/admin/danh-muc/${config.apiKey}/${dangSua.id}`, form)
        : await api.post(`/admin/danh-muc/${config.apiKey}`, form);

      if (response.data.success) {
        setThongBao(response.data.message);
        huySua();
        await taiDanhMuc();
      }
    } catch (err) {
      setLoi(err.response?.data?.message || "Không lưu được danh mục.");
    } finally {
      setDangLuu(false);
    }
  };

  const xoa = async (item) => {
    if (!window.confirm(`Xóa ${config.title.toLowerCase()} này?`)) return;

    try {
      const response = await api.delete(`/admin/danh-muc/${config.apiKey}/${item.id}`);
      if (response.data.success) {
        setThongBao(response.data.message);
        setDanhSach((prev) => prev.filter((row) => row.id !== item.id));
      }
    } catch (err) {
      setLoi(err.response?.data?.message || "Không xóa được danh mục.");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="font-extrabold">{config.title}</div>
          <div className="text-sm text-white/60">Tổng: {danhSach.length}</div>
        </div>

        {(loi || thongBao) && (
          <div className={`m-4 rounded-xl border px-4 py-3 text-sm font-semibold ${loi ? "border-red-400/30 bg-red-500/10 text-red-100" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"}`}>
            {loi || thongBao}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase text-white/55">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">{column.label}</th>
                ))}
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dangTai ? (
                <tr><td colSpan={config.columns.length + 1} className="px-4 py-8 text-center text-white/60">Đang tải...</td></tr>
              ) : danhSach.length === 0 ? (
                <tr><td colSpan={config.columns.length + 1} className="px-4 py-8 text-center text-white/60">Chưa có dữ liệu.</td></tr>
              ) : (
                danhSach.map((item) => (
                  <tr key={item.id}>
                    {config.columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-white/80">
                        {column.render ? column.render(item) : item[column.key] ?? "-"}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => chonSua(item)} className="rounded-lg border border-blue-300/30 px-3 py-2 text-xs font-bold text-blue-100 hover:bg-blue-500/15">Sửa</button>
                        <button type="button" onClick={() => xoa(item)} className="rounded-lg border border-red-300/30 px-3 py-2 text-xs font-bold text-red-100 hover:bg-red-500/15">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <form onSubmit={luu} className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="text-lg font-extrabold">{dangSua ? `Sửa ${config.title.toLowerCase()}` : `Thêm ${config.title.toLowerCase()}`}</div>
        <div className="mt-4 space-y-4">
          {config.fields.map((field) => (
            <label key={field.name} className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">{field.label}</span>
              {field.textarea ? (
                <textarea
                  rows={4}
                  value={form[field.name] ?? ""}
                  onChange={(event) => capNhatForm(field.name, event.target.value)}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
                />
              ) : (
                <input
                  type={field.type || "text"}
                  required={field.required}
                  value={form[field.name] ?? ""}
                  onChange={(event) => capNhatForm(field.name, event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#07122f] px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
                />
              )}
            </label>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button type="submit" disabled={dangLuu} className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
            {dangLuu ? "Đang lưu..." : dangSua ? "Lưu thay đổi" : "Thêm mới"}
          </button>
          {dangSua && (
            <button type="button" onClick={huySua} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/75 hover:bg-white/5">Hủy</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AdminDanhMuc;
