import { useState } from "react";
import { toast } from "react-toastify";

const useSubmitCategories = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitCategories = async (categoriesToSend) => {
    console.log(categoriesToSend);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoriesToSend }),
      });

      const data = await res.json();

      // Eğer response başarılı ise
      if (res.ok) {
        toast.success("Kategoriler başarıyla kaydedildi!", {});
        return data.categories;
      } else {
        throw new Error(data?.error || "Kategori kaydedilemedi");
      }
    } catch (error) {
      setError(error?.message || "Kategori kaydedilemedi");
      toast.error(error?.message || "Kategori kaydedilemedi", {});
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitCategories,
  };
};

export default useSubmitCategories;
