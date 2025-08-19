"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";

const SocialMedia = ({ socialMedias }) => {
  const [socials, setSocials] = useState(socialMedias);

  return (
    <div className="flex justify-center items-center gap-8 text-lg font-family-marcellus">
      {socials &&
        socials.map((item) => {
          const IconComponent =
            Icons[
              item.platform.charAt(0).toUpperCase() + item.platform.slice(1)
            ];
          return (
            <Link
              key={item._id}
              href={item.url}
              target="_blank"
              className="hover:opacity-60 capitalize flex flex-col justify-center items-center"
            >
              {IconComponent && <IconComponent size={20} />}
              {item.platform}
            </Link>
          );
        })}
    </div>
  );
};

export default SocialMedia;
