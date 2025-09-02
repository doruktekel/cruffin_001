"use client";

import Image from "next/image";
import React, { useState } from "react";
import MenuHeader from "./MenuHeader";
import MenuCategory from "./MenuCategory";
import MenuProducts from "./MenuProduts";

const MenuWrapper = ({ categories, products }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]._id);

  return (
    <section className="relative w-full p-2 md:px-5 scroll-mt-32" id="menu">
      <div className="absolute top-100 left-10 w-60 opacity-10 -z-10 pointer-events-none">
        <Image
          src="/kurucilek.png"
          alt="parallax1"
          width={280}
          height={280}
          className="w-full h-auto"
        />
      </div>

      <div className="absolute top-140 right-0 w-72 opacity-10 -z-10 pointer-events-none">
        <Image
          src="/kurucuk.png"
          alt="parallax2"
          width={300}
          height={300}
          className="w-full h-auto"
        />
      </div>

      <div className="absolute bottom-120 left-28 w-64 opacity-10 -z-10 pointer-events-none">
        <Image
          src="/kurucuk.png"
          alt="parallax3"
          width={260}
          height={260}
          className="w-full h-auto"
        />
      </div>

      <div className="absolute bottom-60 right-40 w-52 opacity-10 -z-10 pointer-events-none">
        <Image
          src="/kurucilek.png"
          alt="parallax4"
          width={260}
          height={260}
          className="w-full h-auto"
        />
      </div>
      <MenuHeader />
      <div className="w-full h-[0.5px]  bg-amber-700  my-1"></div>
      <MenuCategory
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="w-full h-[0.5px] bg-amber-700 my-1"></div>
      <MenuProducts
        products={products.filter(
          (p) => p.category === activeCategory // örnek filtreleme
        )}
        activeCategory={activeCategory} // Bu prop'u ekliyoruz
      />
    </section>
  );
};

export default MenuWrapper;
