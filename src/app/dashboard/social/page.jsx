import SocialButtons from "@/components/dashboard/social/SocialButtons";
import { SocialModel } from "@/lib/models/socialModel";
import connectMongo from "@/lib/mongoDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SocialPage = async () => {
  await connectMongo();

  const socials = await SocialModel.find({}).lean();

  const newSocials = socials
    .sort((a, b) => a.order - b.order) // order'a göre küçükten büyüğe sırala
    .map((social) => ({
      ...social,
      _id: social._id.toString(), // ObjectId'yi string'e çevir
    }));

  return <SocialButtons newSocials={newSocials} />;
};

export default SocialPage;
