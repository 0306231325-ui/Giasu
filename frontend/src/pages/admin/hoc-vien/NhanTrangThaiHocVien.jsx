import { TEN_TRANG_THAI_HOC_VIEN } from "./trangThaiHocVien";

function NhanTrangThaiHocVien({ trangThai }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        trangThai === "hoatdong"
          ? "bg-emerald-400/10 text-emerald-200"
          : "bg-red-400/10 text-red-200",
      ].join(" ")}
    >
      {TEN_TRANG_THAI_HOC_VIEN[trangThai] || trangThai}
    </span>
  );
}

export default NhanTrangThaiHocVien;
