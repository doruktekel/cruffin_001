"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  const { loading, error, userLogin, user, userCheck } = useStore();

  const router = useRouter();

  const isMobileClient = false;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      {/* <Image
        src={"/Real_Logo_01.png"}
        width={400}
        height={100}
        alt="Dmg_logo"
      /> */}
      <h1>LOGO</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h2 className="text-2xl font-semibold text-center">Giriş Yap</h2>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

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
            className="text-sm text-muted-foreground  underline underline-offset-4"
            href="/forgot-password"
          >
            Şifremi Unuttum ?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full border mt-4 py-2 rounded hover:cursor-pointer transition-all duration-300 ease-in-out "
          disabled={loading}
        >
          {loading ? <p>Giriş Yapılıyor...</p> : <p>Giriş Yap</p>}
        </Button>
      </form>
      <div className="flex gap-4">
        <p>
          Kaydınız Yoksa{" "}
          <button
            onClick={() => router.push("/register")}
            className="hover:cursor-pointer underline underline-offset-4"
          >
            Kayıt Olunuz !
          </button>
        </p>
      </div>
    </div>
  );
}
