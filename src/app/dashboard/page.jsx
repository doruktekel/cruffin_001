import { Suspense } from "react";
import { TabsContent } from "@/components/ui/tabs";
import CategoryAnalytics from "@/components/dashboard/charts/CategoryAnalytics";
import ProductAnalytics from "@/components/dashboard/charts/ProductAnalytics";
import UserAnalytics from "@/components/dashboard/charts/UserAnalytics";
import UserTabWrapper from "@/components/dashboard/charts/UserTabWrapper";
import RoleBasedTabs from "@/components/dashboard/charts/RoleBasedTabs";

// Server-side veri çekme fonksiyonu
async function getDashboardStats() {
  try {
    // Dynamic import ile model'leri al
    const [
      { UserModel },
      { ProductModel },
      { CategoryModel },
      { default: connectMongo },
    ] = await Promise.all([
      import("@/lib/models/userModel"),
      import("@/lib/models/productModel"),
      import("@/lib/models/categoryModel"),
      import("@/lib/mongoDb"),
    ]);

    // Database bağlantısını kur
    await connectMongo();

    // Paralel veri çekme
    const [categories, products, users] = await Promise.all([
      CategoryModel.find({}).lean().exec(),
      ProductModel.find({}).populate("category").lean().exec(),
      UserModel.find({}).lean().exec(),
    ]);

    // Next.js için serialize et
    return {
      categories: JSON.parse(JSON.stringify(categories || [])),
      products: JSON.parse(JSON.stringify(products || [])),
      users: JSON.parse(JSON.stringify(users || [])),
    };
  } catch (error) {
    console.error("Dashboard verileri alınamadı:", error);
    return { categories: [], products: [], users: [] };
  }
}

// Loading Component'leri
function CategoryLoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 sm:h-24 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-60 sm:h-80 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function ProductLoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 sm:h-24 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-60 sm:h-80 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// Ana Server Component
const DashboardPage = async () => {
  // Server-side'da veri çek
  const { categories, products, users } = await getDashboardStats();

  return (
    <div className="flex-1 space-y-2 p-2 sm:p-4 pt-6 max-w-full overflow-x-hidden">
      <RoleBasedTabs className="w-full">
        <TabsContent value="categories" className="space-y-4 w-full">
          <Suspense fallback={<CategoryLoadingSkeleton />}>
            <div className="w-full overflow-x-auto">
              <CategoryAnalytics categories={categories} products={products} />
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 w-full">
          <Suspense fallback={<ProductLoadingSkeleton />}>
            <div className="w-full overflow-x-auto">
              <ProductAnalytics products={products} />
            </div>
          </Suspense>
        </TabsContent>

        <UserTabWrapper users={users} UserAnalyticsComponent={UserAnalytics} />
      </RoleBasedTabs>
    </div>
  );
};

export default DashboardPage;
