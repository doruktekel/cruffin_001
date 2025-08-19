import InfoEditor from "@/components/dashboard/info/InfoEditor";
import { InfoModel } from "@/lib/models/infoModel";

import connectMongo from "@/lib/mongoDb";
import React from "react";

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
