import { Mail, MapPin, Phone, Clock, LocateFixed, Lock } from "lucide-react";
import SocialMedias from "./SocialMedias";

const Footer = ({ contactInfo, hours }) => {
  return (
    <footer
      className="bg-amber-700 text-white py-12 md:mt-24 mt-20 w-full scroll-mt-32"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Üst Bilgiler - 3 Sütun */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-sm sm:text-base">
          {/* İletişim */}
          <div className="space-y-3 ">
            <h4 className="text-center font-semibold font-family-nunito text-xl underline underline-offset-8">
              İletişim
            </h4>
            <p className="flex items-start gap-2 font-family-marcellus text-lg ">
              <MapPin size={18} className="mt-1" />
              {contactInfo?.address}
            </p>
            <p className="flex items-center gap-2 font-family-marcellus text-lg ">
              <Phone size={18} />
              <a href={`tel:${contactInfo?.phone}`} className="hover:underline">
                {contactInfo?.phone}
              </a>
            </p>
            <p className="flex items-center gap-2 font-family-marcellus text-lg">
              <Mail size={18} />
              <a
                href={`mailto:${contactInfo?.email}`}
                className="hover:underline"
              >
                {contactInfo?.email}
              </a>
            </p>
          </div>

          {/* Çalışma Saatleri */}
          <div className="space-y-3">
            <h4 className="text-center font-semibold font-family-nunito text-xl underline underline-offset-8">
              Çalışma Saatleri
            </h4>
            <div className="space-y-2 font-family-marcellus text-lg">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => {
                const dayData = hours?.find((h) => h.day === day);

                if (!dayData) return null;

                const dayLabels = {
                  Monday: "Pazartesi",
                  Tuesday: "Salı",
                  Wednesday: "Çarşamba",
                  Thursday: "Perşembe",
                  Friday: "Cuma",
                  Saturday: "Cumartesi",
                  Sunday: "Pazar",
                };

                const isClosed = dayData.isClosed;

                return (
                  <p key={day} className="flex items-center gap-2">
                    {isClosed ? (
                      <Lock size={18} className="text-red-800" />
                    ) : (
                      <Clock size={18} className="text-white" />
                    )}
                    <span className="w-28">{dayLabels[day]}</span>
                    <span>
                      {isClosed
                        ? "Kapalı"
                        : `${dayData.openTime} - ${dayData.closeTime}`}
                    </span>
                  </p>
                );
              })}
            </div>
          </div>

          {/* Harita */}
          <div className="space-y-3">
            <h4 className="text-center font-semibold font-family-nunito text-xl underline underline-offset-8">
              Bizi Ziyaret Et
            </h4>
            <div className="flex items-center gap-2 font-family-marcellus text-lg">
              <LocateFixed size={18} />
              <a
                href={contactInfo?.mapLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Haritada Göster
              </a>
            </div>
          </div>
        </div>

        {/* Sosyal Medya */}
        <SocialMedias />

        <hr />
        {/* Alt Bilgi */}
        <div className="text-center text-sm text-white">
          &copy; {new Date().getFullYear()} CRUFFIN. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
