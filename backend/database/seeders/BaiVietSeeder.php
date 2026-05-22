<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BaiVietSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('baiviet')->insert([

            'user_id' => 1,

            'tieu_de' => 'Bí quyết đạt điểm cao khi học cùng gia sư',

            'slug' => 'bi-quyet-dat-diem-cao-khi-hoc-cung-gia-su',

            'tom_tat' => 'Làm thế nào để chọn được gia sư phù hợp và nâng cao kết quả học tập hiệu quả?',

            'noi_dung' => '

            <h2>Bí quyết học hiệu quả cùng gia sư</h2>

            <p>
                Việc học cùng gia sư đang trở thành xu hướng phổ biến đối với học sinh,
                sinh viên hiện nay. Một gia sư phù hợp không chỉ giúp cải thiện điểm số
                mà còn hỗ trợ xây dựng phương pháp học tập hiệu quả và lâu dài.
            </p>

            <p>
                Khi lựa chọn gia sư, học viên nên ưu tiên những người có chuyên môn tốt,
                kỹ năng truyền đạt dễ hiểu và có lịch dạy linh hoạt. Ngoài ra,
                việc xem đánh giá từ các học viên trước cũng là yếu tố rất quan trọng.
            </p>

            <p>
                Để đạt kết quả tốt, học viên cần chủ động chuẩn bị bài trước khi học,
                ghi chú đầy đủ trong quá trình học và luyện tập thường xuyên sau mỗi buổi học.
                Việc duy trì lịch học định kỳ sẽ giúp kiến thức được củng cố hiệu quả hơn.
            </p>

            <p>
                Bên cạnh đó, gia sư cũng cần theo dõi tiến độ học tập của học viên,
                đưa ra lộ trình phù hợp và hỗ trợ giải đáp thắc mắc kịp thời.
                Sự phối hợp tốt giữa gia sư và học viên sẽ tạo nên môi trường học tập tích cực.
            </p>

            <p>
                Hệ thống đặt lịch gia sư trực tuyến giúp học viên dễ dàng tìm kiếm,
                đặt lịch và thanh toán nhanh chóng. Đây là giải pháp hiện đại giúp tiết kiệm thời gian
                và nâng cao trải nghiệm học tập.
            </p>

            ',

            'trang_thai' => 'xuat_ban',

            'luot_xem' => 150,

            'created_at' => Carbon::now(),

            'updated_at' => Carbon::now()

        ]);
    }
}