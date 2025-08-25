import { ContactModel } from "@/lib/models/contactModel";
import connectMongo from "@/lib/mongoDb";
import React from "react";
import Footer from "./Footer";
import { WorkingHoursModel } from "@/lib/models/workingHoursModel";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const FooterWrapper = async () => {
  await connectMongo();

  const contactInfo = await ContactModel.findOne({}).lean();

  const serializedContact = contactInfo
    ? { ...contactInfo, _id: contactInfo._id.toString() }
    : null;

  const workingHours = await WorkingHoursModel.find({}).lean();

  const newWorkingHours = workingHours.map((hour) => ({
    ...hour,
    _id: hour._id.toString(),
  }));

  return <Footer contactInfo={serializedContact} hours={newWorkingHours} />;
};

export default FooterWrapper;
