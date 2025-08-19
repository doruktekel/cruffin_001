import { useState } from "react";
import { toast } from "react-toastify";

const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error || "Email Gönderilemedi !");
      }
      toast.success("Email Gönderildi Mailinizi Kontrol Edin !", {});
    } catch (error) {
      setError(error.message || "Email Gönderilemedi !");
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading, error };
};

export default useForgotPassword;
