import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const STATUS_LABELS = {
  hoatdong: "Hoạt động",
  khoa: "Đã khóa",
};

function AdminHocVien() {
  const [hocVien, setHocVien] = useState([]);
  const [meta, setMeta] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(
    () => ({
      page,
      per_page: 10,
      ...(keyword.trim() ? { q: keyword.trim() } : {}),
      ...(status ? { trang_thai: status } : {}),
    }),
    [keyword, page, status]
  );

  useEffect(() => {
    let cancelled = false;

    const taiDanhSachHocVien = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/hoc-vien", { params });

        if (!cancelled && response.data.success) {
          setHocVien(response.data.data.data || []);
          setMeta(response.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setHocVien([]);
          setMeta(null);
          setError(
            err.response?.data?.message ||
              "Không tải được danh sách tài khoản học viên."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    taiDanhSachHocVien();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const xuLyDoiTuKhoa = (event) => {
    setKeyword(event.target.value);
    setPage(1);
  };

  const xuLyDoiTrangThai = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold">
            Danh sách tài khoản học viên
          </div>
          <div className="mt-2 text-sm text-white/70">
            Quản lý tài khoản, thông tin học tập và liên hệ phụ huynh.
          </div>
        </div>

        <div className="text-sm text-white/70">
          Tổng:{" "}
          <span className="font-bold text-white">{meta?.total ?? 0}</span>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-white/60">
              Tìm kiếm
            </span>
            <input
              value={keyword}
              onChange={xuLyDoiTuKhoa}
              placeholder="Tên, email hoặc số điện thoại"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0f24] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-white/60">
              Trạng thái
            </span>
            <select
              value={status}
              onChange={xuLyDoiTrangThai}
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0f24] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-400"
            >
              <option value="">Tất cả</option>
              <option value="hoatdong">Hoạt động</option>
              <option value="khoa">Đã khóa</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#0a0f24]">
        {error ? (
          <div className="p-5 text-sm text-red-200">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase text-white/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Học viên</th>
                  <th className="px-4 py-3 font-semibold">Liên hệ</th>
                  <th className="px-4 py-3 font-semibold">Lớp / trường</th>
                  <th className="px-4 py-3 font-semibold">Phụ huynh</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-white/70">
                      Đang tải danh sách học viên...
                    </td>
                  </tr>
                ) : hocVien.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-white/70">
                      Không có tài khoản học viên phù hợp.
                    </td>
                  </tr>
                ) : (
                  hocVien.map((item) => (
                    <tr key={item.id} className="align-top hover:bg-white/[0.03]">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">{item.ho_ten}</div>
                        <div className="mt-1 text-xs text-white/50">ID: {item.id}</div>
                      </td>
                      <td className="px-4 py-4 text-white/75">
                        <div>{item.email}</div>
                        <div className="mt-1">{item.sdt || "Chưa cập nhật SĐT"}</div>
                      </td>
                      <td className="px-4 py-4 text-white/75">
                        <div>{item.hocvien?.lop || "Chưa cập nhật lớp"}</div>
                        <div className="mt-1 text-white/50">
                          {item.hocvien?.truong_hoc || "Chưa cập nhật trường"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-white/75">
                        <div>{item.hocvien?.ten_phu_huynh || "Chưa cập nhật"}</div>
                        <div className="mt-1 text-white/50">
                          {item.hocvien?.sdt_phu_huynh || "Chưa có SĐT"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                            item.trang_thai === "hoatdong"
                              ? "bg-emerald-400/10 text-emerald-200"
                              : "bg-red-400/10 text-red-200",
                          ].join(" ")}
                        >
                          {STATUS_LABELS[item.trang_thai] || item.trang_thai}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-white/60">
          Trang {meta?.current_page ?? page} / {meta?.last_page ?? 1}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trước
          </button>
          <button
            type="button"
            disabled={loading || page >= (meta?.last_page ?? 1)}
            onClick={() =>
              setPage((currentPage) =>
                Math.min(currentPage + 1, meta?.last_page ?? currentPage)
              )
            }
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminHocVien;
