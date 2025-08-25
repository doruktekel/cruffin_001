import HoursEditor from "@/components/dashboard/hours/HoursEditor";
import { WorkingHoursModel } from "@/lib/models/workingHoursModel";
import connectMongo from "@/lib/mongoDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const HoursPage = async () => {
  await connectMongo();
  const workingHours = await WorkingHoursModel.find({}).lean();

  // MongoDB ObjectId'lerini string'e çevir
  const serializedWorkingHours = workingHours.map((hour) => ({
    ...hour,
    _id: hour._id.toString(),
  }));

  return <HoursEditor workingHours={serializedWorkingHours} />;
};

export default HoursPage;
