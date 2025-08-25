import { useState } from "react";
import { toast } from "react-toastify";

const useSubmitLinks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitLinks = async (linksToSend) => {
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
        toast.success("Linkler başarıyla kaydedildi!", {});
      } else {
        throw new Error(data?.error || "Linkler kaydedilemedi");
      }
    } catch (error) {
      setError(error.message || "Linkler gonderilemedi");
      toast.error(error?.message || "Linkler gonderilemedi", {});
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
