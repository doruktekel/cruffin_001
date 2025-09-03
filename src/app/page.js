// import Header from "@/components/header/Header";
// import Tent from "@/components/Tent";
// import Image from "next/image";
// import MenuPage from "@/components/menu/Menu";
// import InfoWrapper from "@/components/info/InfoWrapper";
// import GalleryWrapper from "@/components/gallery/GalleryWrapper";
// import FooterWrapper from "@/components/footer/FooterWrapper";

// export default function Home() {
//   return (
//     <div className="flex flex-col items-center justify-center w-full max-w-full">
//       <Header />
//       <Tent />
//       <MenuPage />

//       <div className="relative w-full h-[600px] mt-20 md:mt-32 overflow-hidden">
//         <video
//           autoPlay
//           muted
//           loop
//           className="w-full h-full object-cover"
//           playsInline
//         >
//           <source src="/yatayvideo.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>

//         {/* Sarı / sıcak overlay */}
//         <div className="absolute inset-0 bg-amber-200/20 mix-blend-multiply pointer-events-none"></div>
//       </div>

//       <InfoWrapper />

//       <Image
//         src="/bg_patis.webp"
//         width={1920}
//         height={300}
//         className="w-full h-[300px] object-cover mt-20 md:mt-32"
//         alt="bg_patis"
//       />

//       <GalleryWrapper />

//       <FooterWrapper />
//     </div>
//   );
// }

import Header from "@/components/header/Header";
import Tent from "@/components/Tent";
import Image from "next/image";
import MenuPage from "@/components/menu/Menu";
import InfoWrapper from "@/components/info/InfoWrapper";
import GalleryWrapper from "@/components/gallery/GalleryWrapper";
import FooterWrapper from "@/components/footer/FooterWrapper";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen overflow-x-hidden">
      <Header />
      <Tent />
      <MenuPage />

      {/* Video Section - Horizontal scroll fix */}
      <div className="relative w-full max-w-[100vw] h-[600px] mt-20 md:mt-32 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          className="w-full h-full object-cover min-w-0"
          playsInline
        >
          <source src="/yatayvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Sarı / sıcak overlay */}
        <div className="absolute inset-0 bg-amber-200/20 mix-blend-multiply pointer-events-none"></div>
      </div>

      <InfoWrapper />

      {/* Image Section - Responsive fix */}
      <div className="w-full max-w-[100vw] mt-20 md:mt-32 overflow-hidden">
        <Image
          src="/bg_patis.webp"
          width={1920}
          height={300}
          className="w-full h-[300px] object-cover min-w-0"
          alt="bg_patis"
          priority={false}
        />
      </div>

      <GalleryWrapper />

      <FooterWrapper />
    </div>
  );
}
