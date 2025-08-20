"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

const InfiniteScrollGallery = ({ images = [] }) => {
  // Default value
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollLeft = 0;
    const scrollSpeed = 0.5;

    const step = () => {
      if (!container) return;

      scrollLeft += scrollSpeed;
      container.scrollLeft = scrollLeft;

      if (scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
        scrollLeft = 0;
        container.scrollLeft = 0;
      }

      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, []);

  const repeatedImages = Array.from({ length: 20 }, () => images).flat();

  return (
    <section
      className="w-full overflow-x-scroll no-scrollbar md:mt-36 mt-20 scroll-mt-32"
      ref={containerRef}
      id="gallery"
    >
      <div className="flex w-fit">
        {repeatedImages.map((gallery, index) => (
          <div
            key={`${gallery._id}-${index}`}
            className="md:w-[400px] md:h-[500px] w-[300px] h-[400px] mx-2 relative shrink-0 rounded-t-full overflow-hidden"
          >
            <Image
              src={gallery.images}
              alt={`gallery-${index}`}
              fill
              className="object-cover"
              sizes="300px"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default InfiniteScrollGallery;
