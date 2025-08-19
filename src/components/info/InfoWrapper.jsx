import { InfoModel } from "@/lib/models/infoModel";
import connectMongo from "@/lib/mongoDb";
import InfoItems from "./InfoItems";

// Server Component (çünkü veriyi async olarak çekiyorsun)
const InfoWrapper = async () => {
  await connectMongo();

  const getAllInfos = await InfoModel.find({ isActive: true }).lean();
  const infos = getAllInfos.map((info) => ({
    ...info,
    _id: info._id.toString(),
  }));

  return <InfoItems infos={infos} />;
};

export default InfoWrapper;
