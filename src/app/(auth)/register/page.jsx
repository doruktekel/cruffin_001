"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/app/zustand/store";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HoneyPot } from "@/components/HoneyPot";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  validateEmail,
  validatePassword,
  validateRegisterForm,
} from "@/lib/validations/authSchemas";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showSecondPass, setShowSecondPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [honeypotData, setHoneypotData] = useState({
    middleName: "",
    profileUrl: "",
  });

  const [showLastAttemptAlert, setShowLastAttemptAlert] = useState(false);
  const [pendingFormSubmission, setPendingFormSubmission] = useState(null);

  const handleHoneypotChange = (data) => {
    setHoneypotData({
      middleName: data.honeypot,
      profileUrl: data.website,
    });
  };

  const router = useRouter();
  const { loading, error, userRegister, user, userCheck, rateLimitInfo } =
    useStore();

  const handleFieldTouch = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setFormData((prev) => ({ ...prev, email: emailValue }));

    if (touchedFields.email || emailValue) {
      try {
        const emailValidation = validateEmail(emailValue);
        setFieldErrors((prev) => ({
          ...prev,
          email: emailValidation.isValid ? null : emailValidation.error,
        }));
      } catch (err) {
        console.error("Email validation error:", err);
        setFieldErrors((prev) => ({
          ...prev,
          email: "Email doğrulama hatası",
        }));
      }
    }
  };

  // 1. ✅ handlePasswordChange fonksiyonunuzu şöyle güncelleyin:
  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setFormData((prev) => ({ ...prev, password: passwordValue }));

    if (touchedFields.password || passwordValue) {
      try {
        const passwordValidation = validatePassword(passwordValue);

        // ✅ Debug için - geçici olarak ekleyebilirsiniz
        if (
          process.env.NODE_ENV === "development" &&
          !passwordValidation.isValid
        ) {
          console.log("Password validation result:", passwordValidation.errors);
        }

        setFieldErrors((prev) => ({
          ...prev,
          password: passwordValidation.isValid
            ? null
            : passwordValidation.errors,
        }));
      } catch (err) {
        console.error("Password validation error:", err);
        setFieldErrors((prev) => ({
          ...prev,
          password: ["Şifre doğrulama hatası"],
        }));
      }
    }

    // Confirm password kontrolü
    if (
      formData.confirmPassword &&
      passwordValue !== formData.confirmPassword
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "Şifreler eşleşmiyor!",
      }));
    } else if (
      formData.confirmPassword &&
      passwordValue === formData.confirmPassword
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: null,
      }));
    }
  };
  const handleConfirmPasswordChange = (e) => {
    const confirmPasswordValue = e.target.value;
    setFormData((prev) => ({ ...prev, confirmPassword: confirmPasswordValue }));

    if (touchedFields.confirmPassword || confirmPasswordValue) {
      if (confirmPasswordValue !== formData.password) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: "Şifreler eşleşmiyor!",
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: null,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Form validation with proper error handling
    let validation;
    try {
      validation = validateRegisterForm(formData);
    } catch (err) {
      console.error("Form validation error:", err);
      toast.error("Form doğrulama hatası oluştu");
      return;
    }

    if (!validation.isValid) {
      setFieldErrors(validation.errors);

      // ✅ Toast ile genel validation hatası göster
      const errorMessages = Object.values(validation.errors).flat();
      if (errorMessages.length > 0) {
        toast.error(`Form hatası: ${errorMessages[0]}`);
      }

      const firstErrorField = Object.keys(validation.errors)[0];
      document.querySelector(`input[name="${firstErrorField}"]`)?.focus();
      return;
    }

    // Rate limit kontrolü
    if (rateLimitInfo) {
      if (rateLimitInfo.remaining === 0) {
        const resetTime = new Date(rateLimitInfo.resetTime);
        const now = new Date();
        const waitMinutes = Math.ceil((resetTime - now) / (1000 * 60));

        toast.error(
          `Kayıt hakkınız bitti. ${waitMinutes} dakika sonra tekrar deneyiniz.`
        );
        return;
      }

      if (rateLimitInfo.remaining === 1) {
        setShowLastAttemptAlert(true);
        setPendingFormSubmission(validation.data);
        return;
      }
    }

    const { confirmPassword, ...dataToSend } = validation.data;
    await userRegister({
      email: dataToSend.email,
      password: dataToSend.password,
      honeypot: honeypotData.middleName,
      website: honeypotData.profileUrl, // ✅ Düzeltme: profile_url -> profileUrl
      router,
    });
  };

  const isFormValid = () => {
    const hasErrors = Object.values(fieldErrors).some(
      (error) => error !== null
    );
    const hasEmptyFields =
      !formData.email || !formData.password || !formData.confirmPassword;
    return !hasErrors && !hasEmptyFields;
  };

  useEffect(() => {
    const checkUser = async () => {
      await userCheck();
    };
    checkUser();
  }, [userCheck]);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // ✅ Store'dan gelen error'ları toast ile göster
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleConfirmLastAttempt = async () => {
    if (pendingFormSubmission) {
      const { confirmPassword, ...dataToSend } = pendingFormSubmission;
      await userRegister({
        email: dataToSend.email,
        password: dataToSend.password,
        honeypot: honeypotData.middleName,
        website: honeypotData.profileUrl,
        router,
      });
    }
    setShowLastAttemptAlert(false);
    setPendingFormSubmission(null);
  };

  const handleCancelLastAttempt = () => {
    setShowLastAttemptAlert(false);
    setPendingFormSubmission(null);
  };

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <AlertDialog
        open={showLastAttemptAlert}
        onOpenChange={setShowLastAttemptAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Son Kayıt Hakkı</AlertDialogTitle>
            <AlertDialogDescription>
              Bu son kayıt hakkınız. Devam etmek istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLastAttempt}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLastAttempt}>
              Devam Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <h1>LOGO</h1>

      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <HoneyPot onHoneypotChange={handleHoneypotChange} />

        {rateLimitInfo && rateLimitInfo.limit > 0 && (
          <div
            className={`px-3 py-2 rounded text-sm border ${
              rateLimitInfo.remaining === 0
                ? "bg-red-50 border-red-200 text-red-700"
                : rateLimitInfo.remaining <= 1
                ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            {rateLimitInfo.remaining === 0
              ? `Kayıt limiti aşıldı. Lütfen bekleyin.`
              : `Kalan kayıt hakkı: ${rateLimitInfo.remaining}`}
          </div>
        )}

        {/* Email Input */}
        <div className="relative">
          <Input
            name="email"
            type="email"
            placeholder="E-posta"
            value={formData.email}
            onChange={handleEmailChange}
            onBlur={() => handleFieldTouch("email")}
            required
            autoComplete="email"
            className={`w-full p-4 border rounded ${
              fieldErrors.email
                ? "border-red-500 focus:border-red-500"
                : "focus:border-blue-500"
            }`}
          />
          <Mail
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        {/* ✅ Email Error Display - String format */}
        {fieldErrors.email && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
        )}

        {/* Password Input */}
        <div className="relative">
          <Input
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Şifre (min 8 karakter)"
            value={formData.password}
            onChange={handlePasswordChange}
            onBlur={() => handleFieldTouch("password")}
            required
            autoComplete="new-password"
            className={`w-full p-4 pr-12 border rounded ${
              fieldErrors.password
                ? "border-red-500 focus:border-red-500"
                : "focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPass((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
          >
            {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        {/* ✅ Password Error Display - Array format için optimize edilmiş */}
        {fieldErrors.password && (
          <div className="mt-2 space-y-1">
            {Array.isArray(fieldErrors.password) ? (
              fieldErrors.password.map((error, index) => (
                <p key={index} className="text-red-500 text-sm">
                  • {error}
                </p>
              ))
            ) : typeof fieldErrors.password === "string" ? (
              <p className="text-red-500 text-sm">• {fieldErrors.password}</p>
            ) : null}
          </div>
        )}

        {/* Confirm Password Input */}
        <div className="relative">
          <Input
            name="confirmPassword"
            type={showSecondPass ? "text" : "password"}
            placeholder="Şifre Teyit"
            value={formData.confirmPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={() => handleFieldTouch("confirmPassword")}
            required
            autoComplete="new-password"
            className={`w-full p-4 pr-12 border rounded ${
              fieldErrors.confirmPassword
                ? "border-red-500 focus:border-red-500"
                : "focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowSecondPass((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
          >
            {showSecondPass ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        {/* ✅ Confirm Password Error Display - String format */}
        {fieldErrors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {fieldErrors.confirmPassword}
          </p>
        )}

        <Button
          type="submit"
          className={`w-full border py-2 rounded transition-all duration-300 ease-in-out mt-4 ${
            isFormValid() && !loading && rateLimitInfo?.remaining !== 0
              ? "hover:cursor-pointer "
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          disabled={loading || !isFormValid() || rateLimitInfo?.remaining === 0}
        >
          {loading
            ? "Kayıt Olunuyor..."
            : rateLimitInfo?.remaining === 0
            ? "Kayıt Limiti Aşıldı"
            : "Kayıt Ol"}
        </Button>
      </form>

      <div className="flex gap-1">
        <p>Kaydınız Varsa</p>
        <button
          onClick={() => router.push("/login")}
          className="underline underline-offset-4 hover:cursor-pointer"
        >
          Giriş Yapınız !
        </button>
      </div>
    </div>
  );
}
