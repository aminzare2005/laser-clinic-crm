import { z } from "zod";
import { isNationalId, isMobilePhone } from "@/lib/iran-validation";

export const patientSchema = z.object({
  nationalId: z
    .string()
    .trim()
    .refine((val) => isNationalId(val), {
      message: "کد ملی ۱۰ رقمی وارد شده نامعتبر است",
    }),
  firstName: z
    .string()
    .trim()
    .min(2, { message: "نام باید حداقل ۲ حرف باشد" })
    .max(50, { message: "نام بیش از حد طولانی است" }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: "نام خانوادگی باید حداقل ۲ حرف باشد" })
    .max(50, { message: "نام خانوادگی بیش از حد طولانی است" }),
  phone: z
    .string()
    .trim()
    .refine((val) => isMobilePhone(val), {
      message: "شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد",
    }),
  notes: z.string().trim().optional(),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2, { message: "نام خدمت الزامی است" }),
  category: z.string().trim().min(2, { message: "دسته‌بندی الزامی است" }),
  price: z.coerce.number().positive({ message: "قیمت باید بیشتر از صفر باشد" }),
  description: z.string().trim().optional(),
});

export const serviceUpdateSchema = z.object({
  name: z.string().trim().min(2, { message: "نام خدمت الزامی است" }),
  category: z.string().trim().min(2, { message: "دسته‌بندی الزامی است" }),
  price: z.coerce.number().positive({ message: "قیمت باید بیشتر از صفر باشد" }),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const visitRegisterSchema = z.object({
  patientId: z.string().min(1, { message: "انتخاب بیمار الزامی است" }),
  serviceId: z.string().min(1, { message: "انتخاب خدمت الزامی است" }),
});

export const treatmentLogSchema = z.object({
  notes: z.string().trim().optional(),
  shotCount: z.coerce.number().optional(),
  powerLens: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  ccVolume: z.coerce.number().optional(),
  units: z.coerce.number().optional(),
  area: z.string().trim().optional(),
});

export const paymentSchema = z.object({
  visitId: z.string().min(1, { message: "شناسه ویزیت الزامی است" }),
  method: z.enum(["POS", "CASH", "CARD_TO_CARD"], {
    message: "روش پرداخت نامعتبر است",
  }),
  referenceCode: z.string().trim().optional(),
});

export const userCreateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "نام کاربری باید حداقل ۳ حرف باشد" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "نام کاربری فقط می‌تواند شامل حروف و اعداد انگلیسی باشد" }),
  password: z.string().min(6, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد" }),
  displayName: z.string().trim().min(2, { message: "نام نمایشی الزامی است" }),
  role: z.enum(["MANAGER", "SECRETARY", "OPERATOR"], {
    message: "نقش انتخاب شده نامعتبر است",
  }),
});

export const userUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "نام کاربری باید حداقل ۳ حرف باشد" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "نام کاربری فقط می‌تواند شامل حروف و اعداد انگلیسی باشد" }),
  password: z.string().min(6, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد" }).optional().or(z.literal("")),
  displayName: z.string().trim().min(2, { message: "نام نمایشی الزامی است" }),
  role: z.enum(["MANAGER", "SECRETARY", "OPERATOR"], {
    message: "نقش انتخاب شده نامعتبر است",
  }),
  isActive: z.boolean().optional(),
});
