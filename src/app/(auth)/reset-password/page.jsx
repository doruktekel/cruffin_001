"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useResetPassword from "@/hooks/useResetPassword";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

// Create a separate component that uses useSearchParams
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const { loading, resetPassword, error } = useResetPassword();

  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showSecondPass, setShowSecondPass] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const errorToShow = passwordError || error;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== secondPassword) {
      setPasswordError("Şifreler eşleşmiyor !");
      return;
    }

    await resetPassword({ password, token, router });
  };

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <div className="flex justify-center items-center">
        <h1 className="text-6xl text-center font-family-marcellus text-amber-700">
          Cruffin
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h2 className="text-xl font-semibold text-center">
          Yeni Şifre Belirle
        </h2>
        {errorToShow && <p className="text-red-500">{errorToShow}</p>}
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="button"
            onClick={() => setShowPass((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        <div className="relative">
          <Input
            type={showSecondPass ? "text" : "password"}
            placeholder="Şifre Teyit"
            value={secondPassword}
            onChange={(e) => setSecondPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="button"
            onClick={() => setShowSecondPass((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showSecondPass ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full  p-2 rounded hover:cursor-pointer"
        >
          {loading ? "Gönderiliyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>
    </div>
  );
}

// Main component that wraps ResetPasswordForm with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Yükleniyor...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
