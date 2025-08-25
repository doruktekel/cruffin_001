import { useState } from "react";
import { toast } from "react-toastify";

export const useSubmitInfos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitInfos = async (infosToSend) => {
    setLoading(true);
    setError(null);

    try {
      // Gereksiz alanları temizle
      const cleanedInfos = infosToSend.map((info) => {
        const cleanInfo = {
          title: info.title,
          description: info.description,
          image: info.image,
          isActive: info.isActive,
        };

        // Eğer _id varsa (güncelleme işlemi), onu da ekle
        if (info._id) {
          cleanInfo._id = info._id;
        }

        // Eğer tempId varsa (yeni kayıt), onu da ekle
        if (info.tempId && !info._id) {
          cleanInfo.tempId = info.tempId;
        }

        return cleanInfo;
      });

      const res = await fetch("/api/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ infosToSend: cleanedInfos }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Kayıt sırasında bir hata oluştu.");
      }

      toast.success("Bilgiler başarıyla kaydedildi.");
      return data;
    } catch (err) {
      const errorMessage =
        err.responseData?.error ||
        err.message ||
        "Kayıt sırasında bir hata oluştu.";
      setError(errorMessage);
      throw new Error(errorMessage); // component'te handle edilsin
    } finally {
      setLoading(false);
    }
  };

  return {
    submitInfos,
    loading,
    error,
  };
};
