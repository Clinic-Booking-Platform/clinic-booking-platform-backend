import bcrypt from "bcrypt";
import { prisma } from "../config/client.js";
import { RoleType } from "../config/constant.js";
import {
    packageBasicHtml,
    packageVipHtml,
    packageCancerHtml,
    packagePremaritalHtml,
    packageDentalHtml,
    packageDermatologyHtml,
    articlePregnancyHtml,
    articleDentalHtml,
    articleAcneHtml,
    articleSinusitisHtml,
    articleJointHtml,
} from "./html_content/index.js";

const packageSeedData = [
    {
        name: "Gói khám sức khỏe tổng quát cơ bản",
        description: "Đánh giá tình trạng sức khỏe tổng thể, phát hiện sớm các bệnh lý chuyển hóa, chức năng gan, thận và huyết áp.",
        thumbnail_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
        price: 1200000,
        discount_price: 990000,
        html_content: packageBasicHtml,
    },
    {
        name: "Gói khám sức khỏe tổng quát chuyên sâu (VIP)",
        description: "Tầm soát toàn diện chức năng các cơ quan nội tạng, tim mạch, tầm soát ung thư sớm và sàng lọc rối loạn chuyển hóa.",
        thumbnail_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
        price: 3800000,
        discount_price: 3200000,
        html_content: packageVipHtml,
    },
    {
        name: "Gói tầm soát ung thư toàn diện",
        description: "Sàng lọc và phát hiện sớm các loại ung thư phổ biến hàng đầu: gan, phổi, dạ dày, đại trực tràng, vú và phụ khoa.",
        thumbnail_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
        price: 4500000,
        discount_price: 3900000,
        html_content: packageCancerHtml,
    },
    {
        name: "Gói khám sức khỏe tiền hôn nhân",
        description: "Kiểm tra sức khỏe sinh sản, sàng lọc bệnh truyền nhiễm và bệnh lý di truyền trước khi bước vào cuộc sống hôn nhân.",
        thumbnail_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
        price: 2600000,
        discount_price: 2200000,
        html_content: packagePremaritalHtml,
    },
    {
        name: "Gói chăm sóc răng miệng toàn diện",
        description: "Thăm khám tổng quát khoang miệng, lấy cao răng siêu âm êm ái, đánh bóng men răng và chụp X-quang nha khoa.",
        thumbnail_url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
        price: 550000,
        discount_price: 390000,
        html_content: packageDentalHtml,
    },
    {
        name: "Gói tầm soát và phục hồi sức khỏe Da liễu",
        description: "Soi da vi điểm 3D phân tích đa tầng, chẩn đoán nguyên nhân mụn, nám, lão hóa và xây dựng phác đồ cá nhân hóa.",
        thumbnail_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
        price: 850000,
        discount_price: 650000,
        html_content: packageDermatologyHtml,
    },
];

const articleSeedData = [
    {
        title: "Những mốc khám thai định kỳ quan trọng mẹ bầu không được bỏ qua",
        slug: "nhung-moc-kham-thai-dinh-ky-quan-trong",
        short_description: "Theo dõi thai kỳ qua từng giai đoạn giúp phát hiện sớm dị tật bẩm sinh, sàng lọc bệnh lý nguy hiểm và đảm bảo mẹ tròn con vuông.",
        thumbnail_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
        specialtyName: "Sản-Phụ khoa",
        views: 342,
        html_content: articlePregnancyHtml,
    },
    {
        title: "Hướng dẫn chăm sóc răng miệng đúng cách để ngừa sâu răng và viêm nướu",
        slug: "huong-dan-cham-soc-rang-mieng-dung-cach",
        short_description: "Chăm sóc răng miệng không đúng cách là nguyên nhân hàng đầu gây hôi miệng, viêm nha chu và mất răng sớm. Tìm hiểu hướng dẫn chi tiết từ nha sĩ.",
        thumbnail_url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
        specialtyName: "Răng Hàm Mặt",
        views: 218,
        html_content: articleDentalHtml,
    },
    {
        title: "Quy trình chăm sóc da mụn tuổi dậy thì hiệu quả và an toàn từ chuyên gia",
        slug: "quy-trinh-cham-soc-da-mun-tuoi-day-thi",
        short_description: "Mụn dậy thì khiến nhiều bạn trẻ tự ti. Tìm hiểu quy trình skincare khoa học, đơn giản giúp kiềm dầu, giảm mụn mà không lo để lại thâm sẹo.",
        thumbnail_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
        specialtyName: "Da Liễu",
        views: 540,
        html_content: articleAcneHtml,
    },
    {
        title: "Phân biệt viêm mũi dị ứng và viêm xoang: Nhận biết sớm để điều trị đúng cách",
        slug: "phan-biet-viem-mui-di-ung-va-viem-xoang",
        short_description: "Viêm mũi dị ứng và viêm xoang có nhiều biểu hiện tương đồng nhưng nguyên nhân và cách điều trị hoàn toàn khác nhau. Đừng để chữa nhầm khiến bệnh tăng nặng.",
        thumbnail_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
        specialtyName: "Tai Mũi Họng",
        views: 425,
        html_content: articleSinusitisHtml,
    },
    {
        title: "Thoái hóa khớp gối ở người trẻ: Nguyên nhân và cách phòng ngừa hiệu quả",
        slug: "thoai-hoa-khop-goi-o-nguoi-tre-nguyen-nhan-va-phong-ngua",
        short_description: "Thoái hóa khớp gối không còn là bệnh của riêng người già. Căn bệnh này đang có xu hướng trẻ hóa rõ rệt ở đối tượng nhân viên văn phòng và người thừa cân.",
        thumbnail_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
        specialtyName: "Cơ Xương Khớp",
        views: 315,
        html_content: articleJointHtml,
    },
];

