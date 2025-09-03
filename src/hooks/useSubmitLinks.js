import { useState } from "react";
import { toast } from "react-toastify";

const useSubmitLinks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitLinks = async (linksToSend, onSuccess) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/social-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linksToSend }),
      });
      const data = await res.json();

      // Eğer response başarılı ise
      if (res.ok) {
        toast.success("Linkler başarıyla kaydedildi!");

        // Success callback'i varsa çağır
        if (onSuccess && typeof onSuccess === "function") {
          onSuccess(data);
        }

        return data; // Data'yı return et
      } else {
        throw new Error(data?.error || "Linkler kaydedilemedi");
      }
    } catch (error) {
      setError(error.message || "Linkler gonderilemedi");
      toast.error(error?.message || "Linkler gonderilemedi");
      throw error; // Hata'yı yeniden fırlat
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitLinks,
  };
};

export default useSubmitLinks;
