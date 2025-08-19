"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, CheckCircle, XCircle } from "lucide-react";
import useSubmitHours from "@/hooks/useSubmitHours";
import { toast } from "react-toastify";

const days = [
  { key: "Monday", label: "Pazartesi" },
  { key: "Tuesday", label: "Salı" },
  { key: "Wednesday", label: "Çarşamba" },
  { key: "Thursday", label: "Perşembe" },
  { key: "Friday", label: "Cuma" },
  { key: "Saturday", label: "Cumartesi" },
  { key: "Sunday", label: "Pazar" },
];

//Custom Time Input Component
const TimeInput = ({
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
}) => {
  return (
    <input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        flex h-10 w-full rounded-md border border-input bg-background text-sm
        ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
        placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed
        disabled:opacity-50 ${className}
      `}
      step="300"
    />
  );
};

const HoursEditor = ({ workingHours }) => {
  const [hoursData, setHoursData] = useState([]);
  const { submitHours, loading, error } = useSubmitHours();
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  // Veri formatını kontrol eden ve düzenleyen fonksiyon
  const formatTimeValue = (timeValue) => {
    if (!timeValue) return "";

    // HH:MM formatında ise direkt döndür
    if (/^\d{2}:\d{2}$/.test(timeValue)) {
      return timeValue;
    }

    // H:MM formatında ise başına 0 ekle
    if (/^\d{1}:\d{2}$/.test(timeValue)) {
      return `0${timeValue}`;
    }

    // ISO string veya timestamp ise çevir
    try {
      if (timeValue.includes("T") || !isNaN(Date.parse(timeValue))) {
        const date = new Date(timeValue);
        if (!isNaN(date.getTime())) {
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        }
      }
    } catch (e) {
      console.warn("Time format error:", timeValue, e);
    }

    return "";
  };

  useEffect(() => {
    if (
      workingHours &&
      Array.isArray(workingHours) &&
      workingHours.length > 0
    ) {
      const formattedData = workingHours.map((item) => {
        const openTime = formatTimeValue(item.openTime);
        const closeTime = formatTimeValue(item.closeTime);

        // BURADA ÖNEMLİ DEĞİŞİKLİK:
        // Eğer openTime veya closeTime boş string ise, otomatik olarak kapalı yap
        const shouldBeClosed =
          item.isClosed ||
          !openTime ||
          !closeTime ||
          openTime === "" ||
          closeTime === "";

        return {
          day: item.day,
          openTime: shouldBeClosed ? "" : openTime,
          closeTime: shouldBeClosed ? "" : closeTime,
          isClosed: shouldBeClosed,
        };
      });

      setHoursData(formattedData);
    } else {
      // Boş template oluştur
      const emptyData = days.map(({ key }) => ({
        day: key,
        openTime: "",
        closeTime: "",
        isClosed: false,
      }));

      setHoursData(emptyData);
    }
  }, [workingHours]);

  const handleOpenTimeChange = (day, value) => {
    setHoursData((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, openTime: value } : item
      )
    );
  };

  const handleCloseTimeChange = (day, value) => {
    setHoursData((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, closeTime: value } : item
      )
    );
  };

  const handleClosedStatusChange = (day, isClosed) => {
    setHoursData((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              isClosed,
              // Eğer kapalı olarak işaretlenirse saatleri temizle
              openTime: isClosed ? "" : item.openTime,
              closeTime: isClosed ? "" : item.closeTime,
            }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    // 2 saniye içinde tekrar submit'i engelle
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);
    // Açık olan günler için saat kontrolü yap
    const openDays = hoursData.filter((item) => !item.isClosed);

    const hasEmptyFields = openDays.some(
      (item) => !item.openTime || !item.closeTime
    );

    if (hasEmptyFields) {
      toast.error(
        "Açık olan günler için lütfen tüm saat alanlarını doldurunuz."
      );
      return;
    }

    // Açık olan günler için saat doğrulaması
    const hasInvalidTime = openDays.some((item) => {
      const openTime = item.openTime;
      const closeTime = item.closeTime;

      if (openTime >= closeTime) {
        const dayLabel = days.find((d) => d.key === item.day)?.label;
        toast.error(
          `${dayLabel} için açılış saati kapanış saatinden önce olmalıdır.`
        );
        return true;
      }
      return false;
    });

    if (hasInvalidTime) {
      return;
    }

    try {
      await submitHours(hoursData);
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Kaydetme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold text-center">Çalışma Saatleri</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {days.map(({ key, label }) => {
          const entry = hoursData.find((item) => item.day === key) || {
            openTime: "",
            closeTime: "",
            isClosed: false,
          };

          return (
            <div
              key={key}
              className={`p-4 rounded-lg shadow-sm space-y-3 transition-colors ${
                entry.isClosed
                  ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                  : "bg-gray-100 dark:bg-gray-900"
              }`}
            >
              <Label className="font-semibold text-center block">{label}</Label>

              {/* Açık/Kapalı Switch */}
              <div className="flex items-center gap-4 mt-2 px-1 justify-center">
                <Switch
                  id={`isClosed-${key}`}
                  checked={!entry.isClosed} // Switch açık=false, kapalı=true mantığı
                  onCheckedChange={(isOpen) =>
                    handleClosedStatusChange(key, !isOpen)
                  }
                  className="scale-110 cursor-pointer"
                />
                <Label
                  htmlFor={`isClosed-${key}`}
                  className="flex items-center gap-2 select-none cursor-pointer"
                >
                  {!entry.isClosed ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Açık
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Kapalı
                      </span>
                    </>
                  )}
                </Label>
              </div>

              {/* Saat Inputları - Sadece açık günler için göster */}
              {!entry.isClosed && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs mb-1 block">Açılış Saati</Label>
                    <TimeInput
                      value={entry.openTime}
                      onChange={(value) => handleOpenTimeChange(key, value)}
                      className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs mb-1 block">Kapanış Saati</Label>
                    <TimeInput
                      value={entry.closeTime}
                      onChange={(value) => handleCloseTimeChange(key, value)}
                      className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Kapalı günler için bilgi mesajı */}
              {entry.isClosed && (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Bu gün kapalı
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 cursor-pointer"
        >
          <Save size={20} className="mr-2" />
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </div>
  );
};

export default HoursEditor;
