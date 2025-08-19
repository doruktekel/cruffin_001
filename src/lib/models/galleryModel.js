import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    images: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const GalleryModel =
  mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);
