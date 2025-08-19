// lib/validations/authSchemas.js
import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Email boş olamaz")
  .email("Geçerli bir email adresi giriniz")
  .max(254, "Email çok uzun")
  .toLowerCase()
  .trim();

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(128, "Şifre çok uzun")
  .regex(/[A-Z]/, "En az 1 büyük harf içermeli")
  .regex(/[a-z]/, "En az 1 küçük harf içermeli")
  .regex(/\d/, "En az 1 rakam içermeli")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "En az 1 özel karakter içermeli (!@#$%^&* vb.)"
  );

// Register form validation schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    middleName: z.string().optional().default(""),
    profileUrl: z.string().optional().default(""),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor!",
    path: ["confirmPassword"],
  });

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Şifre boş olamaz"),
});

// ✅ DÜZELTİLMİŞ - Email validation fonksiyonu
export const validateEmail = (email) => {
  try {
    emailSchema.parse(email);
    return { isValid: true, error: null };
  } catch (error) {
    // ✅ Sadece ilk hata mesajını string olarak döndür
    let errorMessage = "Geçersiz email";

    if (error?.errors && error.errors.length > 0) {
      errorMessage = error.errors[0].message;
    }

    return {
      isValid: false,
      error: errorMessage, // String olarak döndürüyoruz
    };
  }
};

// ✅ DÜZELTİLMİŞ - Password validation fonksiyonu
export const validatePassword = (password) => {
  try {
    passwordSchema.parse(password);
    return { isValid: true, errors: [] };
  } catch (error) {
    let errors = [];

    // Zod error yapısını doğru şekilde parse et
    if (error?.issues && Array.isArray(error.issues)) {
      // Zod'da error.issues kullanılır, error.errors değil
      errors = error.issues.map((issue) => {
        // Her issue'dan sadece message'ı al
        return issue.message || "Geçersiz şifre formatı";
      });
    } else if (error?.errors && Array.isArray(error.errors)) {
      // Fallback için eski yapı
      errors = error.errors.map((err) => {
        if (typeof err === "object" && err.message) {
          return err.message;
        }
        if (typeof err === "string") {
          return err;
        }
        return "Geçersiz şifre formatı";
      });
    } else if (error?.message) {
      errors = [error.message];
    } else {
      errors = ["Geçersiz şifre"];
    }

    // Console'da debug için göster (sadece development'da)
    if (process.env.NODE_ENV === "development") {
      console.log("Password validation errors (clean):", errors);
    }

    return {
      isValid: false,
      errors: errors, // Temiz string array olarak döndür
    };
  }
};

// ✅ DÜZELTİLMİŞ - Register form validation fonksiyonu da güncellenmeli
export const validateRegisterForm = (formData) => {
  try {
    const validatedData = registerSchema.parse(formData);
    return {
      isValid: true,
      data: validatedData,
      errors: {},
    };
  } catch (error) {
    const fieldErrors = {};

    // Zod error yapısını doğru şekilde parse et
    if (error?.issues && Array.isArray(error.issues)) {
      error.issues.forEach((issue) => {
        const field = issue?.path?.[0];

        if (field) {
          if (field === "email") {
            // Email için string hata
            fieldErrors[field] = issue.message;
          } else if (field === "password") {
            // Password için array hata - sadece message'ları al
            if (!fieldErrors[field]) {
              fieldErrors[field] = [];
            }
            // ✅ Sadece message kısmını ekle
            fieldErrors[field].push(issue.message);
          } else {
            // Diğer alanlar için string hata
            fieldErrors[field] = issue.message;
          }
        }
      });
    } else if (error?.errors && Array.isArray(error.errors)) {
      // Fallback için eski yapı
      error.errors.forEach((err) => {
        const field = err?.path?.[0];

        if (field) {
          if (field === "email") {
            fieldErrors[field] = err.message;
          } else if (field === "password") {
            if (!fieldErrors[field]) {
              fieldErrors[field] = [];
            }
            fieldErrors[field].push(err.message);
          } else {
            fieldErrors[field] = err.message;
          }
        }
      });
    }

    return {
      isValid: false,
      data: null,
      errors: fieldErrors,
    };
  }
};
