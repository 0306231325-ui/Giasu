import { useEffect, useRef, useState } from "react";
import api from "../../services/api";

const TRANG_THAI_BAI_VIET = [
  { value: "xuat_ban", label: "Xuất bản" },
  { value: "nhap", label: "Bản nháp" },
  { value: "an", label: "Ẩn" },
];

const GIA_TRI_MAC_DINH = {
  tieu_de: "",
  tom_tat: "",
  noi_dung: "",
  trang_thai: "xuat_ban",
};

function AdminBaiViet() {
  const [form, setForm] = useState(GIA_TRI_MAC_DINH);
  const [anhBia, setAnhBia] = useState(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [anhXemTruoc, setAnhXemTruoc] = useState("");
  const urlAnhXemTruoc = useRef("");

  useEffect(() => {
    return () => {
      if (urlAnhXemTruoc.current) {
        URL.revokeObjectURL(urlAnhXemTruoc.current);
      }
    };
  }, []);

  const capNhatForm = (event) => {
    const { name, value } = event.target;
    setForm((duLieuHienTai) => ({
      ...duLieuHienTai,
      [name]: value,
    }));
  };

  const chonAnhBia = (event) => {
    const file = event.target.files?.[0] || null;

    if (urlAnhXemTruoc.current) {
      URL.revokeObjectURL(urlAnhXemTruoc.current);
      urlAnhXemTruoc.current = "";
    }

    setAnhBia(file);
    if (file) {
      const url = URL.createObjectURL(file);
      urlAnhXemTruoc.current = url;
      setAnhXemTruoc(url);
    } else {
      setAnhXemTruoc("");
    }
  };

  const taoBaiViet = async (event) => {
    event.preventDefault();
    setDangLuu(true);
    setLoi("");
    setThongBao("");

    const duLieu = new FormData();
    duLieu.append("tieu_de", form.tieu_de);
    duLieu.append("tom_tat", form.tom_tat);
    duLieu.append("noi_dung", form.noi_dung);
    duLieu.append("trang_thai", form.trang_thai);

    if (anhBia) {
      duLieu.append("anh_bia", anhBia);
    }

    try {
      const response = await api.post("/admin/baiviet", duLieu, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setThongBao(response.data.message || "Tạo bài viết thành công.");
      setForm(GIA_TRI_MAC_DINH);
      setAnhBia(null);
      if (urlAnhXemTruoc.current) {
        URL.revokeObjectURL(urlAnhXemTruoc.current);
        urlAnhXemTruoc.current = "";
      }
      setAnhXemTruoc("");
      event.target.reset();
    } catch (err) {
      const loiValidate = err.response?.data?.errors;
      const loiDauTien = loiValidate
        ? Object.values(loiValidate).flat()[0]
        : null;

      setLoi(
        loiDauTien ||
          err.response?.data?.message ||
          "Không tạo được bài viết."
      );
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold">Tạo bài viết</div>
          <div className="mt-2 text-sm text-white/70">
            Đăng nội dung mới và tải ảnh bìa cho trang bài viết.
          </div>
        </div>
      </div>

      <form
        onSubmit={taoBaiViet}
        className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <label className="block text-sm font-semibold text-white/90">
              Tiêu đề
            </label>
            <input
              name="tieu_de"
              value={form.tieu_de}
              onChange={capNhatForm}
              required
              maxLength={255}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
              placeholder="Nhập tiêu đề bài viết"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <label className="block text-sm font-semibold text-white/90">
              Tóm tắt
            </label>
            <textarea
              name="tom_tat"
              value={form.tom_tat}
              onChange={capNhatForm}
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
              placeholder="Nội dung ngắn hiển thị ngoài danh sách"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <label className="block text-sm font-semibold text-white/90">
              Nội dung
            </label>
            <textarea
              name="noi_dung"
              value={form.noi_dung}
              onChange={capNhatForm}
              required
              rows={12}
              className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
              placeholder="Nhập nội dung bài viết"
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <label className="block text-sm font-semibold text-white/90">
              Trạng thái
            </label>
            <select
              name="trang_thai"
              value={form.trang_thai}
              onChange={capNhatForm}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0a0f24] px-4 py-3 text-white outline-none focus:border-blue-400"
            >
              {TRANG_THAI_BAI_VIET.map((trangThai) => (
                <option key={trangThai.value} value={trangThai.value}>
                  {trangThai.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <label className="block text-sm font-semibold text-white/90">
              Ảnh bìa
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chonAnhBia}
              className="mt-2 w-full text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
            />

            {anhXemTruoc ? (
              <img
                src={anhXemTruoc}
                alt="Ảnh bìa xem trước"
                className="mt-4 aspect-video w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mt-4 aspect-video w-full rounded-xl border border-dashed border-white/20 bg-[#0a0f24]" />
            )}
          </div>

          {loi ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {loi}
            </div>
          ) : null}

          {thongBao ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {thongBao}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={dangLuu}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dangLuu ? "Đang lưu..." : "Tạo bài viết"}
          </button>
        </aside>
      </form>
    </div>
  );
}

export default AdminBaiViet;
