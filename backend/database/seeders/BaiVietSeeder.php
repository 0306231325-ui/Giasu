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

            [
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
                    kỹ năng truyền đạt dễ hiểu và có lịch dạy linh hoạt.
                </p>

                <p>
                    Việc chuẩn bị bài trước khi học và luyện tập thường xuyên sau mỗi buổi học
                    sẽ giúp kết quả cải thiện nhanh chóng.
                </p>

                ',

                'trang_thai' => 'xuat_ban',

                'luot_xem' => 150,

                'created_at' => Carbon::now(),

                'updated_at' => Carbon::now()
            ],

            [
                'user_id' => 1,

                'tieu_de' => 'Cách lựa chọn gia sư phù hợp cho học sinh cấp 3',

                'slug' => 'cach-lua-chon-gia-su-phu-hop-cho-hoc-sinh-cap-3',

                'tom_tat' => 'Những tiêu chí quan trọng giúp phụ huynh chọn được gia sư chất lượng.',

                'noi_dung' => '

                <h2>Lựa chọn gia sư phù hợp</h2>

                <p>
                    Đối với học sinh cấp 3, việc lựa chọn gia sư phù hợp đóng vai trò rất quan trọng
                    trong quá trình ôn luyện kiến thức và chuẩn bị cho các kỳ thi quan trọng.
                </p>

                <p>
                    Gia sư cần có kiến thức chuyên môn vững vàng, khả năng truyền đạt dễ hiểu
                    và biết cách tạo động lực học tập cho học sinh.
                </p>

                <p>
                    Ngoài ra, phụ huynh nên ưu tiên lựa chọn những gia sư có kinh nghiệm luyện thi,
                    kỹ năng theo dõi tiến độ học tập và xây dựng lộ trình học rõ ràng.
                </p>

                <p>
                    Một môi trường học tập tích cực sẽ giúp học sinh cải thiện khả năng tự học,
                    tăng sự tự tin và đạt kết quả cao hơn trong các kỳ thi.
                </p>

                ',

                'trang_thai' => 'xuat_ban',

                'luot_xem' => 98,

                'created_at' => Carbon::now(),

                'updated_at' => Carbon::now()
            ],

            [
                'user_id' => 1,

                'tieu_de' => 'Học online cùng gia sư có thực sự hiệu quả?',

                'slug' => 'hoc-online-cung-gia-su-co-thuc-su-hieu-qua',

                'tom_tat' => 'Ưu điểm và hạn chế của hình thức học online với gia sư hiện nay.',

                'noi_dung' => '

                <h2>Gia sư online trong thời đại số</h2>

                <p>
                    Sự phát triển của công nghệ giúp việc học online cùng gia sư trở nên phổ biến hơn.
                    Học viên có thể dễ dàng kết nối với gia sư ở bất kỳ đâu chỉ với điện thoại hoặc máy tính.
                </p>

                <p>
                    Hình thức học online giúp tiết kiệm thời gian di chuyển,
                    linh hoạt lịch học và dễ dàng lưu trữ tài liệu học tập.
                </p>

                <p>
                    Tuy nhiên, để đạt hiệu quả cao, học viên cần có tinh thần tự giác,
                    chuẩn bị đầy đủ thiết bị học tập và đảm bảo kết nối internet ổn định.
                </p>

                <p>
                    Gia sư cũng cần áp dụng phương pháp giảng dạy sinh động,
                    kết hợp hình ảnh và bài tập thực hành để tăng khả năng tiếp thu.
                </p>

                ',

                'trang_thai' => 'xuat_ban',

                'luot_xem' => 205,

                'created_at' => Carbon::now(),

                'updated_at' => Carbon::now()
            ],

            [
                'user_id' => 1,

                'tieu_de' => 'Những sai lầm khiến học cùng gia sư không hiệu quả',

                'slug' => 'nhung-sai-lam-khien-hoc-cung-gia-su-khong-hieu-qua',

                'tom_tat' => 'Các lỗi phổ biến học sinh thường mắc phải khi học với gia sư.',

                'noi_dung' => '

                <h2>Những sai lầm cần tránh</h2>

                <p>
                    Nhiều học sinh thuê gia sư nhưng kết quả học tập vẫn không cải thiện đáng kể.
                    Nguyên nhân chủ yếu đến từ việc thiếu chủ động trong học tập.
                </p>

                <p>
                    Một số học sinh có tâm lý phụ thuộc hoàn toàn vào gia sư,
                    không tự luyện tập hoặc ôn bài sau mỗi buổi học.
                </p>

                <p>
                    Việc học không có mục tiêu rõ ràng và lịch học thiếu ổn định
                    cũng ảnh hưởng lớn đến hiệu quả tiếp thu kiến thức.
                </p>

                <p>
                    Để cải thiện kết quả học tập, học viên cần phối hợp tốt với gia sư,
                    xây dựng kế hoạch học tập khoa học và duy trì tính kỷ luật.
                </p>

                ',

                'trang_thai' => 'xuat_ban',

                'luot_xem' => 132,

                'created_at' => Carbon::now(),

                'updated_at' => Carbon::now()
            ],

            [
                'user_id' => 1,

                'tieu_de' => 'Lợi ích của việc học gia sư từ sớm cho trẻ em',

                'slug' => 'loi-ich-cua-viec-hoc-gia-su-tu-som-cho-tre-em',

                'tom_tat' => 'Học cùng gia sư giúp trẻ xây dựng nền tảng kiến thức vững chắc.',

                'noi_dung' => '

                <h2>Gia sư và sự phát triển của trẻ</h2>

                <p>
                    Việc tiếp cận gia sư từ sớm giúp trẻ hình thành thói quen học tập tích cực
                    và nâng cao khả năng tiếp thu kiến thức ngay từ nhỏ.
                </p>

                <p>
                    Gia sư có thể hỗ trợ trẻ củng cố kiến thức cơ bản,
                    rèn luyện kỹ năng tư duy và cải thiện khả năng tập trung.
                </p>

                <p>
                    Ngoài kiến thức trên lớp, gia sư còn giúp trẻ phát triển kỹ năng mềm,
                    kỹ năng giao tiếp và khả năng giải quyết vấn đề.
                </p>

                <p>
                    Một lộ trình học phù hợp sẽ giúp trẻ tự tin hơn,
                    tạo nền tảng vững chắc cho các cấp học tiếp theo.
                </p>

                ',

                'trang_thai' => 'xuat_ban',

                'luot_xem' => 176,

                'created_at' => Carbon::now(),

                'updated_at' => Carbon::now()
            ]

        ]);
    }
}