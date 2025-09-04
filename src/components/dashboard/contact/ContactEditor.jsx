"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useSubmitContact } from "@/hooks/useSubmitContact";
import { toast } from "react-toastify";

// E-posta formatını kontrol eden regex
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
// Telefon numarası kontrolü (Sadece rakamlar)
const isValidPhone = (phone) => /^\d+$/.test(phone);
// Harita linki kontrolü (URL formatı)
const isValidMapLink = (link) =>
  /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(link);

const ContactEditor = ({ contactInfo }) => {
  const [contactData, setContactData] = useState({
    address: "",
    phone: "",
    email: "",
    mapLink: "",
  });
  const [originalData, setOriginalData] = useState({
    address: "",
    phone: "",
    email: "",
    mapLink: "",
  });
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const { submitContact, loading, error } = useSubmitContact();

  useEffect(() => {
    if (contactInfo) {
      const initialData = {
        address: contactInfo.address,
        phone: contactInfo.phone,
        email: contactInfo.email,
        mapLink: contactInfo.mapLink,
      };
      setContactData(initialData);
      setOriginalData(initialData);
    }
  }, [contactInfo]);

  const handleChange = (field, value) => {
    setContactData((prev) => ({ ...prev, [field]: value }));
  };

  // Değişiklik kontrolü fonksiyonu
  const hasChanges = () => {
    return (
      contactData.address !== originalData.address ||
      contactData.phone !== originalData.phone ||
      contactData.email !== originalData.email ||
      contactData.mapLink !== originalData.mapLink
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 2 saniye içinde tekrar submit'i engelle
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);

    // Değişiklik kontrolü
    if (!hasChanges()) {
      toast.info("Herhangi bir değişiklik yapılmadı.");
      return;
    }

    const { address, phone, email, mapLink } = contactData;

    // Boş alanları kontrol et
    if (!address || !phone || !email || !mapLink) {
      toast.error("Lütfen tüm alanları doldurunuz.");
      return;
    }

    // E-posta formatını kontrol et
    if (!isValidEmail(email)) {
      toast.error("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    // Telefon numarasını kontrol et
    if (!isValidPhone(phone)) {
      toast.error("Telefon numarası sadece rakamlardan oluşmalıdır.");
      return;
    }

    // Harita linkini kontrol et
    if (!isValidMapLink(mapLink)) {
      toast.error("Geçerli bir harita linki giriniz.");
      return;
    }

    try {
      await submitContact(contactData);
      // Başarılı kayıt sonrası orijinal veriyi güncelle
      setOriginalData(contactData);
    } catch (err) {
      console.error("Güncelleme hatası:", err);
    }
  };

  return (
    <div className="overflow-hidden mb-4">
      <div className="flex justify-center items-center">
        <p className="text-lg font-semibold">İletişim Bilgileri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 ">
        <div className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
          <Label>Adres</Label>
          <Input
            value={contactData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Adres giriniz"
            className="p-1 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400 flex-grow"
          />
        </div>

        <div className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
          <Label>Telefon</Label>
          <Input
            value={contactData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="Telefon giriniz"
            className="p-1 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400 flex-grow"
          />
        </div>

        <div className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
          <Label>Email</Label>
          <Input
            value={contactData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Email giriniz"
            className="p-1 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400 flex-grow"
          />
        </div>

        <div className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
          <Label>Harita Linki</Label>
          <Input
            value={contactData.mapLink}
            onChange={(e) => handleChange("mapLink", e.target.value)}
            placeholder="Harita linki giriniz"
            className="p-1 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400 flex-grow"
          />
        </div>
      </div>

      <div className="text-center mt-8">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="cursor-pointer"
          disabled={loading}
        >
          <Save size={20} className="mr-2" />
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </div>
  );
};

export default ContactEditor;
