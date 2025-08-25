"use client";

import Image from "next/image";
import { Undo2, Mail } from "lucide-react";

import { useState } from "react";
import useForgotPassword from "@/hooks/useForgotPassword";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const { forgotPassword, loading, error } = useForgotPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
  };

  return (
    <div className="min-h-screen flex flex-col gap-10 items-center justify-center">
      <div className="flex justify-center items-center">
        <h1 className="text-6xl text-center font-family-marcellus text-amber-700">
          Cruffin
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h2 className="text-xl font-semibold text-center">Şifre Yenileme</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="relative">
          <Input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <Mail
            className="absolute right-3 top-1/2 -translate-y-1/2"
            size={20}
          />
        </div>
        <Button
          type="submit"
          className="w-full py-2 rounded transition-all duration-300 ease-in-out hover:cursor-pointer"
          disabled={loading}
        >
          {loading ? <p>Şifren Sıfırlanıyor...</p> : <p>Şifreyi Sıfırla</p>}
        </Button>
      </form>
      <div className="flex justify-center">
        <Button
          onClick={() => router.push("/login")}
          className="flex justify-center items-center gap-2 p-2 w-full border py-2 rounded transition-all duration-300 ease-in-our hover:cursor-pointer"
        >
          <Undo2 />
          <p>Geri Dön </p>
        </Button>
      </div>
    </div>
  );
}
