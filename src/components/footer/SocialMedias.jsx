import connectMongo from "@/lib/mongoDb";
import SocialMedia from "./SocialMedia";
import { SocialModel } from "@/lib/models/socialModel";

const SocialMedias = async () => {
  await connectMongo();
  const totalSocialMedias = await SocialModel.find({})
    .sort({ order: 1 })
    .lean();

  const socialMedias = totalSocialMedias.map((socialMedia) => ({
    ...socialMedia,
    _id: socialMedia._id.toString(),
  }));

  return <SocialMedia socialMedias={socialMedias} />;
};

export default SocialMedias;