const bannerSeedData = [
    {
        title: "Ưu đãi gói khám sức khỏe tổng quát đầu năm",
        image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        link_url: "/packages",
        sort_order: 1,
        is_active: true,
    },
    {
        title: "Đội ngũ chuyên gia bác sĩ hàng đầu tại phòng khám",
        image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
        link_url: "/doctors",
        sort_order: 2,
        is_active: true,
    },
    {
        title: "Tầm soát ung thư sớm - Bảo vệ sức khỏe gia đình bạn",
        image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
        link_url: "/packages",
        sort_order: 3,
        is_active: true,
    },
];

export const initialData = async () => {
    const users = await prisma.user.count();
    const role = await prisma.role.count();
    const specialty = await prisma.specialty.count();
    const doctor = await prisma.doctor.count();
    const packages = await prisma.package.count();
    const packageDetail = await prisma.packageDetail.count();
    const article = await prisma.article.count();
    const articleDetail = await prisma.articleDetail.count();
    const banner = await prisma.banner.count();
    if (!role) {
        await prisma.role.createMany({
            data: [
                {
                    name: RoleType.ADMIN,
                    description: "Quản trị viên",
                },
                {
                    name: RoleType.USER,
                    description: "Người dùng",
                },
                {
                    name: RoleType.DOCTOR,
                    description: "Bác sĩ",
                },
            ],
        });
    }

    const defaultPasswordHash = await bcrypt.hash("123456", 10);

    if (!users) {
        const roleAdmin = await prisma.role.findFirst({ where: { name: RoleType.ADMIN } });
        const roleUser = await prisma.role.findFirst({ where: { name: RoleType.USER } });
        const roleDoctor = await prisma.role.findFirst({ where: { name: RoleType.DOCTOR } });

        await prisma.user.createMany({
            data: [
                {
                    full_name: "Admin",
                    email: "admin@gmail.com",
                    password: defaultPasswordHash,
                    roleId: roleAdmin?.id,
                },
                {
                    full_name: "Test User 01",
                    email: "test01@gmail.com",
                    password: defaultPasswordHash,
                    roleId: roleUser?.id,
                },
                {
                    full_name: "Test User 02",
                    email: "test02@gmail.com",
                    password: defaultPasswordHash,
                    roleId: roleUser?.id,
                },
                {
                    full_name: "BS. Nguyễn Văn An",
                    email: "bs.an.nguyen@phongkham.vn",
                    password: defaultPasswordHash,
                    roleId: roleDoctor?.id,
                },
                {
                    full_name: "BS. Trần Thị Mai",
                    email: "bs.mai.tran@phongkham.vn",
                    password: defaultPasswordHash,
                    roleId: roleDoctor?.id,
                },
                {
                    full_name: "BS. Lê Hoàng Nam",
                    email: "bs.nam.le@phongkham.vn",
                    password: defaultPasswordHash,
                    roleId: roleDoctor?.id,
                },
                {
                    full_name: "BS. Phạm Thu Hà",
                    email: "bs.ha.pham@phongkham.vn",
                    password: defaultPasswordHash,
                    roleId: roleDoctor?.id,
                },
                {
                    full_name: "BS. Vũ Đức Trọng",
                    email: "bs.trong.vu@phongkham.vn",
                    password: defaultPasswordHash,
                    roleId: roleDoctor?.id,
                },
                {
                    full_name: "BS. Đỗ Mỹ Linh",
                    email: "bs.linh.do@phongkham.vn",
                    password: defaultPasswordHash,
                    roleId: roleDoctor?.id,
                },
                {
                    full_name: "BS. Hoàng Quốc Bảo",
                    email: "bs.bao.hoang@phongkham.vn",
                    password: defaultPasswordHash,
                    roleId: roleDoctor?.id,
                },
                {
                    full_name: "BS. Ngô Phương Thảo",
                    email: "bs.thao.ngo@phongkham.vn",
                    password: defaultPasswordHash,
                    roleId: roleDoctor?.id,
                },
            ],
        });
    } else {
        // Đồng bộ mật khẩu hash cho các tài khoản seed cũ chưa được hash bằng bcrypt
        await prisma.user.updateMany({
            where: { password: "123456" },
            data: { password: defaultPasswordHash },
        });
    }

    if (!specialty) {
        await prisma.specialty.createMany({
            data: [
                {
                    name: "Sản-Phụ khoa",
                    description: "Chuyên khoa sản phụ",
                },
                {
                    name: "Răng Hàm Mặt",
                    description: "Chuyên khoa răng hàm mặt",
                },
                {
                    name: "Da Liễu",
                    description: "Chuyên khoa da liễu",
                },
                {
                    name: "Tai Mũi Họng",
                    description: "Chuyên khoa tai mũi họng",
                },
                {
                    name: "Cơ Xương Khớp",
                    description: "Chuyên khoa cơ xương khớp",
                },
            ],
        });
    }

    if (!doctor) {
        const role = await prisma.role.findFirst({
            where: { name: RoleType.DOCTOR },
        });

        if (role) {
            await prisma.user.updateMany({
                where: { email: { contains: "@phongkham.vn" }, roleId: null },
                data: { roleId: role.id },
            });
        }

        const doctors = await prisma.user.findMany({
            where: { roleId: role?.id, deleted_at: null },
            orderBy: { id: "asc" },
        });

        const specialties = await prisma.specialty.findMany({
            where: { deleted_at: null },
            orderBy: { id: "asc" },
        });

        const doctorData: any = [];
        const DOCTORS_PER_SPECIALTY = 2;

        // Lặp qua từng chuyên khoa và lấy 2 bác sĩ tương ứng
        specialties.forEach((spec, index) => {
            const startIndex = index * DOCTORS_PER_SPECIALTY;
            const assignedDoctors = doctors.slice(startIndex, startIndex + DOCTORS_PER_SPECIALTY);

            assignedDoctors.forEach((doc) => {
                doctorData.push({
                    user_id: doc.id,
                    specialty_id: spec.id,
                    price: 150000,
                    description: `Bác sĩ chuyên khoa ${spec.name}`,
                });
            });
        });

        if (doctorData.length > 0) {
            await prisma.doctor.createMany({
                data: doctorData,
            });
        }
    }

    // Gói khám & Chi tiết gói khám
    if (!packages) {
        for (const pkg of packageSeedData) {
            await prisma.package.create({
                data: {
                    name: pkg.name,
                    description: pkg.description,
                    thumbnail_url: pkg.thumbnail_url,
                    price: pkg.price,
                    discount_price: pkg.discount_price,
                    package_detail: {
                        create: {
                            html_content: pkg.html_content.trim(),
                        },
                    },
                },
            });
        }
        console.log(">>> PACKAGES & PACKAGE DETAILS INITIALIZED...");
    } else if (!packageDetail) {
        const existingPackages = await prisma.package.findMany({
            where: { package_detail: null },
            orderBy: { id: "asc" },
        });

        for (let i = 0; i < existingPackages.length; i++) {
            const seed = packageSeedData[i % packageSeedData.length];
            await prisma.packageDetail.create({
                data: {
                    package_id: existingPackages[i].id,
                    html_content: seed.html_content.trim(),
                },
            });
        }
        console.log(">>> PACKAGE DETAILS INITIALIZED FOR EXISTING PACKAGES...");
    }

    // Bài viết & Chi tiết bài viết
    if (!article) {
        const doctors = await prisma.doctor.findMany({
            include: { specialty: true },
            orderBy: { id: "asc" },
        });

        if (doctors.length > 0) {
            for (const item of articleSeedData) {
                const assignedDoctor =
                    doctors.find(
                        (d) => d.specialty?.name.trim().toLowerCase() === item.specialtyName.trim().toLowerCase()
                    ) || doctors[0];

                await prisma.article.create({
                    data: {
                        title: item.title,
                        slug: item.slug,
                        short_description: item.short_description,
                        thumbnail_url: item.thumbnail_url,
                        views: item.views,
                        author_id: assignedDoctor.id,
                        specialty_id: assignedDoctor.specialty_id,
                        article_detail: {
                            create: {
                                html_content: item.html_content.trim(),
                            },
                        },
                    },
                });
            }
            console.log(">>> ARTICLES & ARTICLE DETAILS INITIALIZED...");
        }
    } else if (!articleDetail) {
        const existingArticles = await prisma.article.findMany({
            where: { article_detail: null },
            orderBy: { id: "asc" },
        });

        for (let i = 0; i < existingArticles.length; i++) {
            const seed = articleSeedData[i % articleSeedData.length];
            await prisma.articleDetail.create({
                data: {
                    article_id: existingArticles[i].id,
                    html_content: seed.html_content.trim(),
                },
            });
        }
        console.log(">>> ARTICLE DETAILS INITIALIZED FOR EXISTING ARTICLES...");
    }

    // Banners
    if (!banner) {
        await prisma.banner.createMany({
            data: bannerSeedData,
        });
        console.log(">>> BANNERS INITIALIZED...");
    }

    if (
        role !== 0 &&
        users !== 0 &&
        specialty !== 0 &&
        doctor !== 0 &&
        packages !== 0 &&
        packageDetail !== 0 &&
        article !== 0 &&
        articleDetail !== 0 &&
        banner !== 0
    ) {
        console.log(">>> ALREADY INIT DATA...");
    }
}