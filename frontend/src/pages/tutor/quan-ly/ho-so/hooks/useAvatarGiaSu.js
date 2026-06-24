import { useState } from "react";
import api from "../../../../../services/api";

export default function useAvatarGiaSu({
    avatarBanDau,
    updateUser,
    baoLoi,
    baoThanhCong,
}) {
    const [avatarMoi, setAvatarMoi] = useState("");
    const [dangTaiLen, setDangTaiLen] = useState(false);
    const avatarUrl = avatarMoi || avatarBanDau || "";

    const doiAvatar = async (file) => {
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            baoLoi("Ảnh đại diện chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            baoLoi("Ảnh đại diện không được vượt quá 5MB.");
            return;
        }

        const duLieuGui = new FormData();
        duLieuGui.append("avatar", file);
        setDangTaiLen(true);

        try {
            const phanHoi = await api.post(
                "/gia-su/ho-so/avatar",
                duLieuGui,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            const avatarUrlMoi = phanHoi.data.data?.avatar_url || "";

            setAvatarMoi(avatarUrlMoi);
            updateUser({ anh_dai_dien: avatarUrlMoi });
            baoThanhCong(phanHoi.data.message);
        } catch (error) {
            baoLoi(
                error.response?.data?.errors?.avatar?.[0]
                || error.response?.data?.message
                || "Không thể cập nhật ảnh đại diện.",
            );
        } finally {
            setDangTaiLen(false);
        }
    };

    return { avatarUrl, dangTaiLen, doiAvatar };
}
