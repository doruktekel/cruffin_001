import ProductButtons from "@/components/dashboard/products/ProductButtons";
import { CategoryModel } from "@/lib/models/categoryModel";
import { ProductModel } from "@/lib/models/productModel";
import connectMongo from "@/lib/mongoDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ProductsPage = async () => {
  await connectMongo();

  const products = await ProductModel.find({}).lean();

  const newProducts = products
    .sort((a, b) => a.order - b.order)
    .map((product) => ({
      ...product,
      _id: product._id.toString(),
      category: product.category?.toString(),
    }));

  const categories = await CategoryModel.find({}).lean();

  const newCategories = categories
    .sort((a, b) => a.order - b.order) // order'a göre küçükten büyüğe sırala
    .map((category) => ({
      ...category,
      _id: category._id.toString(), // ObjectId'yi string'e çevir
    }));

  return (
    <ProductButtons newProducts={newProducts} categories={newCategories} />
  );
};

export default ProductsPage;
