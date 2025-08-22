"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaWheatAwn,
  FaFireFlameCurved,
  FaLeaf,
  FaCarrot,
} from "react-icons/fa6";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MenuProducts = ({ products, activeCategory }) => {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      key={activeCategory} // Bu key sayesinde kategori değiştiğinde component yeniden mount olur
      className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto mt-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {products.map(
        (product, index) =>
          product.isAvailable && (
            <motion.div
              key={product._id} // product._id kullanmak daha güvenli
              className="grid md:grid-cols-4 grid-cols-3 gap-2 md:gap-4 border md:p-2 p-1 md:rounded-xl rounded-md shadow hover:shadow-md transition"
              variants={itemVariants}
            >
              {/* Görsel */}
              <div className="col-span-1">
                <Image
                  src={product.image ? product.image : "/bg_patis.png"}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover md:w-40 md:h-40 w-32 h-32"
                />
              </div>

              {/* Bilgiler */}
              <div className="md:col-span-3 col-span-2 flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="lg:text-lg font-semibold font-family-marcellus">
                    {product.name}
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

                <div className="flex items-center gap-1 md:gap-2">
                  {product.isVegan && (
                    <Tooltip>
                      <TooltipTrigger>
                        <FaLeaf
                          className="text-green-400 md:mt-2 mt-1"
                          size={22}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Vegan</TooltipContent>
                    </Tooltip>
                  )}
                  {product.isVegetarian && (
                    <Tooltip>
                      <TooltipTrigger>
                        <FaCarrot
                          className="text-green-700 md:mt-2 mt-1"
                          size={22}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Vejetaryen</TooltipContent>
                    </Tooltip>
                  )}
                  {product.isGlutenFree && (
                    <Tooltip>
                      <TooltipTrigger>
                        <FaWheatAwn
                          className="text-amber-600 md:mt-2 mt-1"
                          size={22}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Glutensiz</TooltipContent>
                    </Tooltip>
                  )}

                  {product.isSpicy && (
                    <Tooltip>
                      <TooltipTrigger>
                        <FaFireFlameCurved
                          className="text-red-500 md:mt-2 mt-1"
                          size={22}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Acılı</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </motion.div>
          )
      )}
    </motion.div>
  );
};

export default MenuProducts;
