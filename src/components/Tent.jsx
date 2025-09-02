import Image from "next/image";
import React from "react";

const Tent = () => {
  return (
    <div className="sticky top-0 w-full z-1">
      {/* <img src="/yen6.png" alt="tente" className="w-full h-40 object-cover" /> */}

      <Image
        src="/yen6.png"
        alt="tente"
        width={1920}
        height={1080}
        className="w-full h-32 object-cover"
        priority
        loading="eager"
        quality={100}
        // placeholder="blur"
        // blurDataURL="/yen6.png"
        // unoptimized
        sizes="100vw"
        // style={{
        //   width: "100%",
        //   height: "130px",
        // }}
      />
    </div>
  );
};

export default Tent;
