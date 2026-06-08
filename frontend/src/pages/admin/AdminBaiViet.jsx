import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import DanhSachBaiViet from "./bai-viet/DanhSachBaiViet";
import FormTaoBaiViet from "./bai-viet/FormTaoBaiViet";
import TabButton from "./bai-viet/TabButton";
import { GIA_TRI_BAI_VIET_MAC_DINH } from "./bai-viet/trangThaiBaiViet";

function AdminBaiViet() {
  const navigate = useNavigate();
  const [tabDangMo, setTabDangMo] = useState("danh_sach");
  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [locTrangThai, setLocTrangThai] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [lanTaiLaiDanhSach, setLanTaiLaiDanhSach] = useState(0);
  const [dangTaiDanhSach, setDangTaiDanhSach] = useState(false);
  const [loiDanhSach, setLoiDanhSach] = useState("");
  const [form, setForm] = useState(GIA_TRI_BAI_VIET_MAC_DINH);
  const [anhBia, setAnhBia] = useState(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [anhXemTruoc, setAnhXemTruoc] = useState("");
  const urlAnhXemTruoc = useRef("");

  const thamSoDanhSach = useMemo(
    () => ({
      page: trangHienTai,
      ...(tuKhoa.trim() ? { q: tuKhoa.trim() } : {}),
      ...(locTrangThai ? { trang_thai: locTrangThai } : {}),
    }),
    [locTrangThai, trangHienTai, tuKhoa]
  );

  useEffect(() => {
    let daHuy = false;

    const taiDanhSachBaiViet = async () => {
      setDangTaiDanhSach(true);
      setLoiDanhSach("");

      try {
        const response = await api.get("/admin/baiviet", {
          params: thamSoDanhSach,
        });

        if (!daHuy && response.data.success) {
          setDanhSachBaiViet(response.data.data.data || []);
          setMeta(response.data.data);
        }
      } catch (err) {
        if (!daHuy) {
          setDanhSachBaiViet([]);
          setMeta(null);
          setLoiDanhSach(
            err.response?.data?.message || "Không tải được danh sách bài viết."
          );
        }
      } finally {
        if (!daHuy) setDangTaiDanhSach(false);
      }
    };

    taiDanhSachBaiViet();

    return () => {
      daHuy = true;
    };
  }, [lanTaiLaiDanhSach, thamSoDanhSach]);

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
      setForm(GIA_TRI_BAI_VIET_MAC_DINH);
      setAnhBia(null);
      if (urlAnhXemTruoc.current) {
        URL.revokeObjectURL(urlAnhXemTruoc.current);
        urlAnhXemTruoc.current = "";
      }
      setAnhXemTruoc("");
      event.target.reset();
      setTrangHienTai(1);
      setLanTaiLaiDanhSach((lanTaiLai) => lanTaiLai + 1);
      setTabDangMo("danh_sach");
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

  const doiTuKhoa = (event) => {
    setTuKhoa(event.target.value);
    setTrangHienTai(1);
  };

  const doiLocTrangThai = (event) => {
    setLocTrangThai(event.target.value);
    setTrangHienTai(1);
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold">Quản lý bài viết</div>
          <div className="mt-2 text-sm text-white/70">
            Xem danh sách bài viết và đăng nội dung mới cho trang người dùng.
          </div>
        </div>

        <div className="text-sm text-white/70">
          Tổng:{" "}
          <span className="font-bold text-white">{meta?.total ?? 0}</span>
        </div>
      </div>

      <div className="mt-6 flex w-full gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 sm:w-fit">
        <TabButton
          dangMo={tabDangMo === "danh_sach"}
          onClick={() => setTabDangMo("danh_sach")}
        >
          Danh sách bài viết
        </TabButton>
        <TabButton
          dangMo={tabDangMo === "tao_moi"}
          onClick={() => setTabDangMo("tao_moi")}
        >
          Tạo bài viết
        </TabButton>
      </div>

      {tabDangMo === "danh_sach" ? (
        <DanhSachBaiViet
          danhSachBaiViet={danhSachBaiViet}
          dangTai={dangTaiDanhSach}
          loi={loiDanhSach}
          meta={meta}
          tuKhoa={tuKhoa}
          locTrangThai={locTrangThai}
          trangHienTai={trangHienTai}
          doiTuKhoa={doiTuKhoa}
          doiLocTrangThai={doiLocTrangThai}
          chuyenTrang={setTrangHienTai}
          navigate={navigate}
        />
      ) : (
        <FormTaoBaiViet
          form={form}
          anhXemTruoc={anhXemTruoc}
          dangLuu={dangLuu}
          loi={loi}
          thongBao={thongBao}
          capNhatForm={capNhatForm}
          chonAnhBia={chonAnhBia}
          taoBaiViet={taoBaiViet}
        />
      )}
    </div>
  );
}

export default AdminBaiViet;
