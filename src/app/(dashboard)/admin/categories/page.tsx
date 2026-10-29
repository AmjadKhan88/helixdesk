import { CategoriesManager } from "@/components/admin/categories-manager";
import { listCategoriesWithCounts } from "@/lib/queries/admin";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  return <CategoriesManager categories={await listCategoriesWithCounts()} />;
}
