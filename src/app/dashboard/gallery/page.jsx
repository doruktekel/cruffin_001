import GalleryButtons from "@/components/dashboard/gallery/GalleryButtons";
import { GalleryModel } from "@/lib/models/galleryModel";
import connectMongo from "@/lib/mongoDb";

const GalleryPage = async () => {
  await connectMongo();

  const galleries = await GalleryModel.find({}).lean();
  const newGalleries = galleries
    .sort((a, b) => a.order - b.order)
    .map((gallery) => ({
      ...gallery,
      _id: gallery._id.toString(),
    }));

  return <GalleryButtons newGalleries={newGalleries} />;
};

export default GalleryPage;
