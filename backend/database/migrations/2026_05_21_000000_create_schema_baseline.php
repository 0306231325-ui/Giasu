<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        foreach ($this->schemaStatements() as $statement) {
            DB::unprepared($statement);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        foreach (array_reverse($this->tableNames()) as $table) {
            Schema::dropIfExists($table);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    private function tableNames(): array
    {
        return array (
  0 => 'api_tokens',
  1 => 'baiviet',
  2 => 'banner',
  3 => 'cache',
  4 => 'cache_locks',
  5 => 'cap_hoc',
  6 => 'danhgia',
  7 => 'failed_jobs',
  8 => 'giasu',
  9 => 'giasu_bang_cap',
  10 => 'giasu_cap_hoc',
  11 => 'giasu_gia',
  12 => 'goihoc',
  13 => 'hocvien',
  14 => 'job_batches',
  15 => 'jobs',
  16 => 'lichhoc',
  17 => 'loai_goi',
  18 => 'monhoc',
  19 => 'muc_kinh_nghiem',
  20 => 'personal_access_tokens',
  21 => 'phan_hoi',
  22 => 'thanhtoan',
  23 => 'thongbao',
  24 => 'trinh_do_giasu',
  25 => 'users',
  26 => 'yeucau_hocbu',
);
    }

    private function schemaStatements(): array
    {
        return array (
  0 => 'CREATE TABLE IF NOT EXISTS `api_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_tokens_token_unique` (`token`),
  KEY `api_tokens_user_id_foreign` (`user_id`),
  CONSTRAINT `api_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  1 => 'CREATE TABLE IF NOT EXISTS `baiviet` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `tieu_de` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `tom_tat` text DEFAULT NULL,
  `noi_dung` longtext NOT NULL,
  `anh_bia` varchar(255) DEFAULT NULL,
  `luot_xem` int(10) unsigned NOT NULL DEFAULT 0,
  `trang_thai` enum(\'xuat_ban\',\'nhap\',\'an\') NOT NULL DEFAULT \'xuat_ban\',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `baiviet_slug_unique` (`slug`),
  KEY `baiviet_user_id_foreign` (`user_id`),
  KEY `baiviet_deleted_by_id_foreign` (`deleted_by_id`),
  CONSTRAINT `baiviet_deleted_by_id_foreign` FOREIGN KEY (`deleted_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `baiviet_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  2 => 'CREATE TABLE IF NOT EXISTS `banner` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(255) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `anh` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `trang_thai` enum(\'hienthi\',\'an\') NOT NULL DEFAULT \'hienthi\',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  3 => 'CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  4 => 'CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  5 => 'CREATE TABLE IF NOT EXISTS `cap_hoc` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ma` varchar(50) NOT NULL,
  `ten` varchar(100) NOT NULL,
  `thu_tu` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cap_hoc_ma_unique` (`ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  6 => 'CREATE TABLE IF NOT EXISTS `danhgia` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `lichhoc_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `so_sao` tinyint(4) NOT NULL,
  `noi_dung` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `danhgia_lichhoc_id_foreign` (`lichhoc_id`),
  KEY `danhgia_user_id_foreign` (`user_id`),
  CONSTRAINT `danhgia_lichhoc_id_foreign` FOREIGN KEY (`lichhoc_id`) REFERENCES `lichhoc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `danhgia_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  7 => 'CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  8 => 'CREATE TABLE IF NOT EXISTS `giasu` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `muc_kinh_nghiem_id` bigint(20) unsigned DEFAULT NULL,
  `he_so_gia` decimal(5,2) NOT NULL DEFAULT 0.00,
  `hoc_van` varchar(255) DEFAULT NULL,
  `trinh_do_giasu_id` bigint(20) unsigned DEFAULT NULL,
  `trang_thai_ho_so` enum(\'cho_duyet\',\'duyet\',\'tu_choi\') NOT NULL DEFAULT \'cho_duyet\',
  `duyet_boi` bigint(20) unsigned DEFAULT NULL,
  `duyet_luc` timestamp NULL DEFAULT NULL,
  `ly_do_tu_choi` text DEFAULT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `giasu_user_id_foreign` (`user_id`),
  KEY `giasu_duyet_boi_foreign` (`duyet_boi`),
  KEY `giasu_trinh_do_giasu_id_foreign` (`trinh_do_giasu_id`),
  KEY `giasu_muc_kinh_nghiem_id_foreign` (`muc_kinh_nghiem_id`),
  CONSTRAINT `giasu_duyet_boi_foreign` FOREIGN KEY (`duyet_boi`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `giasu_muc_kinh_nghiem_id_foreign` FOREIGN KEY (`muc_kinh_nghiem_id`) REFERENCES `muc_kinh_nghiem` (`id`) ON DELETE SET NULL,
  CONSTRAINT `giasu_trinh_do_giasu_id_foreign` FOREIGN KEY (`trinh_do_giasu_id`) REFERENCES `trinh_do_giasu` (`id`) ON DELETE SET NULL,
  CONSTRAINT `giasu_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  9 => 'CREATE TABLE IF NOT EXISTS `giasu_bang_cap` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `giasu_id` bigint(20) unsigned NOT NULL,
  `ten_bang` varchar(255) NOT NULL,
  `loai_bang` enum(\'bang_cap\',\'chung_chi\',\'khac\') DEFAULT NULL,
  `trinh_do_giasu_id` bigint(20) unsigned DEFAULT NULL,
  `chuyen_nganh` varchar(255) DEFAULT NULL,
  `truong_don_vi` varchar(255) DEFAULT NULL,
  `file_url` varchar(500) NOT NULL,
  `trang_thai` enum(\'cho_duyet\',\'duyet\',\'tu_choi\') NOT NULL DEFAULT \'cho_duyet\',
  `duyet_boi` bigint(20) unsigned DEFAULT NULL,
  `duyet_luc` timestamp NULL DEFAULT NULL,
  `ly_do` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `giasu_bang_cap_giasu_id_foreign` (`giasu_id`),
  KEY `giasu_bang_cap_duyet_boi_foreign` (`duyet_boi`),
  KEY `giasu_bang_cap_trinh_do_giasu_id_foreign` (`trinh_do_giasu_id`),
  CONSTRAINT `giasu_bang_cap_duyet_boi_foreign` FOREIGN KEY (`duyet_boi`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `giasu_bang_cap_giasu_id_foreign` FOREIGN KEY (`giasu_id`) REFERENCES `giasu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `giasu_bang_cap_trinh_do_giasu_id_foreign` FOREIGN KEY (`trinh_do_giasu_id`) REFERENCES `trinh_do_giasu` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  10 => 'CREATE TABLE IF NOT EXISTS `giasu_cap_hoc` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `giasu_id` bigint(20) unsigned NOT NULL,
  `cap_hoc_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `giasu_cap_hoc_giasu_cap_unique` (`giasu_id`,`cap_hoc_id`),
  KEY `giasu_cap_hoc_cap_hoc_id_foreign` (`cap_hoc_id`),
  CONSTRAINT `giasu_cap_hoc_cap_hoc_id_foreign` FOREIGN KEY (`cap_hoc_id`) REFERENCES `cap_hoc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `giasu_cap_hoc_giasu_id_foreign` FOREIGN KEY (`giasu_id`) REFERENCES `giasu` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  11 => 'CREATE TABLE IF NOT EXISTS `giasu_gia` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `giasu_id` bigint(20) unsigned NOT NULL,
  `monhoc_id` bigint(20) unsigned NOT NULL,
  `gia_mon` decimal(10,2) NOT NULL,
  `gia_cong_trinh_do` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gia_cong_kinh_nghiem` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gia_cong_them` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tong_gia` decimal(10,2) NOT NULL,
  `trang_thai` enum(\'cho_duyet\',\'da_duyet\',\'tu_choi\',\'ngung_day\') NOT NULL DEFAULT \'cho_duyet\',
  `ly_do_tu_choi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `giasu_mon_giasu_id_monhoc_id_unique` (`giasu_id`,`monhoc_id`),
  KEY `giasu_mon_monhoc_id_foreign` (`monhoc_id`),
  CONSTRAINT `giasu_mon_giasu_id_foreign` FOREIGN KEY (`giasu_id`) REFERENCES `giasu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `giasu_mon_monhoc_id_foreign` FOREIGN KEY (`monhoc_id`) REFERENCES `monhoc` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  12 => 'CREATE TABLE IF NOT EXISTS `goihoc` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hocvien_id` bigint(20) unsigned NOT NULL,
  `giasu_id` bigint(20) unsigned DEFAULT NULL,
  `monhoc_id` bigint(20) unsigned NOT NULL,
  `giasu_gia_id` bigint(20) unsigned DEFAULT NULL,
  `loai_goi_id` bigint(20) unsigned DEFAULT NULL,
  `ngay_batdau` date NOT NULL,
  `ngay_ketthuc` date NOT NULL,
  `so_buoi` int(11) NOT NULL,
  `hoc_dinhky` tinyint(1) NOT NULL DEFAULT 1,
  `thu` tinyint(4) DEFAULT NULL,
  `gio_batdau` time DEFAULT NULL,
  `gio_ketthuc` time DEFAULT NULL,
  `dia_chi_hoc` varchar(255) DEFAULT NULL,
  `hinh_thuc_hoc` enum(\'offline\',\'online\') NOT NULL DEFAULT \'offline\',
  `don_gia_theogio` decimal(10,2) DEFAULT NULL,
  `tong_tien` decimal(10,2) NOT NULL DEFAULT 0.00,
  `trang_thai` enum(\'cho_xacnhan\',\'cho_thanhtoan\',\'danghoc\',\'hoanthanh\',\'dahuy\') NOT NULL DEFAULT \'cho_xacnhan\',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `goihoc_hocvien_id_foreign` (`hocvien_id`),
  KEY `goihoc_monhoc_id_foreign` (`monhoc_id`),
  KEY `goihoc_chietkhau_id_foreign` (`loai_goi_id`),
  KEY `goihoc_giasu_gia_id_foreign` (`giasu_gia_id`),
  KEY `goihoc_giasu_id_foreign` (`giasu_id`),
  CONSTRAINT `goihoc_chietkhau_id_foreign` FOREIGN KEY (`loai_goi_id`) REFERENCES `loai_goi` (`id`) ON DELETE SET NULL,
  CONSTRAINT `goihoc_giasu_gia_id_foreign` FOREIGN KEY (`giasu_gia_id`) REFERENCES `giasu_gia` (`id`) ON DELETE SET NULL,
  CONSTRAINT `goihoc_giasu_id_foreign` FOREIGN KEY (`giasu_id`) REFERENCES `giasu` (`id`) ON DELETE SET NULL,
  CONSTRAINT `goihoc_hocvien_id_foreign` FOREIGN KEY (`hocvien_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `goihoc_monhoc_id_foreign` FOREIGN KEY (`monhoc_id`) REFERENCES `monhoc` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  13 => 'CREATE TABLE IF NOT EXISTS `hocvien` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `lop` varchar(50) DEFAULT NULL,
  `truong_hoc` varchar(255) DEFAULT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `ten_phu_huynh` varchar(100) DEFAULT NULL,
  `sdt_phu_huynh` varchar(20) DEFAULT NULL,
  `muc_tieu_hoc_tap` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hocvien_user_id_foreign` (`user_id`),
  CONSTRAINT `hocvien_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  14 => 'CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  15 => 'CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  16 => 'CREATE TABLE IF NOT EXISTS `lichhoc` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `goihoc_id` bigint(20) unsigned NOT NULL,
  `giasu_id` bigint(20) unsigned DEFAULT NULL,
  `loai_buoi` enum(\'hoc_thuong\',\'hoc_bu\') NOT NULL DEFAULT \'hoc_thuong\',
  `ngay_hoc` date NOT NULL,
  `gio_batdau` time NOT NULL,
  `gio_ketthuc` time NOT NULL,
  `dia_chi_hoc` varchar(255) DEFAULT NULL,
  `hinh_thuc_hoc` enum(\'offline\',\'online\') NOT NULL DEFAULT \'offline\',
  `tien_hoc` decimal(10,2) NOT NULL DEFAULT 0.00,
  `phi_hoahong` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tien_giasu_nhan` decimal(10,2) NOT NULL DEFAULT 0.00,
  `trang_thai` enum(\'cho_xacnhan\',\'da_nhan\',\'hoanthanh\',\'dahuy\') NOT NULL DEFAULT \'da_nhan\',
  `lydo_huy` text DEFAULT NULL,
  `ghi_chu` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lichhoc_goihoc_id_foreign` (`goihoc_id`),
  KEY `lichhoc_giasu_id_foreign` (`giasu_id`),
  CONSTRAINT `lichhoc_giasu_id_foreign` FOREIGN KEY (`giasu_id`) REFERENCES `giasu` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lichhoc_goihoc_id_foreign` FOREIGN KEY (`goihoc_id`) REFERENCES `goihoc` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  17 => 'CREATE TABLE IF NOT EXISTS `loai_goi` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ten_loai_goi` varchar(100) DEFAULT NULL,
  `so_thang` int(10) unsigned NOT NULL,
  `phan_tram_giam` decimal(5,2) NOT NULL DEFAULT 0.00,
  `mo_ta` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chietkhau_so_buoi_unique` (`so_thang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  18 => 'CREATE TABLE IF NOT EXISTS `monhoc` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ten_mon` varchar(100) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `cap_hoc_id` bigint(20) unsigned DEFAULT NULL,
  `lop` varchar(50) DEFAULT NULL,
  `gia` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `monhoc_cap_ten_lop_unique` (`cap_hoc_id`,`ten_mon`,`lop`),
  KEY `monhoc_cap_hoc_id_index` (`cap_hoc_id`),
  CONSTRAINT `monhoc_cap_hoc_id_foreign` FOREIGN KEY (`cap_hoc_id`) REFERENCES `cap_hoc` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  19 => 'CREATE TABLE IF NOT EXISTS `muc_kinh_nghiem` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tu_khoang` tinyint(3) unsigned NOT NULL,
  `den_khoang` tinyint(3) unsigned DEFAULT NULL,
  `gia_cong_them` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `muc_kinh_nghiem_tu_khoang_den_khoang_unique` (`tu_khoang`,`den_khoang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  20 => 'CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  21 => 'CREATE TABLE IF NOT EXISTS `phan_hoi` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `gia_su_id` bigint(20) unsigned NOT NULL,
  `goi_hoc_id` bigint(20) unsigned NOT NULL,
  `phan_hoi` enum(\'dong_y\',\'tu_choi\') NOT NULL,
  `ly_do` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `phan_hoi_gia_su_id_foreign` (`gia_su_id`),
  KEY `phan_hoi_goi_hoc_id_foreign` (`goi_hoc_id`),
  CONSTRAINT `phan_hoi_gia_su_id_foreign` FOREIGN KEY (`gia_su_id`) REFERENCES `giasu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `phan_hoi_goi_hoc_id_foreign` FOREIGN KEY (`goi_hoc_id`) REFERENCES `goihoc` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  22 => 'CREATE TABLE IF NOT EXISTS `thanhtoan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `goihoc_id` bigint(20) unsigned NOT NULL,
  `so_tien` decimal(10,2) NOT NULL,
  `phuong_thuc` enum(\'tienmat\',\'momo\',\'zalopay\',\'banking\') NOT NULL DEFAULT \'tienmat\',
  `so_tai_khoan` varchar(50) DEFAULT NULL,
  `ma_giaodich` varchar(255) DEFAULT NULL,
  `noi_dung_thanhtoan` text DEFAULT NULL,
  `anh_minh_chung` varchar(255) DEFAULT NULL,
  `ngay_thanhtoan` datetime DEFAULT NULL,
  `trang_thai` enum(\'cho_thanhtoan\',\'da_thanhtoan\',\'that_bai\') NOT NULL DEFAULT \'cho_thanhtoan\',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `thanhtoan_goihoc_id_foreign` (`goihoc_id`),
  CONSTRAINT `thanhtoan_goihoc_id_foreign` FOREIGN KEY (`goihoc_id`) REFERENCES `goihoc` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  23 => 'CREATE TABLE IF NOT EXISTS `thongbao` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `tieu_de` varchar(255) NOT NULL,
  `noi_dung` text DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `da_doc` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `thongbao_user_id_foreign` (`user_id`),
  CONSTRAINT `thongbao_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  24 => 'CREATE TABLE IF NOT EXISTS `trinh_do_giasu` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ma` varchar(80) NOT NULL,
  `ten` varchar(150) NOT NULL,
  `gia_cong_them` decimal(10,2) NOT NULL DEFAULT 0.00,
  `thu_tu` smallint(5) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trinh_do_giasu_ma_unique` (`ma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  25 => 'CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(100) NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `sdt` varchar(20) DEFAULT NULL,
  `vai_tro` enum(\'admin\',\'hocvien\',\'giasu\') NOT NULL,
  `anh_dai_dien` varchar(255) DEFAULT NULL,
  `trang_thai` enum(\'hoatdong\',\'khoa\') NOT NULL DEFAULT \'hoatdong\',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  26 => 'CREATE TABLE IF NOT EXISTS `yeucau_hocbu` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `lichhoc_goc_id` bigint(20) unsigned NOT NULL,
  `giasu_id` bigint(20) unsigned NOT NULL,
  `nguoi_yeu_cau_id` bigint(20) unsigned NOT NULL,
  `ngay_yeu_cau` datetime DEFAULT NULL,
  `ngay_hoc` date NOT NULL,
  `gio_batdau` time NOT NULL,
  `gio_ketthuc` time NOT NULL,
  `ly_do` text NOT NULL,
  `trang_thai` enum(\'cho_duyet\',\'da_duyet\',\'tu_choi\') NOT NULL DEFAULT \'cho_duyet\',
  `nguoi_duyet_id` bigint(20) unsigned DEFAULT NULL,
  `ngay_xu_ly` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `yeucau_hocbu_lichhoc_goc_id_foreign` (`lichhoc_goc_id`),
  KEY `yeucau_hocbu_giasu_id_foreign` (`giasu_id`),
  KEY `yeucau_hocbu_nguoi_yeu_cau_id_foreign` (`nguoi_yeu_cau_id`),
  KEY `yeucau_hocbu_nguoi_duyet_id_foreign` (`nguoi_duyet_id`),
  CONSTRAINT `yeucau_hocbu_giasu_id_foreign` FOREIGN KEY (`giasu_id`) REFERENCES `giasu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `yeucau_hocbu_lichhoc_goc_id_foreign` FOREIGN KEY (`lichhoc_goc_id`) REFERENCES `lichhoc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `yeucau_hocbu_nguoi_duyet_id_foreign` FOREIGN KEY (`nguoi_duyet_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `yeucau_hocbu_nguoi_yeu_cau_id_foreign` FOREIGN KEY (`nguoi_yeu_cau_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
);
    }
};
