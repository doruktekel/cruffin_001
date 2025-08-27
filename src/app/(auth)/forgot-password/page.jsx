"use client";

import { Undo2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import useForgotPassword from "@/hooks/useForgotPassword";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const { forgotPassword, loading, error, success, clearMessages } =
    useForgotPassword();

  // Email validation
  const validateEmail = (email) => {
    if (!email) {
      return "E-posta adresi gereklidir";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Geçerli bir e-posta adresi giriniz";
    }
    return "";
  };

  // Email değiştiğinde validation yap
  useEffect(() => {
    if (email) {
      const error = validateEmail(email);
      setEmailError(error);
    } else {
      setEmailError("");
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    const result = await forgotPassword(email);

    // Başarılı olursa email'i temizle
    if (result?.success) {
      setEmail("");
    }
  };

  const isFormValid = email && !emailError;

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <div className="flex justify-center items-center">
        <h1 className="text-6xl text-center font-family-marcellus tracking-wide text-amber-700">
          Cruffin
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h2 className="text-xl font-semibold text-center">Şifre Yenileme</h2>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-700 text-sm">
              E-posta gönderildi! Mailinizi kontrol edin.
            </p>
          </div>
        )}

        {/* API Error Message */}
        {error && !success && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-1">
          <div className="relative">
            <Input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded pr-10 ${
                emailError
                  ? "border-red-300 focus:border-red-500"
                  : email && !emailError
                  ? "border-green-300 focus:border-green-500"
                  : ""
              }`}
              disabled={loading}
            />
            <Mail
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                emailError
                  ? "text-red-400"
                  : email && !emailError
                  ? "text-green-400"
                  : "text-gray-400"
              }`}
              size={20}
            />
          </div>

          {/* Email Validation Error */}
          {emailError && (
            <p className="text-red-500 text-xs mt-1">{emailError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full py-2 rounded transition-all duration-300 ease-in-out hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !isFormValid}
        >
          {loading ? "Şifren Sıfırlanıyor..." : "Şifreyi Sıfırla"}
        </Button>
      </form>

      <div className="flex justify-center w-80">
        <Button
          onClick={() => router.push("/login")}
          variant="outline"
          className="flex justify-center items-center gap-2 p-2 w-full border py-2 rounded transition-all duration-300 ease-in-out hover:cursor-pointer"
          disabled={loading}
        >
          <Undo2 size={16} />
          <span>Geri Dön</span>
        </Button>
      </div>
    </div>
  );
}
