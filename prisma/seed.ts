import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("شروع ایجاد داده‌های اولیه (Seeding)...");

  // پاک‌سازی قبلی (به ترتیب وابستگی‌ها)
  await prisma.payment.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.service.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // رمز عبورها
  const adminPass = await bcrypt.hash("admin1234", 10);
  const staffPass = await bcrypt.hash("clinic1234", 10);

  // کاربران با شناسه‌های ثابت جهت جلوگیری از ابطال نشست و نقض کلید خارجی
  const admin = await prisma.user.create({
    data: {
      id: "seed-user-admin",
      username: "admin",
      displayName: "دکتر رضایی (مدیر کلینیک)",
      passwordHash: adminPass,
      role: Role.MANAGER,
    },
  });

  const secretary = await prisma.user.create({
    data: {
      id: "seed-user-secretary1",
      username: "secretary1",
      displayName: "خانم احمدی (منشی)",
      passwordHash: staffPass,
      role: Role.SECRETARY,
    },
  });

  const operator1 = await prisma.user.create({
    data: {
      id: "seed-user-operator1",
      username: "operator1",
      displayName: "سارا کریمی (اپراتور لیزر)",
      passwordHash: staffPass,
      role: Role.OPERATOR,
    },
  });

  const operator2 = await prisma.user.create({
    data: {
      id: "seed-user-operator2",
      username: "operator2",
      displayName: "مریم حسینی (اپراتور فیلر و ژل)",
      passwordHash: staffPass,
      role: Role.OPERATOR,
    },
  });

  console.log("کاربران ایجاد شدند.");

  // خدمات
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "لیزر فول بادی بانوان",
        category: "لیزر",
        price: 850000,
        description: "شامل دست‌ها، پاها، زیربغل و بیکینی با دستگاه الکساندرایت کاندلا",
      },
    }),
    prisma.service.create({
      data: {
        name: "لیزر صورت کامل",
        category: "لیزر",
        price: 250000,
        description: "شامل پیشانی، گونه‌ها، چانه و پشت لب",
      },
    }),
    prisma.service.create({
      data: {
        name: "لیزر زیر بغل",
        category: "لیزر",
        price: 150000,
        description: "کاهش دائمی موهای زائد زیر بغل",
      },
    }),
    prisma.service.create({
      data: {
        name: "تزریق بوتاکس خط اخم و پیشانی (دیسپورت)",
        category: "بوتاکس",
        price: 1600000,
        description: "رفع خطوط اخم و پیشانی با ماندگاری ۴ تا ۶ ماه",
      },
    }),
    prisma.service.create({
      data: {
        name: "تزریق فیلر لب روسی (۱ سی‌سی نورامیس)",
        category: "فیلر",
        price: 2800000,
        description: "فرم‌دهی و حجم‌دهی لب با برند معتبر کره‌ای",
      },
    }),
    prisma.service.create({
      data: {
        name: "فیشیال تخصصی پوست",
        category: "پوست",
        price: 650000,
        description: "پاکسازی عمقی، لایه‌برداری و آبرسانی",
      },
    }),
  ]);

  console.log("خدمات ایجاد شدند.");

  // بیماران نمونه
  const patient1 = await prisma.patient.create({
    data: {
      nationalId: "0012345678",
      firstName: "زهرا",
      lastName: "محمدی",
      phone: "09121112233",
      notes: "پوست حساس، سابقه سوختگی خفیف",
      createdById: secretary.id,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      nationalId: "0087654321",
      firstName: "علی",
      lastName: "کریمی",
      phone: "09129998877",
      notes: "نوبت سوم لیزر صورت",
      createdById: secretary.id,
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      nationalId: "0440011223",
      firstName: "نیلوفر",
      lastName: "صادقی",
      phone: "09351234567",
      notes: "متقاضی تزریق فیلر لب",
      createdById: secretary.id,
    },
  });

  console.log("بیماران نمونه ایجاد شدند.");

  // یک ویزیت در صف انتظار برای تست فوری
  await prisma.visit.create({
    data: {
      patientId: patient1.id,
      serviceId: services[0].id,
      createdById: secretary.id,
      status: "WAITING",
    },
  });

  console.log("داده‌های اولیه با موفقیت ثبت شدند!");
}

main()
  .catch((e) => {
    console.error("خطا در ایجاد داده‌های اولیه:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
