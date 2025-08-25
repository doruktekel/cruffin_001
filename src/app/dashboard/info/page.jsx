import InfoEditor from "@/components/dashboard/info/InfoEditor";
import { InfoModel } from "@/lib/models/infoModel";
import connectMongo from "@/lib/mongoDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const InfoPage = async () => {
  await connectMongo();
  const getAllInfos = await InfoModel.find({}).lean();

  const newInfos = getAllInfos.map((info) => ({
    ...info,
    _id: info._id.toString(),
  }));

  return <InfoEditor infos={newInfos} />;
};

export default InfoPage;
