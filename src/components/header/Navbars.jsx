import Link from "next/link";
import React from "react";

const Navbars = () => {
  return (
    <nav>
      <ul className=" text-amber-700 opacity-80 px-2 py-2 flex justify-center items-center gap-4 md:gap-14 underline-offset-8 bg-transparent z-10 font-bold">
        {/* <li>
          <Link
            href="#home"
            className="relative group text-lg md:text-2xl  font-family-playfair"
          >
            Ana Sayfa
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-amber-700 group-hover:w-full transition-all duration-300 ease-in-out"></span>
          </Link>
        </li> */}

        <li>
          <Link
            href="#menu"
            className="relative group text-lg md:text-xl font-family-playfair"
          >
            Menü
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-amber-700 group-hover:w-full transition-all duration-300 ease-in-out"></span>
          </Link>
        </li>

        <li>
          <Link
            href="#info"
            className="relative group text-lg md:text-xl font-family-playfair"
          >
            Hakkımızda
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-amber-700 group-hover:w-full transition-all duration-300 ease-in-out"></span>
          </Link>
        </li>

        <li>
          <Link
            href="#gallery"
            className="relative group text-lg md:text-xl font-family-playfair"
          >
            Galeri
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-amber-700 group-hover:w-full transition-all duration-300 ease-in-out"></span>
          </Link>
        </li>

        <li>
          <Link
            href={"#contact"}
            className="relative group text-lg md:text-xl font-family-playfair"
          >
            Iletişim
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-amber-700 group-hover:w-full transition-all duration-300 ease-in-out"></span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbars;
