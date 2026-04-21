import { ProductAnalyticsContainer } from '@/features/products/components/ProductAnalytics/ProductAnalyticsContainer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Analytics | Sky Galaxy Dashboard',
  description: 'View detailed performance metrics and inventory insights for your electronic store.',
};

export default function StatisticsPage() {
  return (
    <div className="p-6 lg:p-10">
      <ProductAnalyticsContainer />
    </div>
  );
}
