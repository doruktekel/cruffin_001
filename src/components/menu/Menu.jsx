import connectMongo from "@/lib/mongoDb";

import { ProductModel } from "@/lib/models/productModel";
import MenuWrapper from "./MenuWrapper";
import { CategoryModel } from "@/lib/models/categoryModel";
const MenuPage = async () => {
  await connectMongo();
  const categories = await CategoryModel.find({}).lean();
  const products = await ProductModel.find({}).lean();

  const newCategories = categories
    .sort((a, b) => a.order - b.order) // order'a göre küçükten büyüğe sırala
    .map((category) => ({
      ...category,
      _id: category._id.toString(), // ObjectId'yi string'e çevir
    }));

  const newProducts = products
    .sort((a, b) => a.order - b.order)
    .map((product) => ({
      ...product,
      _id: product._id.toString(),
      category: product.category.toString(),
    }));

  return <MenuWrapper categories={newCategories} products={newProducts} />;
};

export default MenuPage;
