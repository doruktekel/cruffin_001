"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const useSubmitHours = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitHours = async (hoursData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: hoursData }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Kaydetme başarısız");

      toast.success("Çalışma saatleri başarıyla güncellendi!");
    } catch (err) {
      toast.error(err.message || "Bir hata oluştu.");
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return { submitHours, loading, error };
};

export default useSubmitHours;
