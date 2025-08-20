import UsersEditor from "@/components/dashboard/users/UsersEditor";
import { UserModel } from "@/lib/models/userModel";
import connectMongo from "@/lib/mongoDb";
import { revalidatePath } from "next/cache";

const UsersPage = async () => {
  await connectMongo();

  const users = await UserModel.find({ role: "user" }).lean();

  const newUsers = users.map((user) => ({
    ...user,
    _id: user._id.toString(),
  }));

  revalidatePath("/dashboard/users");

  return <UsersEditor users={newUsers} />;
};

export default UsersPage;
