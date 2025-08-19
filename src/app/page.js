import Header from "@/components/header/Header";
import Tent from "@/components/Tent";
import Image from "next/image";
import MenuPage from "@/components/menu/Menu";
import InfoWrapper from "@/components/info/InfoWrapper";
import GalleryWrapper from "@/components/gallery/GalleryWrapper";
import FooterWrapper from "@/components/footer/FooterWrapper";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Header />
      <Tent />
      <MenuPage />
      {/* 
      <video
        autoPlay
        muted
        loop
        className="w-full h-[600px] object-cover mt-32"
      >
        <source src="/yatayvideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video> */}

      <div className="relative w-full h-[600px] mt-32 overflow-hidden">
        <video autoPlay muted loop className="w-full h-full object-cover">
          <source src="/yatayvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Sarı / sıcak overlay */}
        <div className="absolute inset-0 bg-amber-200/20 mix-blend-multiply pointer-events-none"></div>
      </div>

      <InfoWrapper />

      <Image
        src="/bg_patis.png"
        width={1920}
        height={300}
        className="w-full h-[300px] object-cover mt-32"
        alt="bg_patis"
      />

      <GalleryWrapper />

      <FooterWrapper />
    </div>
  );
}
