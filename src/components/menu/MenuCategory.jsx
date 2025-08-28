"use client";

import React, { useRef } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MenuCategory = ({ categories, activeCategory, setActiveCategory }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Aktif kategoriyi kontrol etmek için daha güvenilir bir fonksiyon
  const isActiveCategory = (category) => {
    if (typeof activeCategory === "string") {
      return activeCategory === category._id;
    }
    return activeCategory?._id === category._id;
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col">
      <div className="flex items-center gap-1 md:gap-2">
        {/* Sol ok - sadece desktop'ta göster */}
        <button onClick={scrollLeft} className="md:p-1 cursor-pointer">
          <ChevronLeft className="md:w-12 md:h-12 w-10 h-10 text-amber-700" />
        </button>

        {/* Kaydırılabilir kategori listesi */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-1 flex-1 scroll-smooth"
          style={{
            // Mobilde dokunmatik kaydırmayı aktif et
            touchAction: "pan-x",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categories.map((category) => (
            <Button
              key={category._id}
              onClick={() => setActiveCategory(category._id)}
              variant="ghost"
              className={`text-base lg:text-xl whitespace-nowrap font-bold font-family-playfair md:px-4 px-2 md:py-2 py-1 border-b-2 transition-all duration-300 cursor-pointer capitalize flex-shrink-0  ${
                isActiveCategory(category)
                  ? "border-amber-700 text-amber-700 bg-amber-50 shadow-sm"
                  : "border-transparent text-gray-600 hover:text-amber-700 hover:bg-amber-25 hover:border-amber-300"
              }`}
            >
              {category.name.toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Sağ ok - sadece desktop'ta göster */}
        <button onClick={scrollRight} className="md:p-1 cursor-pointer">
          <ChevronRight className="md:w-12 md:h-12 w-10 h-10 text-amber-700" />
        </button>
      </div>

      {/* Mobil için kaydırma ipucu - isteğe bağlı */}
      <div className="md:hidden text-center mt-2">
        <p className="text-xs text-gray-500">
          ← Kategoriler arasında geçiş yapmak için kaydırın →
        </p>
      </div>
    </div>
  );
};

export default MenuCategory;
