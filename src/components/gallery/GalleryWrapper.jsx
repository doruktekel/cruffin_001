import { GalleryModel } from "@/lib/models/galleryModel";
import connectMongo from "@/lib/mongoDb";
import React from "react";
import InfiniteScrollGallery from "./InfiniteScrollGallery";

const GalleryWrapper = async () => {
  try {
    await connectMongo();

    const galleries = await GalleryModel.find({ isActive: true }) // Direkt veritabanında filtrele
      .sort({ order: 1 }) // Direkt veritabanında sırala
      .lean();

    const newGalleries = galleries.map((gallery) => ({
      ...gallery,
      _id: gallery._id.toString(),
    }));

    return <InfiniteScrollGallery images={newGalleries} />;
  } catch (error) {
    return <InfiniteScrollGallery images={[]} />; // Fallback
  }
};

export default GalleryWrapper;
