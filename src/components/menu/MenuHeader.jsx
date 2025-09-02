"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
const MenuHeader = () => {
  return (
    <div className="max-w-7xl mx-auto flex flex-col">
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
          <Image src="/kurucuk.png" width={60} height={80} alt="kurucuk" />
        </motion.div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl md:text-2xl text-center font-family-playfair font-bold text-amber-700  ">
            Menü
          </h1>
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
          <Image src="/cofmac.png" width={40} height={80} alt="cofmac" />
        </motion.div>{" "}
      </div>
    </div>
  );
};

export default MenuHeader;
