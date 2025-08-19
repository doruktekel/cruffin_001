import { useState } from "react";
import { toast } from "react-toastify";

const useSubmitProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitProducts = async (productsToSend) => {
    console.log("productsToSend IN CUSTOM HOOK", productsToSend);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productsToSend }),
      });

      const data = await res.json();

      // Eğer response başarılı ise
      if (res.ok) {
        toast.success("Ürünler başarıyla kaydedildi!", {});
        return data.products;
      } else {
        throw new Error(data?.error || "Ürünler kaydedilemedi");
      }
    } catch (error) {
      setError(error?.message || "Ürünler kaydedilemedi");
      toast.error(error?.message || "Ürünler kaydedilemedi", {});
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitProducts,
  };
};

export default useSubmitProducts;
