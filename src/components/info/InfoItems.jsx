"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const InfoItems = ({ infos }) => {
  return (
    <section
      id="info"
      className="max-w-7xl mx-auto flex flex-col md:gap24 gap-20 mt-20 md:mt-28 md:px-4 px-2 scroll-mt-32"
    >
      {infos.map((info, index) => {
        const isEven = index % 2 === 0;

        return (
          <div
            key={info._id}
            className={`flex flex-col-reverse md:flex-row items-center gap-10 ${
              isEven ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Yazı */}
            <motion.div
              initial={{ opacity: 0, x: isEven ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.5 }}
              className="w-full md:basis-1/2 -z-10 p-8 rounded-xl shadow-lg text-center flex flex-col gap-4 bg-amber-50 relative"
            >
              <h1 className="text-3xl font-family-shadows">{info.title}</h1>
              <p className="text-lg font-family-nunito whitespace-pre-line">
                {info.description}
              </p>
            </motion.div>

            {/* Görsel */}
            <motion.div
              initial={{ opacity: 0, x: isEven ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.5 }}
              className="w-full md:basis-1/2"
            >
              <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={info.image}
                  alt={info.title}
                  fill
                  className="object-cover saturate-150 brightness-110"
                />
              </div>
            </motion.div>
          </div>
        );
      })}
    </section>
  );
};

export default InfoItems;
