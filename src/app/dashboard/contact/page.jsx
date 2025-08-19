import ContactEditor from "@/components/dashboard/contact/ContactEditor";
import { ContactModel } from "@/lib/models/contactModel";
import connectMongo from "@/lib/mongoDb";

const ContactPage = async () => {
  await connectMongo();

  const contactInfo = await ContactModel.findOne({}).lean();

  const serializedContact = contactInfo
    ? { ...contactInfo, _id: contactInfo._id.toString() }
    : null;

  return <ContactEditor contactInfo={serializedContact} />;
};

export default ContactPage;
