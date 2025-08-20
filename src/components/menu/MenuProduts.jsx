"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

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

                <div className="flex gap-1 md:gap-2">
                  {product.isVegan && (
                    <p className="text-sm text-green-500 md:mt-2 mt-1 line-clamp-3">
                      Vegan
                    </p>
                  )}
                  {product.isVegetarian && (
                    <p className="text-sm text-green-700 md:mt-2 mt-1 line-clamp-3">
                      Vejeteryan
                    </p>
                  )}
                  {product.isGlutenFree && (
                    <p className="text-sm text-gray-600 md:mt-2 mt-1 line-clamp-3">
                      Glutensiz
                    </p>
                  )}
                  {product.isSpicy && (
                    <p className="text-sm text-red-800 md:mt-2 mt-1 line-clamp-3">
                      Acili
                    </p>
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
