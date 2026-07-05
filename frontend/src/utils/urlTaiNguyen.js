const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(
    /\/api\/?$/,
    "",
);

export function taoUrlPublic(duongDan) {
    if (!duongDan) return "";
    if (/^(https?:)?\/\//i.test(duongDan) || /^blob:/i.test(duongDan)) {
        return duongDan;
    }

    return `${API_ORIGIN}/${String(duongDan).replace(/^\/+/, "")}`;
}

export function layUrlAnhDaiDien(user) {
    return taoUrlPublic(user?.anh_dai_dien || user?.avatar_url || user?.avatar);
}
