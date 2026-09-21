# 🏥 Clinic Booking Platform - Backend

Hệ thống Backend cho nền tảng Đặt lịch khám và Quản lý phòng khám trực tuyến.
Được xây dựng bằng **Node.js, Express, TypeScript, Prisma ORM, MySQL 8.0** và đã được đóng gói hoàn chỉnh bằng **Docker**.

---

## ⚡ Hướng dẫn chạy nhanh cho Đồng nghiệp (Dùng Docker)

> 💡 **LƯU Ý:** Bạn **KHÔNG CẦN** cài đặt Node.js hay MySQL trên máy tính. Chỉ cần có phần mềm **Docker Desktop** là chạy được 100%.

### 📋 Yêu cầu trước khi bắt đầu
* Đã cài đặt và đang bật phần mềm **Docker Desktop** (biểu tượng góc dưới hiện chấm xanh `Engine running`).
* Đã cài Git.

---

### 🚀 BƯỚC 1: Lần đầu tiên tải dự án về máy

1. **Clone dự án về máy:**
   ```bash
   git clone <link-repo-git>
   cd Clinic-Booking-Platform-backend
   ```

2. **Tạo file cấu hình `.env`:**
   Copy từ file mẫu `.env.example` sang `.env`:
   * **Trên Windows (CMD / PowerShell):**
     ```powershell
     copy .env.example .env
     ```
   * **Hoặc bằng lệnh Bash / Mac / Linux:**
     ```bash
     cp .env.example .env
     ```
   *(Bạn có thể giữ nguyên toàn bộ thông số mặc định trong file `.env`)*.

3. **Khởi động toàn bộ hệ thống bằng 1 lệnh duy nhất:**
   ```bash
   docker compose up -d --build
   ```
   *Docker sẽ tự động:*
   - Tải MySQL 8.0 và phpMyAdmin.
   - Đóng gói và biên dịch TypeScript Backend.
   - Tự động tạo toàn bộ bảng trong cơ sở dữ liệu (`prisma db push`).
   - Tự động tạo sẵn dữ liệu mẫu (Tài khoản Admin, Bác sĩ, Dịch vụ, Bài viết...).

---

### 🔄 BƯỚC 2: Khi Backend có cập nhật code mới (Hàng ngày)

Mỗi khi người làm backend thông báo vừa cập nhật tính năng hoặc sửa lỗi, bạn chỉ cần mở Terminal tại dự án và gõ đúng **2 lệnh**:

```bash
# 1. Kéo code mới nhất từ Git về
git pull

# 2. Build lại và khởi động lại Docker
docker compose up -d --build
```
> Hệ thống sẽ tự động cập nhật code mới, cài thêm thư viện mới (nếu có) và tự đồng bộ bảng Database mới mà không làm mất dữ liệu cũ của bạn!

---

## 🌐 Các cổng dịch vụ & Địa chỉ truy cập

| Dịch vụ | Địa chỉ truy cập | Ghi chú |
|---|---|---|
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Cổng gọi API cho Frontend / Postman |
| **Database Cloud (Aiven)** | [console.aiven.io](https://console.aiven.io/) | MySQL Cloud dùng chung cho cả nhóm |

---

## 🗄️ Hướng dẫn kết nối Database Aiven bằng DBeaver (Dùng chung cho cả nhóm)

Cả nhóm kết nối trực tiếp vào database chung trên **Aiven Cloud** bằng **DBeaver** theo các bước sau:

1. Mở **DBeaver** $\rightarrow$ bấm biểu tượng **New Database Connection** 🔌 $\rightarrow$ chọn **MySQL**.
2. Nhập thông tin kết nối:
   * **Host:** `mysqlclinicbooking-clincbooking.e.aivencloud.com`
   * **Port:** `25198`
   * **Database:** `defaultdb`
   * **Username:** `avnadmin`
   * **Password:** *(Xem trong file `.env` hoặc hỏi nhóm trưởng)*
3. **Cấu hình SSL (Bắt buộc đối với Aiven):**
   * **Cách nhanh nhất (khuyên dùng):** 
     - Vào tab **SSL**: Bỏ tích ô *Use SSL*.
     - Chuyển sang tab **Driver properties**:
       - Tìm thuộc tính `sslMode` $\rightarrow$ đổi thành `REQUIRED`.
       - Tìm thuộc tính `allowPublicKeyRetrieval` $\rightarrow$ đổi thành `true`.
   * **Hoặc cách tải file cert:**
     - Vào tab **SSL**, tích chọn *Use SSL* $\rightarrow$ tại ô **CA Certificate**, bấm Browse và chọn file `ca.pem` tải từ Aiven.
4. Bấm **Test Connection** $\rightarrow$ Khi hiện thông báo thành công thì bấm **Finish**.


---

## 👥 Tài khoản kiểm thử mẫu (Có sẵn sau khi chạy)

Tất cả tài khoản mẫu dưới đây đều có mật khẩu mặc định là: **`123456`**

* **Quản trị viên (Admin):** `admin@gmail.com`
* **Bác sĩ (Doctor):** `bs.an.nguyen@phongkham.vn`
* **Bệnh nhân (User):** `test01@gmail.com`

---

## 🛠️ Các câu lệnh hữu ích khi làm việc

* **Xem log thời gian thực của server Backend (để debug):**
  ```bash
  docker compose logs -f backend
  ```
* **Tạm dừng hệ thống (khi nghỉ làm việc):**
  ```bash
  docker compose down
  ```
* **Bật lại hệ thống (khi không sửa code):**
  ```bash
  docker compose up -d
  ```
* **Khởi động lại toàn bộ dịch vụ:**
  ```bash
  docker compose restart
  ```

---

## 🖱️ Thao tác bằng chuột trên Docker Desktop (Không cần gõ lệnh)
1. Mở phần mềm **Docker Desktop** -> vào mục **Containers**.
2. Tìm nhóm `clinic-booking-platform-backend`, bạn sẽ thấy:
   - 🟢 `clinic_backend` (Cổng `8080:8080`)
   - 🟢 `clinic_mysql` (Cổng `3307:3306`)
   - 🟢 `clinic_phpmyadmin` (Cổng `8081:80`)
3. **Mở nhanh trang web:** Click chuột trực tiếp vào link cổng màu xanh (ví dụ `8080:8080` hoặc `8081:80`).
4. **Bật / Tắt:** Dùng nút **Start (Play)** hoặc **Stop (Hình vuông)** ở góc phải màn hình.
