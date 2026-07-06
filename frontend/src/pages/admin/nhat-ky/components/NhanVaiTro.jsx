function NhanVaiTro({ vaiTro }) {
  const cauHinh = {
    admin: "border-purple-300/30 bg-purple-300/10 text-purple-200",
    giasu: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    hocvien: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  };

  const nhan = {
    admin: "Admin",
    giasu: "Gia sư",
    hocvien: "Học viên",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
        cauHinh[vaiTro] || "border-white/10 bg-white/5 text-white/70",
      ].join(" ")}
    >
      {nhan[vaiTro] || vaiTro || "Hệ thống"}
    </span>
  );
}

export default NhanVaiTro;
