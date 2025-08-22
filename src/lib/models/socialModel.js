import mongoose from "mongoose";

const SocialSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "facebook",
        "twitter",
        "instagram",
        "youtube",
        "tiktok",
        "linkedin",
        "pinterest",
        "reddit",
        "tumblr",
        "vimeo",
        "spotify",
      ],
    },
    url: {
      type: String,
      required: true,
      match: [
        /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/,
        "Lütfen geçerli bir URL girin",
      ],
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SocialModel =
  mongoose.models.Social || mongoose.model("Social", SocialSchema);
