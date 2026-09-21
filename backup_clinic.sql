-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: clinic_booking
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('a69a17d1-1ca9-40f7-820f-91bafa1888eb','ee9e58bf1988c4fca683b9f8cfffd2784e39306a1eea946cf5ee2626cb0c0992','2026-09-05 14:41:20.334','20260905144119_init',NULL,NULL,'2026-09-05 14:41:19.391',1),('ff94ffec-fad7-4213-84b0-003e3ff937f4','30c899b148b1ecc75e509974139935b64bcaf677be933866f49562f9c8c5c236','2026-09-07 05:45:16.735','20260907054516_create_role_model',NULL,NULL,'2026-09-07 05:45:16.609',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `doctor_id` int DEFAULT NULL,
  `package_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `appointment_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meeting_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `time_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symptoms` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointments_user_id_fkey` (`user_id`),
  KEY `appointments_doctor_id_fkey` (`doctor_id`),
  KEY `appointments_package_id_fkey` (`package_id`),
  KEY `appointments_order_id_fkey` (`order_id`),
  CONSTRAINT `appointments_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `appointments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `appointments_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `appointments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (2,2,2,NULL,NULL,'OFFLINE',NULL,'2026-09-15','T1','Nguyễn Văn An','0912345678','Ho khan kéo dài, sốt nhẹ 38 độ và đau rát cổ họng 2 ngày nay','CANCELLED','2026-09-16 10:45:51.866'),(3,2,11,1,1,'ONLINE','https://meet.jit.si/ClinicBooking-Apt-3-f0c725ed-93ad-4c48-8844-ddad3898398f','2026-09-20','T2','Nguyễn Văn An','0901234567','Tư vấn sức khỏe tổng quát trực tuyến theo gói đã mua','CANCELLED','2026-09-16 12:20:39.250'),(4,2,11,1,1,'ONLINE','https://meet.jit.si/ClinicBooking-Apt-4-8cad5d58-9050-42b5-81e1-428112a64aac','2026-09-20','T1','Nguyễn Văn An','0901234567','Tư vấn sức khỏe tổng quát trực tuyến theo gói đã mua','CANCELLED','2026-09-16 12:20:43.451'),(5,2,2,2,1,'ONLINE','https://meet.jit.si/ClinicBooking-Apt-5-dfe558f4-f4ab-450c-94ab-2d47b03d64f9','2026-09-15','T3','Nguyễn Văn An','0901234567','Tư vấn sức khỏe tổng quát trực tuyến theo gói đã mua','CANCELLED','2026-09-16 12:15:06.173'),(6,2,2,2,7,'ONLINE','https://meet.jit.si/ClinicBooking-Apt-6-61a1df27-4294-4650-9ae2-0397f78152b3','2026-09-20','T3','Nguyễn Văn An','0901234567','Tư vấn sức khỏe tổng quát trực tuyến theo gói đã mua','CONFIRMED',NULL),(7,2,2,2,7,'ONLINE','https://meet.jit.si/ClinicBooking-Apt-7-5d9e99db-9f91-4773-8430-bac2864562aa','2026-09-20','T1','Nguyễn Văn An','0901234567','Tư vấn sức khỏe tổng quát trực tuyến theo gói đã mua','CONFIRMED',NULL),(8,2,2,2,7,'ONLINE','https://meet.jit.si/ClinicBooking-Apt-8-c9447cd0-9a83-47f4-b199-4cd1fa4850f8','2026-09-20','T2','Nguyễn Văn An','0901234567','Tư vấn sức khỏe tổng quát trực tuyến theo gói đã mua','CONFIRMED',NULL),(9,5,2,NULL,NULL,'OFFLINE',NULL,'2026-09-20','T1','Nguyễn Văn An','0912345678','Ho khan kéo dài, sốt nhẹ 38 độ và đau rát cổ họng 2 ngày nay','CONFIRMED',NULL);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_details`
--

DROP TABLE IF EXISTS `article_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL,
  `html_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_details_article_id_key` (`article_id`),
  CONSTRAINT `article_details_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_details`
--

LOCK TABLES `article_details` WRITE;
/*!40000 ALTER TABLE `article_details` DISABLE KEYS */;
INSERT INTO `article_details` VALUES (1,1,'<div class=\"article-content\">\n    <p>Khám thai định kỳ là một trong những việc quan trọng nhất mà người mẹ cần thực hiện trong suốt thai kỳ. Việc thăm khám đúng lịch không chỉ giúp theo dõi sự phát triển của thai nhi mà còn phát hiện kịp thời các bất thường để xử lý an toàn.</p>\n\n    <h2>1. Mốc tuần thứ 5 – 8: Xác định thai vào tổ</h2>\n    <p>Đây là lần khám đầu tiên sau khi thử que 2 vạch hoặc trễ kinh 1-2 tuần. Mục đích chính là:</p>\n    <ul>\n        <li>Xác định thai đã làm tổ trong buồng tử cung hay chưa, loại trừ thai ngoài tử cung.</li>\n        <li>Kiểm tra tim thai và phôi thai phát triển có bình thường không.</li>\n        <li>Bác sĩ tư vấn bổ sung axit folic để phòng ngừa dị tật ống thần kinh.</li>\n    </ul>\n\n    <h2>2. Mốc tuần thứ 11 – 13 tuần 6 ngày: Đo độ mờ da gáy</h2>\n    <p>Đây là \"thời điểm vàng\" không thể bỏ qua để sàng lọc các bất thường nhiễm sắc thể:</p>\n    <ul>\n        <li>Đo độ mờ da gáy để đánh giá nguy cơ hội chứng Down, Edwards, Patau.</li>\n        <li>Thực hiện xét nghiệm máu Double Test hoặc xét nghiệm NIPT không xâm lấn.</li>\n    </ul>\n\n    <h2>3. Mốc tuần thứ 20 – 22: Siêu âm hình thái học thai nhi</h2>\n    <p>Giai đoạn này các cơ quan nội tạng của thai nhi đã phát triển tương đối hoàn chỉnh. Siêu âm 4D/5D giúp quan sát chi tiết:</p>\n    <ul>\n        <li>Khuôn mặt, mắt, mũi, môi (phát hiện hở hàm ếch, sứt môi).</li>\n        <li>Tứ chi, cột sống, tim, não bộ, thận và các ngón tay chân.</li>\n    </ul>\n\n    <h2>4. Mốc tuần thứ 28 – 32: Đánh giá tăng trưởng và nước ối</h2>\n    <p>Bác sĩ sẽ theo dõi cân nặng thai nhi, ngôi thai, dây rốn và bánh nhau, đồng thời chỉ định xét nghiệm nghiệm pháp dung nạp đường huyết để phát hiện đái tháo đường thai kỳ.</p>\n\n    <h2>5. Mốc từ tuần 36 trở đi: Chuẩn bị chuyển dạ</h2>\n    <p>Khám mỗi tuần một lần để đo Non-stress test (monitor theo dõi tim thai và cơn co tử cung), dự kiến phương pháp sinh và kiểm tra khung chậu.</p>\n\n    <h2>Lời khuyên từ bác sĩ sản khoa</h2>\n    <p>Mẹ bầu hãy ghi nhớ các mốc hẹn trên sổ y bạ, giữ tinh thần lạc quan, uống đủ nước và bổ sung vitamin đều đặn để có một thai kỳ khỏe mạnh và an toàn nhất!</p>\n</div>'),(2,2,'<div class=\"article-content\">\n    <p>Nhiều người nghĩ rằng chỉ cần đánh răng ngày 2 lần là đủ, nhưng thực tế có đến hơn 85% người Việt Nam gặp các vấn đề về răng miệng do vệ sinh chưa đúng cách. Dưới đây là quy trình chăm sóc chuẩn y khoa:</p>\n\n    <h2>1. Kỹ thuật chải răng chuẩn nha khoa</h2>\n    <p>Nên đặt bàn chải nghiêng góc 45 độ so với viền nướu, chải nhẹ nhàng theo chuyển động tròn hoặc rung dọc từ nướu xuống chân răng. Tránh chải ngang với lực quá mạnh vì rất dễ làm mòn cổ men răng và gây tụt nướu.</p>\n\n    <h2>2. Bỏ tăm tre – Chuyển sang chỉ nha khoa hoặc máy tăm nước</h2>\n    <p>Tăm tre truyền thống rất dễ làm thưa kẽ răng và làm tổn thương nhú lợi dẫn đến chảy máu chân răng. Sử dụng chỉ nha khoa hoặc máy tăm nước mỗi ngày giúp lấy sạch thức ăn thừa và mảng bám ở kẽ răng một cách nhẹ nhàng và hiệu quả.</p>\n\n    <h2>3. Đừng quên làm sạch bề mặt lưỡi</h2>\n    <p>Lưỡi là nơi tích tụ tới hơn 50% vi khuẩn trong toàn bộ khoang miệng và là thủ phạm chính gây ra hôi miệng dai dẳng. Dùng dụng cụ cạo lưỡi chuyên dụng mỗi sáng sẽ mang lại hơi thở thơm mát tự tin suốt ngày dài.</p>\n\n    <h2>4. Khám răng và cạo vôi định kỳ</h2>\n    <p>Vôi răng sau khi đã khoáng hóa sẽ cứng chắc và không thể tự làm sạch bằng bàn chải thông thường. Thăm khám định kỳ mỗi 6 tháng một lần là cách tiết kiệm và tốt nhất để bảo tồn hàm răng thật trọn đời.</p>\n</div>'),(3,3,'<div class=\"article-content\">\n    <p>Ở độ tuổi dậy thì, sự biến động nội tiết tố kích thích tuyến bã nhờn hoạt động quá mức, kết hợp cùng tế bào sừng già cỗi bít tắc lỗ chân lông tạo điều kiện cho vi khuẩn C.acnes sinh sôi và hình thành mụn viêm.</p>\n\n    <h2>1. Các bước chăm sóc da cơ bản mỗi ngày</h2>\n    <ul>\n        <li><strong>Làm sạch da:</strong> Dùng nước tẩy trang dịu nhẹ và sữa rửa mặt có độ pH chuẩn 5.5. Tránh dùng các loại xà phòng hoặc sữa rửa mặt tạo bọt quá nhiều gây khô căng da.</li>\n        <li><strong>Dưỡng ẩm cân bằng:</strong> Chọn kem dưỡng ẩm dạng gel mỏng nhẹ, không chứa dầu (oil-free) và chứa thành phần làm dịu da như Niacinamide, B5, chiết xuất rau má.</li>\n        <li><strong>Chấm mụn đặc trị:</strong> Sử dụng các hoạt chất được bác sĩ khuyên dùng như Salicylic Acid (BHA 1-2%), Benzoyl Peroxide (2.5 - 5%) hoặc Adapalene bôi mỏng lên nốt mụn.</li>\n        <li><strong>Kem chống nắng:</strong> Dùng kem chống nắng phổ rộng SPF 30+ dành riêng cho da dầu mụn để ngăn ngừa vết thâm sẫm màu sau mụn.</li>\n    </ul>\n\n    <h2>2. Những sai lầm tai hại cần tuyệt đối tránh</h2>\n    <ul>\n        <li>Dùng tay sờ nắn hoặc tự ý cạy nặn mụn tại nhà gây nhiễm trùng lan rộng và để lại sẹo rỗ vĩnh viễn.</li>\n        <li>Tin theo các phương pháp truyền miệng như bôi kem đánh răng, rượu thuốc hoặc kem trộn không rõ nguồn gốc.</li>\n        <li>Thức quá khuya và ăn nhiều đồ ngọt, đồ cay nóng, sữa đặc có đường.</li>\n    </ul>\n</div>'),(4,4,'<div class=\"article-content\">\n    <p>Khi thời tiết giao mùa hoặc tiếp xúc với phấn hoa, bụi bẩn, triệu chứng hắt hơi nghẹt mũi xuất hiện khiến nhiều người nhầm lẫn giữa viêm mũi dị ứng và viêm xoang, dẫn đến việc lạm dụng kháng sinh sai mục đích.</p>\n\n    <h2>1. Bảng so sánh triệu chứng điển hình</h2>\n    <ul>\n        <li><strong>Cơn hắt hơi:</strong> Viêm mũi dị ứng thường xuất hiện thành từng tràng liên tục kèm ngứa mắt, ngứa mũi; Viêm xoang ít hắt hơi rầm rộ hơn, chủ yếu là cảm giác nghẹt mũi và nặng trán.</li>\n        <li><strong>Đặc điểm dịch mũi:</strong> Viêm mũi dị ứng có dịch mũi trong suốt, loãng và không có mùi; Viêm xoang tiết dịch nhầy đặc quánh, màu vàng chanh hoặc xanh lá, có thể kèm mùi tanh hôi.</li>\n        <li><strong>Vị trí đau nhức:</strong> Viêm xoang gây đau nhức khu trú rõ ở vùng xoang trán, hốc mắt, gò má hoặc đỉnh đầu sau gáy; Viêm mũi dị ứng thường không gây đau nhức xoang mặt dữ dội.</li>\n    </ul>\n\n    <h2>2. Hướng xử trí và phòng ngừa</h2>\n    <p>Đối với viêm mũi dị ứng, việc cốt lõi là hạn chế tiếp xúc dị nguyên, rửa mũi bằng nước muối sinh lý ấm và dùng thuốc kháng histamin theo chỉ dẫn. Đối với viêm xoang, người bệnh cần đến chuyên khoa Tai Mũi Họng để nội soi và điều trị triệt để ổ viêm, tránh biến chứng viêm phế quản hay viêm tai giữa.</p>\n</div>'),(5,5,'<div class=\"article-content\">\n    <p>Thoái hóa khớp gối là hiện tượng sụn khớp bị bào mòn và dịch bôi trơn khớp giảm sút theo thời gian. Đáng báo động là ngày càng nhiều người ở độ tuổi 25 - 35 đã bắt đầu xuất hiện triệu chứng thoái hóa khớp gối sớm.</p>\n\n    <h2>1. Vì sao người trẻ lại sớm bị thoái hóa khớp gối?</h2>\n    <ul>\n        <li><strong>Ngồi một chỗ quá lâu:</strong> Ngồi làm việc văn phòng từ 8-10 tiếng mỗi ngày khiến sụn khớp ít được vận động, giảm hấp thụ chất dinh dưỡng từ dịch bao hoạt dịch.</li>\n        <li><strong>Tăng cân quá nhanh:</strong> Trọng lượng cơ thể quá mức tạo áp lực tì đè liên tục lên 2 mâm chày khớp gối, thúc đẩy quá trình mài mòn sụn nhanh hơn.</li>\n        <li><strong>Tập luyện thể thao quá tải hoặc sai kỹ thuật:</strong> Chạy bộ với giày không phù hợp, squat sai tư thế hoặc mang vác tạ quá nặng làm rách sụn chêm và tổn thương sụn khớp.</li>\n        <li><strong>Thói quen đi giày cao gót kéo dài:</strong> Làm thay đổi trục giải phẫu chịu lực của chân, dồn áp lực bất thường lên khớp bánh chè - đùi.</li>\n    </ul>\n\n    <h2>2. Cách bảo vệ khớp gối mỗi ngày</h2>\n    <p>Tập luyện các bài tập tăng cường cơ đùi trước (cơ tứ đầu đùi) như bơi lội, đạp xe nhẹ nhàng, duy trì chỉ số BMI khỏe mạnh và bổ sung thực phẩm giàu canxi, vitamin D3, collagen type II và omega-3 sẽ giúp bảo vệ sụn khớp dài lâu.</p>\n</div>'),(6,6,'<h2>1. Tầm quan trọng của việc làm sạch da</h2><p>Vào mùa hè, bã nhờn tiết ra nhiều hơn kết hợp cùng bụi bẩn dễ gây bít tắc lỗ chân lông...</p><h2>2. Chọn kem chống nắng phù hợp</h2><p>Nên chọn kem chống nắng dạng gel hoặc sữa có ghi chú non-comedogenic.</p>'),(7,7,'<p>Nội dung bài viết mới...</p>'),(9,9,'<h2>1. Tầm quan trọng của việc làm sạch da</h2><p>Vào mùa hè, bã nhờn tiết ra nhiều hơn kết hợp cùng bụi bẩn dễ gây bít tắc lỗ chân lông...</p><h2>2. Chọn kem chống nắng phù hợp</h2><p>Nên chọn kem chống nắng dạng gel hoặc sữa có ghi chú non-comedogenic.</p>'),(10,10,'<p>Phòng khám vẫn duy trì đội ngũ bác sĩ trực cấp cứu 24/7 trong suốt kỳ nghỉ lễ.</p>'),(11,11,'<p>Bệnh tim mạch là nguyên nhân gây tử vong hàng đầu...</p>');
/*!40000 ALTER TABLE `article_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `author_id` int NOT NULL,
  `specialty_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `views` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_key` (`slug`),
  KEY `articles_author_id_fkey` (`author_id`),
  KEY `articles_specialty_id_fkey` (`specialty_id`),
  CONSTRAINT `articles_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `articles_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,1,1,'Những mốc khám thai định kỳ quan trọng mẹ bầu không được bỏ qua','nhung-moc-kham-thai-dinh-ky-quan-trong','https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80','Theo dõi thai kỳ qua từng giai đoạn giúp phát hiện sớm dị tật bẩm sinh, sàng lọc bệnh lý nguy hiểm và đảm bảo mẹ tròn con vuông.',345,'2026-09-07 06:39:56.119',NULL),(2,3,2,'Hướng dẫn chăm sóc răng miệng đúng cách để ngừa sâu răng và viêm nướu','huong-dan-cham-soc-rang-mieng-dung-cach','https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80','Chăm sóc răng miệng không đúng cách là nguyên nhân hàng đầu gây hôi miệng, viêm nha chu và mất răng sớm. Tìm hiểu hướng dẫn chi tiết từ nha sĩ.',218,'2026-09-07 06:39:56.125',NULL),(3,5,3,'Quy trình chăm sóc da mụn tuổi dậy thì hiệu quả và an toàn từ chuyên gia','quy-trinh-cham-soc-da-mun-tuoi-day-thi','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80','Mụn dậy thì khiến nhiều bạn trẻ tự ti. Tìm hiểu quy trình skincare khoa học, đơn giản giúp kiềm dầu, giảm mụn mà không lo để lại thâm sẹo.',540,'2026-09-07 06:39:56.129',NULL),(4,7,4,'Phân biệt viêm mũi dị ứng và viêm xoang: Nhận biết sớm để điều trị đúng cách','phan-biet-viem-mui-di-ung-va-viem-xoang','https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80','Viêm mũi dị ứng và viêm xoang có nhiều biểu hiện tương đồng nhưng nguyên nhân và cách điều trị hoàn toàn khác nhau. Đừng để chữa nhầm khiến bệnh tăng nặng.',425,'2026-09-07 06:39:56.133',NULL),(5,1,1,'Thoái hóa khớp gối ở người trẻ: Nguyên nhân và cách phòng ngừa hiệu quả','thoai-hoa-khop-goi-o-nguoi-tre-nguyen-nhan-va-phong-ngua','https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80','Thoái hóa khớp gối không còn là bệnh của riêng người già. Căn bệnh này đang có xu hướng trẻ hóa rõ rệt ở đối tượng nhân viên văn phòng và người thừa cân.',315,'2026-09-07 06:39:56.136',NULL),(6,3,2,'Chăm sóc da dầu mụn đúng cách vào mùa hè','cham-soc-da-dau-mun-dung-cach-vao-mua-he','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d','Hướng dẫn chi tiết quy trình làm sạch, kiềm dầu và chống nắng cho da mụn.',0,'2026-09-10 13:16:19.713',NULL),(7,3,2,'Tiêu đề bài viết mới','tieu-de-bai-viet-moi','https://example.com/new-image.jpg','Mô tả ngắn cập nhật',0,'2026-09-10 13:16:37.144',NULL),(9,3,2,'Chăm sóc da dầu mụn đúng cách vào mùa đông','cham-soc-da-dau-mun-dung-cach-vao-mua-dong','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d','Hướng dẫn chi tiết quy trình làm sạch, kiềm dầu và chống nắng cho da mụn.',0,'2026-09-10 13:23:46.775','2026-09-10 13:29:44.234'),(10,1,NULL,'Thông báo lịch nghỉ lễ và trực cấp cứu tại phòng khám','thong-bao-lich-nghi-le-va-truc-cap-cuu-tai-phong-kham',NULL,NULL,0,'2026-09-10 13:36:11.812',NULL),(11,1,1,'Cẩm nang chăm sóc sức khỏe tim mạch','cam-nang-cham-soc-suc-khoe-tim-mach','https://images.unsplash.com/photo-1505751172876-fa1923c5c528','Lời khuyên từ các chuyên gia tim mạch hàng đầu.',0,'2026-09-10 13:38:43.853',NULL);
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (4,'Ưu đãi gói khám sức khỏe tổng quát MỚI NHẤT','https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d','/packages/tong-quat-vip',1,1),(5,'Đội ngũ chuyên gia bác sĩ hàng đầu tại phòng khám','https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80','/doctors',2,1),(6,'Tầm soát ung thư sớm - Bảo vệ sức khỏe gia đình bạn','https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80','/packages',3,1),(7,'Chương trình khám sức khỏe hậu Tết','https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d','/packages/suc-khoe-tong-quat',4,1),(8,'Ưu đãi gói khám sức khỏe tổng quát nè','https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d','/packages/tong-quat-vip',5,0);
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_details`
--

DROP TABLE IF EXISTS `cart_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `package_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_details_cart_id_fkey` (`cart_id`),
  KEY `cart_details_package_id_fkey` (`package_id`),
  CONSTRAINT `cart_details_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `cart_details_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_details`
--

LOCK TABLES `cart_details` WRITE;
/*!40000 ALTER TABLE `cart_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sum` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_user_id_key` (`user_id`),
  CONSTRAINT `carts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `specialty_id` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctors_user_id_key` (`user_id`),
  KEY `doctors_specialty_id_fkey` (`specialty_id`),
  CONSTRAINT `doctors_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `doctors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,4,1,'Bác sĩ chuyên khoa Sản-Phụ khoa',150000.00,'2026-09-07 10:21:29.071'),(2,5,1,'Bác sĩ chuyên khoa Sản-Phụ khoa',150000.00,NULL),(3,6,2,'Bác sĩ chuyên khoa Răng Hàm Mặt',150000.00,NULL),(4,7,2,'Bác sĩ chuyên khoa Răng Hàm Mặt',150000.00,NULL),(5,8,3,'Bác sĩ chuyên khoa Da Liễu',150000.00,NULL),(6,9,3,'Bác sĩ chuyên khoa Da Liễu',150000.00,NULL),(7,10,4,'Bác sĩ chuyên khoa Tai Mũi Họng',150000.00,NULL),(8,11,4,'Bác sĩ chuyên khoa Tai Mũi Họng',150000.00,NULL),(9,18,1,'Bác sĩ chuyên khoa Sản-Phụ khoa',150000.00,NULL),(10,19,1,'Bác sĩ chuyên khoa Sản-Phụ khoa',3600000.00,NULL),(11,20,1,'Bác sĩ chuyên khoa Sản-Phụ khoa',300000.00,NULL);
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_record_attachments`
--

DROP TABLE IF EXISTS `medical_record_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_record_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medical_record_id` int NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `medical_record_attachments_medical_record_id_fkey` (`medical_record_id`),
  CONSTRAINT `medical_record_attachments_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_record_attachments`
--

LOCK TABLES `medical_record_attachments` WRITE;
/*!40000 ALTER TABLE `medical_record_attachments` DISABLE KEYS */;
INSERT INTO `medical_record_attachments` VALUES (7,4,'https://res.cloudinary.com/a7ebosnc/image/upload/v1726668291/clinic_booking/images/xet-nghiem-mau.jpg','xet-nghiem-mau.jpg','Chỉ giữ lại file xét nghiệm máu chuẩn','2026-09-18 15:39:51.406');
/*!40000 ALTER TABLE `medical_record_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `record_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symptoms` text COLLATE utf8mb4_unicode_ci,
  `clinical_examination` text COLLATE utf8mb4_unicode_ci,
  `diagnosis` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icd10_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icd10_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blood_pressure` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pulse` int DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `doctor_advice` text COLLATE utf8mb4_unicode_ci,
  `re_examination_date` date DEFAULT NULL,
  `consultation_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OFFLINE',
  `recommendation` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `signed_at` datetime(3) DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  PRIMARY KEY (`id`),
  UNIQUE KEY `medical_records_appointment_id_key` (`appointment_id`),
  UNIQUE KEY `medical_records_record_code_key` (`record_code`),
  CONSTRAINT `medical_records_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
