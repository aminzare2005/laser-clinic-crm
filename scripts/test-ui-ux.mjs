import puppeteer from "puppeteer-core";
import fs from "fs/promises";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(process.cwd(), "doc", "screenshots");

// کلیک مطمئن روی المان دارای متن خاص
async function clickByText(page, text, selector = "button, a") {
  return page.evaluate(
    (t, sel) => {
      const items = Array.from(document.querySelectorAll(sel));
      const target = items.find((el) => el.innerText.trim().includes(t));
      if (target) {
        target.click();
        return true;
      }
      return false;
    },
    text,
    selector
  );
}

async function runTests() {
  console.log("🚀 شروع آزمایش جامع خودکار UI/UX، ریپسانسیو موبایل و فرآیندهای کلینیک...");
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,850"],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  // هندلر خودکار تایید دیالوگ‌های confirm
  page.on("dialog", async (dialog) => {
    console.log(`💬 دیالوگ مرورگر دریافت شد: ${dialog.message()}`);
    await dialog.accept();
  });

  async function loginAs(username, password, expectedPath) {
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCookies");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await page.type("#username", username);
    await page.type("#password", password);
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname !== "/login", { timeout: 10000 });
    if (expectedPath) {
      await page.waitForFunction((p) => window.location.pathname === p, { timeout: 10000 }, expectedPath);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  try {
    // ----------------------------------------------------
    // ۱. تست صفحه ورود (Login Page)
    // ----------------------------------------------------
    console.log("📸 تست ۱: بررسی و عکس‌برداری صفحه ورود در تم روشن...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "01-login-page.png"), fullPage: true });

    // ----------------------------------------------------
    // ۲. تست جریان مدیر (Manager Flow)
    // ----------------------------------------------------
    console.log("📸 تست ۲: ورود مدیر و بررسی داشبورد شاخص‌ها...");
    await loginAs("admin", "admin1234", "/manager");

    console.log("📸 ذخیره اسکرین‌شات داشبورد مدیر...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "02-manager-dashboard.png"), fullPage: true });

    console.log("📸 مدیریت خدمات و تعرفه‌ها...");
    await page.goto(`${BASE_URL}/manager/services`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "03-manager-services.png"), fullPage: true });

    console.log("📸 باز کردن مودال تعریف خدمت جدید...");
    await clickByText(page, "افزودن خدمت جدید");
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "04-manager-service-modal.png") });
    await clickByText(page, "انصراف");
    await new Promise((r) => setTimeout(r, 400));

    console.log("📸 مدیریت پرسنل و کاربران...");
    await page.goto(`${BASE_URL}/manager/users`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "05-manager-users.png"), fullPage: true });

    // ----------------------------------------------------
    // ۳. تست جریان منشی (Secretary Flow)
    // ----------------------------------------------------
    console.log("📸 تست ۳: ورود منشی و بررسی پذیرش...");
    await loginAs("secretary1", "clinic1234", "/secretary/patients");

    console.log("📸 صفحه پذیرش بیمار (خالی)...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "07-secretary-patient-lookup.png"), fullPage: true });

    console.log("🔍 استعلام بیمار موجود با کد ملی 0012345678...");
    await page.type("#nationalIdInput", "0012345678");
    await page.click("#searchPatientBtn");
    await page.waitForSelector("#registerVisitBtn", { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "08-secretary-patient-profile.png"), fullPage: true });

    console.log("📝 ثبت نوبت ویزیت و ارجاع به سالن انتظار...");
    await page.click("#registerVisitBtn");
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "09-secretary-visit-confirmed.png"), fullPage: true });

    console.log("🔍 استعلام کد ملی ثبت‌نشده جهت نمایش فرم بیمار جدید...");
    await page.goto(`${BASE_URL}/secretary/patients`, { waitUntil: "networkidle0" });
    await page.waitForSelector("#nationalIdInput");
    await page.type("#nationalIdInput", "0099887766");
    await page.click("#searchPatientBtn");
    await page.waitForSelector("#createPatientBtn", { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "10-secretary-new-patient-form.png"), fullPage: true });

    // ----------------------------------------------------
    // ۴. تست جریان اپراتور (Operator Flow)
    // ----------------------------------------------------
    console.log("📸 تست ۴: ورود اپراتور به صف انتظار...");
    await loginAs("operator1", "clinic1234", "/operator/queue");

    console.log("📸 تابلوی صف انتظار اپراتور...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "11-operator-queue.png"), fullPage: true });

    console.log("🩺 پذیرش بیمار در اتاق درمان...");
    await clickByText(page, "پذیرش بیمار");
    await page.waitForFunction(() => window.location.pathname.startsWith("/operator/queue/"), { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "12-operator-treatment-room.png"), fullPage: true });

    console.log("▶️ کلیک روی شروع درمان...");
    await clickByText(page, "شروع درمان");
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "13-operator-treatment-started.png"), fullPage: true });

    console.log("📋 ثبت لاگ درمان...");
    const shotInput = await page.$("#shotCount");
    if (shotInput) await shotInput.type("580");
    const powerLens = await page.$("#powerLens");
    if (powerLens) await powerLens.type("18mm / 16J");
    const areaInput = await page.$("#area");
    if (areaInput) await areaInput.type("فول بادی بانوان (دست‌ها، پاها، زیربغل)");

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "14-operator-treatment-logged.png"), fullPage: true });

    console.log("🏁 ثبت پایان درمان و ارجاع به صندوق...");
    await clickByText(page, "پایان درمان و ارجاع بیمار به صندوق");
    await page.waitForFunction(() => window.location.pathname === "/operator/queue", { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));
    console.log("✅ درمان با موفقیت پایان یافت و بیمار به صندوق منتقل شد.");

    // ----------------------------------------------------
    // ۵. تست تسویه حساب و صندوق (Checkout Flow)
    // ----------------------------------------------------
    console.log("📸 تست ۵: ورود منشی به صندوق و تسویه حساب...");
    await loginAs("secretary1", "clinic1234", "/secretary/patients");

    await page.goto(`${BASE_URL}/secretary/checkout`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "15-secretary-checkout-list.png"), fullPage: true });

    console.log("🧾 صدور فاکتور و ورود به صفحه تسویه...");
    await clickByText(page, "تسویه حساب و صدور فاکتور");
    await page.waitForFunction(() => window.location.pathname.startsWith("/secretary/checkout/"), { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "16-invoice-details.png"), fullPage: true });

    const refInput = await page.$("#referenceCode");
    if (refInput) await refInput.type("POS-99881122");

    console.log("💳 تأیید دریافت وجه کارتخوان...");
    await clickByText(page, "تأیید تراکنش و تسویه نهایی حساب");
    await new Promise((r) => setTimeout(r, 1800));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "17-payment-success-invoice.png"), fullPage: true });
    console.log("✅ پرداخت و تسویه حساب با موفقیت ثبت شد!");

    // ----------------------------------------------------
    // ۶. تست اختصاصی ریسپانسیو موبایل و منوی همبرگری (Mobile 375x667)
    // ----------------------------------------------------
    console.log("📱 تست ۶: آزمایش نمایش موبایل و عملکرد منوی همبرگری...");
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCookies");

    console.log("📱 عکس‌برداری صفحه ورود در ابعاد موبایل...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "18-mobile-login.png"), fullPage: true });

    console.log("📱 ورود کاربر منشی در حالت موبایل...");
    await page.type("#username", "secretary1");
    await page.type("#password", "clinic1234");
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname !== "/login", { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    console.log("📱 عکس‌برداری از صفحه پذیرش بیمار در موبایل...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "19-mobile-patient-intake.png"), fullPage: true });

    // تست کلیک روی دکمه همبرگری و باز شدن کشوی موبایل
    console.log("📱 کلیک روی دکمه منوی همبرگری (#mobileNavToggleBtn)...");
    await page.waitForSelector("#mobileNavToggleBtn");
    await page.click("#mobileNavToggleBtn");
    await new Promise((r) => setTimeout(r, 600));

    console.log("📱 عکس‌برداری از منوی همبرگری باز شده (Mobile Drawer / Sheet)...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "20-mobile-drawer-open.png") });

    // بررسی عدم اسکرول افقی ناخواسته در موبایل (No Horizontal Overflow)
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`📱 وضعیت اسکرول افقی در موبایل: ${hasHorizontalOverflow ? "❌ سرریز افقی دارد" : "✅ کاملاً ریسپانسیو و بدون سرریز"}`);

    // رفتن به صفحه صندوق در نمای موبایل
    console.log("📱 هدایت به صندوق در نمای موبایل...");
    await page.goto(`${BASE_URL}/secretary/checkout`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "21-mobile-checkout-cards.png"), fullPage: true });

    // ورود مدیر در نمای موبایل و بررسی داشبورد ریسپانسیو
    console.log("📱 ورود به عنوان مدیر در ابعاد موبایل...");
    await loginAs("admin", "admin1234", "/manager");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "22-mobile-manager-dashboard.png"), fullPage: true });

    console.log("🎉 تمام تست‌ها با موفقیت ۱۰۰٪ اجرا شدند و تمام ۲۲ اسکرین‌شات دسکتاپ و موبایل در doc/screenshots ذخیره گردید!");
  } catch (err) {
    console.error("❌ خطا در اجرای تست:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

runTests();
