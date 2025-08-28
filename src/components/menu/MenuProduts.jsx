"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Carrot, Flame, Sprout, Wheat, X } from "lucide-react";

const MenuProducts = ({ products, activeCategory }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // Mevcut ürünleri filtrele
  const availableProducts = products.filter((product) => product.isAvailable);

  return (
    <motion.div
      key={`${activeCategory}-${availableProducts.length}`} // Daha unique key
      className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-7xl mx-auto mt-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="hidden"
    >
      {availableProducts.map((product, index) => (
        <motion.div
          key={product._id}
          className="grid md:grid-cols-4 grid-cols-3 gap-2 md:gap-2 border md:p-2 p-1 md:rounded-xl rounded-md shadow hover:shadow-md transition-shadow duration-200"
          variants={itemVariants}
          layout // Layout animasyonu için
        >
          {/* Görsel */}
          <div className="col-span-1">
            <Image
              src={product.image ? product.image : "/bg_patis.png"}
              alt={product.name}
              width={100}
              height={100}
              className="rounded-md object-cover md:w-40 md:h-40 w-32 h-32"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>

          {/* Bilgiler */}
          <div className="md:col-span-3 col-span-2 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="lg:text-lg font-semibold font-family-marcellus capitalize">
                {product.name.toLocaleLowerCase()}
              </h3>
              <span className="text-amber-700 lg:text-lg font-extrabold">
                {product.price === 0 ? "" : product.price + " " + "₺"}
              </span>
            </div>

            <hr />
            <p className="text-sm text-gray-600 mt-1 md:mt-2 line-clamp-3 capitalize">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-1 md:gap-2 mt-1 md:mt-2">
              {product.ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-sm text-gray-800 md:px-2 px-1 py-1 rounded-sm md:rounded-md capitalize"
                >
                  {ingredient}
                </span>
              ))}
            </div>

            {/* İyileştirilmiş ikonlar */}
            <div className="flex items-center gap-2 md:gap-3 mt-2">
              {product.isVegan && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 transition-colors">
                      <Sprout className="text-green-600" size={20} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Vegan</TooltipContent>
                </Tooltip>
              )}

              {product.isVegetarian && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1.5 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors">
                      <Carrot className="text-orange-600" size={20} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Vejetaryen</TooltipContent>
                </Tooltip>
              )}

              {product.isGlutenFree && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1.5 rounded-full bg-amber-50 hover:bg-amber-100 transition-colors relative">
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <Wheat className="text-amber-600" size={20} />
                        {/* Daha temiz ve merkezi çapraz çizgi */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-0.5 bg-red-500 rotate-45 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Glutensiz</TooltipContent>
                </Tooltip>
              )}

              {product.isSpicy && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                      <Flame className="text-red-600" size={20} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Acılı</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MenuProducts;
