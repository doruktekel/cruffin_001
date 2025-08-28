"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
const MenuHeader = () => {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ x: -20, y: -20 }}
          animate={{ x: 20, y: 20 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 3,
            ease: "easeInOut",
          }}
        >
          <Image src="/kurucuk.png" width={100} height={100} alt="kurucuk" />
        </motion.div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl lg:text-3xl text-center font-family-playfair font-bold text-amber-700  ">
            Menü
          </h1>
          <div className="w-full justify-between items-center gap-5"></div>
        </div>
        <motion.div
          animate={{ rotate: [-30, 0, -30] }} // sürekli -30° ↔ 0° arasında dönme
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <Image src="/cofmac.png" width={60} height={100} alt="cofmac" />
        </motion.div>{" "}
      </div>
    </div>
  );
};

export default MenuHeader;
