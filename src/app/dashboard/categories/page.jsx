import CategoryButtons from "@/components/dashboard/categories/CategoryButtons";
import { CategoryModel } from "@/lib/models/categoryModel";
import connectMongo from "@/lib/mongoDb";

// ✅ BU SATIRI EKLE - Server component'in her zaman yeniden çalışmasını sağlar
export const dynamic = "force-dynamic";
export const revalidate = 0; // ✅ BU SATIRI DA EKLE

const CategoriesPage = async () => {
  await connectMongo();

  const categories = await CategoryModel.find({}).lean();

  const newCategories = categories
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      ...category,
      _id: category._id.toString(),
    }));

  return <CategoryButtons newCategories={newCategories} />;
};

export default CategoriesPage;