INSERT INTO `medical_records` VALUES (1,6,'BA20260918-001','Sốt nhẹ 37.8 độ, hắt hơi, sổ mũi trong 2 ngày','Họng hơi đỏ nhẹ, không có giả mạc, phổi trong không ran','Cảm cúm thông thường',NULL,NULL,'120/80',82,37.8,65.50,170.00,'Uống nhiều nước ấm, nghỉ ngơi, giữ ấm cơ thể, ăn thức ăn lỏng dễ tiêu','2026-09-25','OFFLINE','Tự theo dõi tại nhà, nếu sốt cao > 39 độ thì tái khám ngay','2026-09-18 15:17:31.751','2026-09-18 15:17:31.751',NULL,'SIGNED'),(2,7,'BA20260918-002','Sốt nhẹ 37.8 độ, hắt hơi, sổ mũi trong 2 ngày','Họng hơi đỏ nhẹ, không có giả mạc, phổi trong không ran','Cảm cúm đặc biệt',NULL,NULL,'120/80',82,37.8,65.50,170.00,'Uống nhiều nước ấm, nghỉ ngơi, giữ ấm cơ thể, ăn thức ăn lỏng dễ tiêu','2026-09-25','OFFLINE','Tự theo dõi tại nhà, nếu sốt cao > 39 độ thì tái khám ngay','2026-09-18 15:18:38.375','2026-09-18 15:18:38.375',NULL,'DRAFT'),(3,8,'BA20260918-003','Sốt nhẹ 37.8 độ, hắt hơi, sổ mũi trong 2 ngày','Kết quả nội soi tai mũi họng: Niêm mạc họng đỏ rực, amidan sưng to độ 2','Viêm họng cấp tính do vi khuẩn','J02.9','Viêm họng cấp, không đặc hiệu','120/80',82,38.5,65.50,170.00,'Uống thuốc đúng giờ, súc họng bằng nước muối sinh lý 3 lần/ngày, kiêng đồ lạnh','2026-09-26','OFFLINE','Tự theo dõi tại nhà, nếu sốt cao > 39 độ thì tái khám ngay','2026-09-18 15:18:53.736','2026-09-18 15:26:29.324',NULL,'DRAFT'),(4,9,'BA20260918-004','Ho nhiều, ho có đờm vàng đục, tức ngực khi thở sâu','Kết quả nội soi tai mũi họng: Niêm mạc họng đỏ rực, amidan sưng to độ 2','Viêm phế quản cấp','J20','Viêm phế quản cấp tính','125/85',88,38.2,58.00,162.00,'Hạn chế đồ uống lạnh, đeo khẩu trang khi ra ngoài','2026-09-28','OFFLINE',NULL,'2026-09-18 15:23:02.438','2026-09-18 15:43:45.465','2026-09-18 15:43:45.463','SIGNED');
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `package_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_details_order_id_fkey` (`order_id`),
  KEY `order_details_package_id_fkey` (`package_id`),
  CONSTRAINT `order_details_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `order_details_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (1,1,1,2,990000.00),(2,1,2,1,3200000.00),(3,2,2,1,3200000.00),(4,3,2,2,3200000.00),(5,4,2,3,3200000.00),(6,5,2,1,3200000.00),(7,6,2,1,3200000.00),(8,7,2,3,3200000.00);
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNPAID',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_code_key` (`order_code`),
  KEY `orders_user_id_fkey` (`user_id`),
  CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,'ORD1789407764000118',5180000.00,'VNPAY','PAID','2026-09-14 17:42:44.004',NULL),(2,2,'ORD1789471869976776',3200000.00,'VNPAY','PAID','2026-09-15 11:31:09.978',NULL),(3,2,'ORD1789473405239126',6400000.00,'VNPAY','FAILED','2026-09-15 11:56:45.241','2026-09-15 11:58:52.918'),(4,2,'ORD1789473713490722',9600000.00,'VNPAY','PAID','2026-09-15 12:01:53.493',NULL),(5,2,'ORD1789476137894906',3200000.00,'VNPAY','FAILED','2026-09-15 12:42:17.896','2026-09-15 13:10:14.953'),(6,2,'ORD1789476164121633',3200000.00,'VNPAY','FAILED','2026-09-15 12:42:44.123','2026-09-15 13:10:14.953'),(7,2,'ORD1789555833955399',9600000.00,'VNPAY','PAID','2026-09-16 11:22:52.974',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_details`
--

DROP TABLE IF EXISTS `package_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_id` int NOT NULL,
  `html_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `package_details_package_id_key` (`package_id`),
  CONSTRAINT `package_details_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_details`
--

LOCK TABLES `package_details` WRITE;
/*!40000 ALTER TABLE `package_details` DISABLE KEYS */;
INSERT INTO `package_details` VALUES (1,1,'<div class=\"package-detail\">\n    <h2>Giới thiệu gói khám sức khỏe tổng quát cơ bản</h2>\n    <p>Gói khám sức khỏe tổng quát cơ bản được thiết kế phù hợp cho mọi lứa tuổi từ 18 tuổi trở lên, giúp đánh giá chức năng các cơ quan quan trọng trong cơ thể và phát hiện sớm các nguy cơ tiềm ẩn.</p>\n    \n    <h3>1. Khám lâm sàng</h3>\n    <ul>\n        <li>Đo mạch, huyết áp, chiều cao, cân nặng, tính chỉ số khối cơ thể (BMI).</li>\n        <li>Khám nội tổng quát: Đánh giá hệ hô hấp, tuần hoàn, tiêu hóa, tiết niệu.</li>\n    </ul>\n\n    <h3>2. Xét nghiệm huyết học & sinh hóa</h3>\n    <ul>\n        <li><strong>Tổng phân tích tế bào máu ngoại vi (18 thông số):</strong> Đánh giá tình trạng thiếu máu, nhiễm trùng và các bệnh lý về máu.</li>\n        <li><strong>Đo đường huyết (Glucose đói):</strong> Tầm soát bệnh đái tháo đường.</li>\n        <li><strong>Đánh giá chức năng gan (AST, ALT):</strong> Phát hiện tổn thương nhu mô gan do viêm gan, bia rượu hoặc dùng thuốc.</li>\n        <li><strong>Đánh giá chức năng thận (Ure, Creatinine):</strong> Đánh giá khả năng lọc và đào thải của thận.</li>\n        <li><strong>Bộ mỡ máu cơ bản (Cholesterol toàn phần, Triglyceride):</strong> Tầm soát rối loạn chuyển hóa lipid, nguy cơ xơ vữa động mạch.</li>\n    </ul>\n\n    <h3>3. Xét nghiệm nước tiểu</h3>\n    <ul>\n        <li><strong>Tổng phân tích nước tiểu (10 thông số):</strong> Phát hiện các bệnh lý viêm nhiễm đường tiết niệu, bệnh cầu thận.</li>\n    </ul>\n\n    <h3>4. Chẩn đoán hình ảnh</h3>\n    <ul>\n        <li><strong>Chụp X-quang tim phổi thẳng kỹ thuật số:</strong> Phát hiện các tổn thương ở phổi, màng phổi, bóng tim.</li>\n        <li><strong>Siêu âm ổ bụng tổng quát:</strong> Khảo sát hình ảnh gan, túi mật, tụy, lách, thận và bàng quang.</li>\n    </ul>\n\n    <h3>5. Lưu ý trước khi đi khám</h3>\n    <ul>\n        <li>Nhịn ăn tối thiểu 6 - 8 tiếng trước khi lấy máu (chỉ được uống nước lọc).</li>\n        <li>Không sử dụng đồ uống có cồn, chất kích thích trong vòng 24 giờ trước khi khám.</li>\n        <li>Uống nhiều nước và nhịn tiểu để siêu âm ổ bụng cho kết quả rõ ràng nhất.</li>\n    </ul>\n</div>'),(2,2,'<div class=\"package-detail\">\n    <h2>Gói khám sức khỏe tổng quát chuyên sâu (VIP)</h2>\n    <p>Dành cho khách hàng muốn kiểm tra toàn diện chuyên sâu, tầm soát sớm đột quỵ, bệnh lý tim mạch và phát hiện sớm các mầm mống ung thư phổ biến.</p>\n\n    <h3>1. Khám chuyên khoa toàn diện</h3>\n    <ul>\n        <li>Khám nội tổng quát, tai mũi họng, răng hàm mặt, mắt.</li>\n        <li>Khám chuyên khoa tim mạch, đo điện tim thường (ECG).</li>\n        <li>Khám chuyên khoa sản phụ khoa (đối với nữ): Khám phụ khoa, soi tươi dịch âm đạo, tầm soát tế bào cổ tử cung.</li>\n    </ul>\n\n    <h3>2. Xét nghiệm chuyên sâu</h3>\n    <ul>\n        <li>Bộ mỡ máu toàn diện: Cholesterol toàn phần, Triglyceride, HDL-Cholesterol, LDL-Cholesterol.</li>\n        <li>Đánh giá chức năng tuyến giáp: TSH, FT4.</li>\n        <li>Định lượng Axit Uric: Tầm soát bệnh Gout.</li>\n        <li>Sàng lọc viêm gan virus B, C: HBsAg, Anti-HCV.</li>\n        <li><strong>Marker tầm soát ung thư sớm:</strong> Gan (AFP), Tiêu hóa (CEA), Phổi (Cyfra 21-1), Tiền liệt tuyến (PSA ở nam) / Tuyến vú & Buồng trứng (CA 15-3, CA 125 ở nữ).</li>\n    </ul>\n\n    <h3>3. Chẩn đoán hình ảnh kỹ thuật cao</h3>\n    <ul>\n        <li>Siêu âm Doppler màu tim: Đánh giá chức năng van tim và cơ tim.</li>\n        <li>Siêu âm Doppler động mạch cảnh: Tầm soát xơ vữa động mạch và nguy cơ tai biến mạch máu não.</li>\n        <li>Siêu âm tuyến giáp, siêu âm ổ bụng toàn diện.</li>\n        <li>Chụp X-quang tim phổi kỹ thuật số liều thấp.</li>\n    </ul>\n\n    <h3>4. Đặc quyền VIP</h3>\n    <ul>\n        <li>Bác sĩ chuyên khoa I, chuyên khoa II tư vấn và lập hồ sơ theo dõi sức khỏe dài hạn.</li>\n        <li>Ưu tiên lấy mẫu xét nghiệm không phải chờ đợi lâu.</li>\n        <li>Suất ăn nhẹ dinh dưỡng sau khi lấy máu xét nghiệm.</li>\n    </ul>\n</div>'),(3,3,'<div class=\"package-detail\">\n    <h2>Gói tầm soát ung thư toàn diện</h2>\n    <p>Phát hiện ung thư ở giai đoạn sớm giúp nâng cao hiệu quả điều trị thành công lên đến trên 90%. Gói khám được thiết kế bởi hội đồng bác sĩ chuyên khoa ung bướu hàng đầu.</p>\n\n    <h3>1. Bộ xét nghiệm dấu ấn ung thư sinh học (Tumor Markers)</h3>\n    <ul>\n        <li><strong>AFP:</strong> Tầm soát ung thư tế bào gan nguyên phát.</li>\n        <li><strong>CEA:</strong> Tầm soát ung thư đường tiêu hóa (dạ dày, đại tràng, trực tràng).</li>\n        <li><strong>Cyfra 21-1:</strong> Tầm soát ung thư phổi không tế bào nhỏ.</li>\n        <li><strong>CA 19-9:</strong> Tầm soát ung thư tụy và đường mật.</li>\n        <li><strong>CA 125 & CA 15-3 (Dành cho nữ):</strong> Tầm soát ung thư buồng trứng và ung thư tuyến vú.</li>\n        <li><strong>PSA toàn phần (Dành cho nam):</strong> Tầm soát ung thư tuyến tiền liệt.</li>\n    </ul>\n\n    <h3>2. Thăm dò chức năng & Chẩn đoán hình ảnh</h3>\n    <ul>\n        <li>Siêu âm tuyến giáp độ phân giải cao phát hiện nhân tuyến giáp.</li>\n        <li>Siêu âm tuyến vú 2 bên (dành cho nữ) tầm soát u nang, khối u vú.</li>\n        <li>Chụp X-quang ngực thẳng kỹ thuật số.</li>\n        <li>Siêu âm ổ bụng toàn diện khảo sát gan, thận, lách, tụy, bàng quang.</li>\n    </ul>\n\n    <h3>3. Tư vấn chuyên gia ung bướu</h3>\n    <ul>\n        <li>Đọc kết quả và giải thích cặn kẽ ý nghĩa từng chỉ số xét nghiệm.</li>\n        <li>Tư vấn phác đồ theo dõi định kỳ hoặc chuyển tiếp can thiệp kịp thời nếu phát hiện bất thường.</li>\n    </ul>\n</div>'),(4,4,'<div class=\"package-detail\">\n    <h2>Gói khám sức khỏe tiền hôn nhân cho cặp đôi</h2>\n    <p>Giúp các bạn trẻ chuẩn bị nền tảng thể chất và tinh thần tốt nhất cho kế hoạch xây dựng gia đình và sinh con khỏe mạnh, an toàn.</p>\n\n    <h3>1. Khám lâm sàng</h3>\n    <ul>\n        <li>Khám tổng quát: Đo huyết áp, chiều cao, cân nặng, khám tim phổi.</li>\n        <li>Khám chuyên khoa Sản phụ khoa (nữ) / Nam học (nam).</li>\n    </ul>\n\n    <h3>2. Xét nghiệm sàng lọc bệnh truyền nhiễm & di truyền</h3>\n    <ul>\n        <li>Định nhóm máu ABO và hệ Rh (phòng ngừa bất đồng nhóm máu mẹ con khi mang thai).</li>\n        <li>Tổng phân tích tế bào máu ngoại vi: Sàng lọc bệnh tan máu bẩm sinh Thalassemia.</li>\n        <li>Sàng lọc bệnh lây truyền qua đường tình dục: HIV, Viêm gan B (HBsAg), Viêm gan C (Anti-HCV), Giang mai (Syphilis TP).</li>\n        <li>Xét nghiệm kháng thể Rubella IgG & IgM (dành cho nữ) để tư vấn tiêm phòng trước mang thai.</li>\n    </ul>\n\n    <h3>3. Đánh giá sức khỏe sinh sản</h3>\n    <ul>\n        <li><strong>Đối với nam:</strong> Xét nghiệm tinh dịch đồ (đánh giá số lượng, độ di động và hình thái tinh trùng).</li>\n        <li><strong>Đối với nữ:</strong> Siêu âm tử cung - buồng trứng qua đường bụng hoặc đầu dò; Soi tươi dịch âm đạo.</li>\n    </ul>\n\n    <h3>4. Tư vấn tiền sản</h3>\n    <ul>\n        <li>Tư vấn chế độ dinh dưỡng, lối sống lành mạnh.</li>\n        <li>Lên lịch tiêm chủng vắc-xin cần thiết trước mang thai: Sởi - Quai bị - Rubella, Thủy đậu, Cúm, HPV.</li>\n    </ul>\n</div>'),(5,5,'<div class=\"package-detail\">\n    <h2>Gói chăm sóc răng miệng toàn diện</h2>\n    <p>Bảo vệ nụ cười rạng rỡ và hàm răng chắc khỏe với quy trình chăm sóc răng miệng chuẩn vô trùng y khoa.</p>\n\n    <h3>1. Quy trình thực hiện tiêu chuẩn</h3>\n    <ul>\n        <li><strong>Bước 1:</strong> Thăm khám tổng quát mô mềm khoang miệng, tình trạng răng và nướu.</li>\n        <li><strong>Bước 2:</strong> Chụp phim X-quang răng kỹ thuật số để phát hiện sâu răng kẽ, răng khôn mọc lệch, tiêu xương nha chu.</li>\n        <li><strong>Bước 3:</strong> Lấy cao răng bằng công nghệ sóng siêu âm rung tần số cao, hạn chế tối đa ê buốt và không tổn thương nướu.</li>\n        <li><strong>Bước 4:</strong> Làm sạch mảng bám vi khuẩn cứng đầu và các vết ố vàng do thực phẩm, cà phê, thuốc lá.</li>\n        <li><strong>Bước 5:</strong> Đánh bóng toàn bộ bề mặt thân răng bằng paste chứa Fluoride giúp men răng sáng bóng và giảm bám mảng thức ăn mới.</li>\n        <li><strong>Bước 6:</strong> Bác sĩ chuyên khoa hướng dẫn vệ sinh răng miệng đúng cách: cách dùng chỉ nha khoa, bàn chải kẽ, máy tăm nước.</li>\n    </ul>\n\n    <h3>2. Đối tượng nên thực hiện định kỳ</h3>\n    <p>Mọi lứa tuổi nên thực hiện định kỳ 6 tháng một lần để ngăn ngừa viêm lợi, tụt nướu và mất răng sớm.</p>\n</div>'),(6,6,'<div class=\"package-detail\">\n    <h2>Gói tầm soát và phục hồi sức khỏe Da liễu</h2>\n    <p>Hiểu sâu về làn da ở tầng vi điểm, phát hiện sớm các tổn thương do tia UV, mỹ phẩm chứa corticoid và các bệnh lý da liễu mạn tính.</p>\n\n    <h3>1. Các bước thăm khám & phân tích</h3>\n    <ul>\n        <li><strong>Khám trực tiếp 1-1 với bác sĩ da liễu:</strong> Đánh giá tổng quan loại da, mức độ nhạy cảm và các vấn đề đang gặp phải.</li>\n        <li><strong>Soi da đa tầng bằng máy soi da 3D công nghệ cao:</strong> Phân tích 8 chỉ số quan trọng gồm đốm sắc tố bề mặt, đốm nâu tầng sâu, lỗ chân lông, nếp nhăn, mật độ vi khuẩn P.acnes, độ đàn hồi collagen, tuần hoàn mao mạch máu và độ ẩm biểu bì.</li>\n        <li><strong>Chẩn đoán bệnh lý da liễu:</strong> Mụn trứng cá các cấp độ, viêm da tiết bã, viêm da cơ địa, nám melasma, tàn nhang, sẹo thâm.</li>\n    </ul>\n\n    <h3>2. Xây dựng phác đồ điều trị cá nhân hóa</h3>\n    <ul>\n        <li>Lập kế hoạch điều trị theo từng giai đoạn, kê đơn thuốc uống/thuốc bôi chuẩn Bộ Y tế.</li>\n        <li>Tư vấn lựa chọn dược mỹ phẩm phù hợp với cơ địa làn da.</li>\n        <li>Hướng dẫn quy trình chăm sóc tại nhà để tối ưu hóa hiệu quả phục hồi.</li>\n    </ul>\n</div>'),(7,7,'<div class=\"package-detail\"><h3>Danh mục dịch vụ khám chi tiết</h3><ul><li><strong>1. Khám lâm sàng:</strong> Đo chỉ số sinh tồn, khám chuyên khoa Nội tim mạch cùng bác sĩ CKI/CKII</li><li><strong>2. Chẩn đoán hình ảnh:</strong> Điện tâm đồ (ECG), Siêu âm tim Doppler màu 4D khảo sát chức năng van tim</li><li><strong>3. Xét nghiệm sinh hóa:</strong> Bộ mỡ máu toàn phần (Cholesterol, Triglyceride, HDL-C, LDL-C), đường huyết đói, men tim CK-MB</li></ul><p><em>* Lưu ý: Khách hàng cần nhịn ăn tối thiểu 6-8 tiếng trước khi lấy máu xét nghiệm.</em></p></div>');
/*!40000 ALTER TABLE `package_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `thumbnail_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `discount_price` decimal(12,2) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'Gói khám sức khỏe tổng quát cơ bản','Đánh giá tình trạng sức khỏe tổng thể, phát hiện sớm các bệnh lý chuyển hóa, chức năng gan, thận và huyết áp.','https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',1200000.00,990000.00,NULL),(2,'Gói khám sức khỏe tổng quát chuyên sâu (VIP)','Tầm soát toàn diện chức năng các cơ quan nội tạng, tim mạch, tầm soát ung thư sớm và sàng lọc rối loạn chuyển hóa.','https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',3800000.00,3200000.00,NULL),(3,'Gói tầm soát ung thư toàn diện','Sàng lọc và phát hiện sớm các loại ung thư phổ biến hàng đầu: gan, phổi, dạ dày, đại trực tràng, vú và phụ khoa.','https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',4500000.00,3900000.00,NULL),(4,'Gói khám sức khỏe tiền hôn nhân','Kiểm tra sức khỏe sinh sản, sàng lọc bệnh truyền nhiễm và bệnh lý di truyền trước khi bước vào cuộc sống hôn nhân.','https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',2600000.00,2200000.00,NULL),(5,'Gói chăm sóc răng miệng toàn diện','Thăm khám tổng quát khoang miệng, lấy cao răng siêu âm êm ái, đánh bóng men răng và chụp X-quang nha khoa.','https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',550000.00,390000.00,NULL),(6,'Gói tầm soát và phục hồi sức khỏe Da liễu','Soi da vi điểm 3D phân tích đa tầng, chẩn đoán nguyên nhân mụn, nám, lão hóa và xây dựng phác đồ cá nhân hóa.','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',850000.00,650000.00,NULL),(7,'Gói khám sàng lọc Tim Mạch Toàn Diện','Tầm soát chuyên sâu bệnh lý mạch vành, rối loạn nhịp tim, xơ vữa động mạch và nguy cơ đột quỵ sớm.','https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',2800000.00,NULL,'2026-09-08 13:15:55.776');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medical_record_id` int NOT NULL,
  `medicine_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructions` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prescription_items_medical_record_id_fkey` (`medical_record_id`),
  CONSTRAINT `prescription_items_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES (4,1,'Paracetamol 500mg','Sáng 1 viên khi sốt',6,'viên','Chỉ uống khi đau hoặc sốt cao');
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Quản trị viên'),(2,'USER','Người dùng'),(3,'DOCTOR','Bác sĩ');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `date` date NOT NULL,
  `time_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_number` int NOT NULL DEFAULT '10',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  PRIMARY KEY (`id`),
  KEY `schedules_doctor_id_fkey` (`doctor_id`),
  CONSTRAINT `schedules_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (1,11,'2026-09-20','T1',10,'AVAILABLE'),(2,11,'2026-09-20','T2',10,'AVAILABLE'),(3,11,'2026-09-20','T3',10,'AVAILABLE'),(5,11,'2026-09-20','T5',5,'FULL'),(6,11,'2026-09-20','T6',15,'CANCELLED'),(7,2,'2026-09-14','T1',10,'AVAILABLE'),(8,2,'2026-09-14','T2',10,'AVAILABLE'),(9,2,'2026-09-14','T3',10,'AVAILABLE'),(10,2,'2026-09-14','T4',10,'AVAILABLE'),(11,2,'2026-09-14','T5',10,'AVAILABLE'),(12,2,'2026-09-14','T6',10,'AVAILABLE'),(13,2,'2026-09-15','T1',10,'AVAILABLE'),(14,2,'2026-09-15','T2',10,'AVAILABLE'),(15,2,'2026-09-15','T3',10,'AVAILABLE'),(16,2,'2026-09-15','T4',10,'AVAILABLE'),(17,2,'2026-09-15','T5',10,'AVAILABLE'),(18,2,'2026-09-15','T6',10,'AVAILABLE'),(19,2,'2026-09-16','T1',10,'AVAILABLE'),(20,2,'2026-09-16','T2',10,'AVAILABLE'),(21,2,'2026-09-16','T3',10,'AVAILABLE'),(22,2,'2026-09-16','T4',10,'AVAILABLE'),(23,2,'2026-09-16','T5',10,'AVAILABLE'),(24,2,'2026-09-16','T6',10,'AVAILABLE'),(25,2,'2026-09-18','T1',10,'AVAILABLE'),(26,2,'2026-09-18','T2',10,'AVAILABLE'),(27,2,'2026-09-18','T3',10,'AVAILABLE'),(28,2,'2026-09-18','T4',10,'AVAILABLE'),(29,2,'2026-09-18','T5',10,'AVAILABLE'),(30,2,'2026-09-18','T6',10,'AVAILABLE'),(31,2,'2026-09-19','T1',10,'AVAILABLE'),(32,2,'2026-09-19','T2',10,'AVAILABLE'),(33,2,'2026-09-19','T3',10,'AVAILABLE'),(34,2,'2026-09-19','T4',10,'AVAILABLE'),(35,2,'2026-09-19','T5',10,'AVAILABLE'),(36,2,'2026-09-19','T6',10,'AVAILABLE'),(37,2,'2026-09-20','T1',10,'AVAILABLE'),(38,2,'2026-09-20','T2',10,'AVAILABLE'),(39,2,'2026-09-20','T3',10,'AVAILABLE'),(40,2,'2026-09-20','T4',10,'AVAILABLE'),(41,2,'2026-09-20','T5',10,'AVAILABLE'),(42,2,'2026-09-20','T6',10,'AVAILABLE');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialties`
--

DROP TABLE IF EXISTS `specialties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specialties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialties`
--

LOCK TABLES `specialties` WRITE;
/*!40000 ALTER TABLE `specialties` DISABLE KEYS */;
INSERT INTO `specialties` VALUES (1,'Sản-Phụ khoa','Chuyên khoa sản phụ',NULL,NULL),(2,'Răng Hàm Mặt','Chuyên khoa răng hàm mặt',NULL,NULL),(3,'Da Liễu','Chuyên khoa da liễu',NULL,NULL),(4,'Tai Mũi Họng','Chuyên khoa tai mũi họng',NULL,NULL),(5,'Cơ Xương Khớp','Chuyên khoa cơ xương khớp',NULL,'2026-09-08 07:53:32.543'),(7,'Mắt','Khám, tư vấn và điều trị tật khúc xạ (cận, viễn, loạn thị), đục thủy tinh thể, glôcôm và các bệnh lý đáy mắt.','https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',NULL);
/*!40000 ALTER TABLE `specialties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `role_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_role_id_fkey` (`role_id`),
  CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','0987654321','admin@gmail.com','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,'/images/d52a40df-d62e-4c50-b469-b66949847a5e.png',NULL,1),(2,'Test User 001','0868164705','test01@gmail.com','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,'/images/fc3b589a-6aec-42a5-91af-c2b7c3d0cd2c.jpg',NULL,2),(3,'Test User 02',NULL,'test02@gmail.com','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,NULL,NULL,2),(4,'BS. Nguyễn Văn An',NULL,'','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,NULL,'2026-09-07 10:21:29.071',3),(5,'Trần Thị Mai 1',NULL,'bs.mai.tran@phongkham.vn','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,'/images/d52a40df-d62e-4c50-b469-b66949847a5e.png',NULL,3),(6,'BS. Lê Hoàng Nam',NULL,'bs.nam.le@phongkham.vn','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,NULL,NULL,3),(7,'BS. Phạm Thu Hà',NULL,'bs.ha.pham@phongkham.vn','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,NULL,NULL,3),(8,'BS. Vũ Đức Trọng',NULL,'bs.trong.vu@phongkham.vn','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,NULL,NULL,3),(9,'BS. Đỗ Mỹ Linh',NULL,'bs.linh.do@phongkham.vn','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,NULL,NULL,3),(10,'BS. Hoàng Quốc Bảo',NULL,'bs.bao.hoang@phongkham.vn','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,NULL,NULL,3),(11,'BS. Ngô Phương Thảo',NULL,'bs.thao.ngo@phongkham.vn','$2b$10$C24jq2PdZ8WqUYSiqGn8I.8XXXquR2ItFD8lKbSubp.0XTHvZhM3y',NULL,NULL,NULL,NULL,3),(15,'Nguyễn Xuân Thanh',NULL,'test03@gmail.com','$2b$10$tvkZx959H9xMY/hsHPcpruq7zeZKfxsUX.4e6EusbS2pmDADu1N4q',NULL,NULL,NULL,NULL,2),(16,'Nguyễn Xuân Thanh',NULL,'test04@gmail.com','$2b$10$CE5JTPaB/N0xkPyGdLOeSudoY.SHCvvZ82Muv3wgRtCtNEATtYdhC',NULL,NULL,NULL,NULL,3),(17,'Nguyễn Xuân Thanh',NULL,'test05@gmail.com','$2b$10$zSFWVcN2YBCAM40K8q/w.uRXBKxxtHRRtCU9a9RqcBYDbLCwYbgd2',NULL,NULL,NULL,NULL,2),(18,'Nguyễn Xuân Thanh',NULL,'doctor01@gmail.com','$2b$10$YeaTVDWt3ZrNMJkbXg3c1uxRDgPeyaxb739.FfJBfKDS3WDAt6ADC',NULL,NULL,NULL,NULL,3),(19,'Nguyễn Xuân Thanh',NULL,'doctor02@gmail.com','$2b$10$M7b4VwD9YFQ1ltHauqK4JecxeLR/QglqwsEKKstez4.ZHWDOROA3y',NULL,NULL,NULL,NULL,3),(20,'BS. CKII Trần Quốc Huy',NULL,'bs.huytran@phongkham.vn','$2b$10$E4c4z0cToTRTl8tf8J1SVOjm34A8vQF26e86OOgP77BtT/24f.kC.',NULL,NULL,NULL,NULL,3);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 17:39:05 
