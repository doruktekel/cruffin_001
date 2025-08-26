import { useState } from "react";

const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const forgotPassword = async (email) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData?.error || "Email gönderilemedi!");
      }

      setSuccess(true);
      return { success: true, data: resData };
    } catch (error) {
      setError(error.message || "Email gönderilemedi!");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess(false);
  };

  return { forgotPassword, loading, error, success, clearMessages };
};

export default useForgotPassword;
