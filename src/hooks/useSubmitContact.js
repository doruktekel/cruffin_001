import { useState } from "react";
import { toast } from "react-toastify";

export const useSubmitContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitContact = async (contactData) => {
    console.log("submitContact custom hook içerisinde", contactData);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactData }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Kayıt sırasında bir hata oluştu.");
      }

      toast.success("İletişim bilgileri başarıyla güncellendi.");
      return data;
    } catch (err) {
      const errorMessage =
        err.responseData?.error ||
        err.message ||
        "Kayıt sırasında bir hata oluştu.";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage); // component'te handle edilsin
    } finally {
      setLoading(false);
    }
  };

  return {
    submitContact,
    loading,
    error,
  };
};
