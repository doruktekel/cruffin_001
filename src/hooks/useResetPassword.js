import { useState } from "react";
import { toast } from "react-toastify";

const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetPassword = async ({ password, token, router }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");

      toast.success("Şifre Yenileme Başarılı", {});
      router.push("/login");
    } catch (err) {
      setError(err.message || "Password Gönderilemedi !");
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error };
};

export default useResetPassword;
