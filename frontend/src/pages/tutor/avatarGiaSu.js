const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

export function layUrlAnhGiaSu(giaSu) {
    const duongDan = giaSu?.avatar_url || giaSu?.avatar || giaSu?.user?.anh_dai_dien;

    if (!duongDan) return null;
    if (/^https?:\/\//i.test(duongDan)) return duongDan;

    return `${API_ORIGIN}/${String(duongDan).replace(/^\/+/, "")}`;
}
