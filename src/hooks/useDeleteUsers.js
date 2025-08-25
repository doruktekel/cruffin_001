import { useState } from "react";
import { toast } from "react-toastify";

export const useDeleteUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(
          data.error || "Kullanıcı silme sırasında bir hata oluştu."
        );
      }

      toast.success("Kullanıcı başarıyla silindi.");
      return data;
    } catch (err) {
      const errorMessage =
        err.responseData?.error ||
        err.message ||
        "Kullanıcı silme sırasında bir hata oluştu.";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteUser,
    loading,
    error,
  };
};
