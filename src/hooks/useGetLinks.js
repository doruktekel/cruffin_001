import { set } from "mongoose";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const useGetLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLinks = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/social-media");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Sosyal medyalar getirilemedi");
      }

      setLinks(data.socialMedia || []);
    } catch (error) {
      setError(error.message || "Sosyal medyalar getirilemedi");
      toast.error(error?.message || "Sosyal medyalar getirilemedi", {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLinks();
  }, []);

  return {
    links,
    loading,
    error,
    getLinks,
  };
};

export default useGetLinks;
