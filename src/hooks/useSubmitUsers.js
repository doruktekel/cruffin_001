import { useState } from "react";
import { toast } from "react-toastify";

export const useSubmitUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitUsers = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok || responseData.error) {
        throw new Error(
          responseData.error || "Kayıt sırasında bir hata oluştu."
        );
      }

      toast.success("Kullanıcılar başarıyla güncellendi.");

      return responseData;
    } catch (err) {
      const errorMessage =
        err.responseData?.error ||
        err.message ||
        "Kayıt sırasında bir hata oluştu.";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    submitUsers,
    loading,
    error,
  };
};
