"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useStore } from "@/app/zustand/store";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ Client-side validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const { loading, error, userLogin, user, userCheck } = useStore();
  const router = useRouter();
  const isMobileClient = false;

  // ✅ Email validation with regex
  const validateEmailClient = (emailValue) => {
    if (!emailValue.trim()) return null; // Boşsa error yok

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return "Geçerli bir email adresi giriniz";
    }
    return null;
  };

  // ✅ Password validation (min 8 characters)
  const validatePasswordClient = (passwordValue) => {
    if (!passwordValue.trim()) return null; // Boşsa error yok

    if (passwordValue.length < 8) {
      return "Şifre en az 8 karakter olmalı";
    }
    return null;
  };

  // ✅ Email change handler with validation
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    // Real-time validation
    const emailError = validateEmailClient(emailValue);
    setFieldErrors((prev) => ({
      ...prev,
      email: emailError,
    }));
  };

  // ✅ Password change handler with validation
  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    // Real-time validation
    const passwordError = validatePasswordClient(passwordValue);
    setFieldErrors((prev) => ({
      ...prev,
      password: passwordError,
    }));
  };

  // ✅ Field touch handler
  const handleFieldTouch = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // ✅ Validation state helpers
  const getEmailValidationState = () => {
    if (!email) return "neutral";
    if (fieldErrors.email) return "error";
    return "success";
  };

  const getPasswordValidationState = () => {
    if (!password) return "neutral";
    if (fieldErrors.password) return "error";
    return "success";
  };

  // ✅ Form validation check
  const isFormValid = () => {
    const hasErrors = Object.values(fieldErrors).some(
      (error) => error !== null
    );
    const hasEmptyFields = !email.trim() || !password.trim();
    return !hasErrors && !hasEmptyFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Final validation check before submit
    const emailError = validateEmailClient(email);
    const passwordError = validatePasswordClient(password);

    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    await userLogin({ email, password, router, isMobileClient, rememberMe });
  };

  useEffect(() => {
    const checkUser = async () => {
      await userCheck();
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <div className="flex justify-center items-center">
        <h1 className="text-6xl text-center font-family-marcellus tracking-wide text-amber-700">
          Cruffin
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h2 className="text-2xl font-semibold text-center">Giriş Yap</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* ✅ Email Input with validation styling */}
        <div className="relative">
          <Input
            name="email"
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleFieldTouch("email")}
            required
            autoComplete="email"
            className={`w-full px-4 py-2 border rounded pr-10 ${
              getEmailValidationState() === "error"
                ? "border-red-300 focus:border-red-500"
                : getEmailValidationState() === "success"
                ? "border-green-300 focus:border-green-500"
                : "focus:border-blue-500"
            }`}
          />
          <Mail
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              getEmailValidationState() === "error"
                ? "text-red-400"
                : getEmailValidationState() === "success"
                ? "text-green-400"
                : "text-gray-400"
            }`}
            size={20}
          />
        </div>
        {/* ✅ Email error display */}
        {fieldErrors.email && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
        )}

        {/* ✅ Password Input with validation styling */}
        <div className="relative">
          <Input
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleFieldTouch("password")}
            required
            autoComplete="current-password"
            className={`w-full px-4 py-2 border rounded pr-10 ${
              getPasswordValidationState() === "error"
                ? "border-red-300 focus:border-red-500"
                : getPasswordValidationState() === "success"
                ? "border-green-300 focus:border-green-500"
                : "focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPass((prev) => !prev)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity ${
              getPasswordValidationState() === "error"
                ? "text-red-400"
                : getPasswordValidationState() === "success"
                ? "text-green-400"
                : "text-gray-400"
            }`}
          >
            {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        {/* ✅ Password error display */}
        {fieldErrors.password && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-muted-foreground flex items-center gap-1"
            >
              Beni Hatırla
            </Label>
          </div>
          <Link
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            href="/forgot-password"
          >
            Şifremi Unuttum ?
          </Link>
        </div>

        {/* ✅ Submit button with validation-based disable */}
        <Button
          type="submit"
          className={`w-full border mt-4 py-2 rounded transition-all duration-300 ease-in-out ${
            isFormValid() && !loading
              ? "hover:cursor-pointer hover:bg-primary/90"
              : "cursor-not-allowed bg-gray-300 text-gray-500 hover:bg-gray-300"
          }`}
          disabled={loading || !isFormValid()}
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      <div className="flex gap-4">
        <p>
          Kaydınız Yoksa{" "}
          <button
            onClick={() => router.push("/register")}
            className="hover:cursor-pointer underline underline-offset-4 "
          >
            Kayıt Olunuz !
          </button>
        </p>
      </div>
    </div>
  );
}
