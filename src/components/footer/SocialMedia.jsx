"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaFacebook,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedin,
  FaPinterest,
  FaReddit,
  FaTumblr,
  FaVimeo,
  FaSpotify,
} from "react-icons/fa6";

const SocialMedia = ({ socialMedias }) => {
  const [socials, setSocials] = useState(socialMedias);

  // Icon mapping objesi
  const iconMap = {
    facebook: FaFacebook,
    twitter: FaXTwitter,
    instagram: FaInstagram,
    youtube: FaYoutube,
    tiktok: FaTiktok,
    linkedin: FaLinkedin,
    pinterest: FaPinterest,
    reddit: FaReddit,
    tumblr: FaTumblr,
    vimeo: FaVimeo,
    spotify: FaSpotify,
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-8 text-lg font-family-marcellus">
      {socials &&
        socials.map((item) => {
          const IconComponent = iconMap[item.platform.toLowerCase()];
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
