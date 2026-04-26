'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Badge } from '@/shared/ui/Badge';
import { useTranslations } from 'next-intl';

interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  variantCount: number;
}

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  const t = useTranslations('products.statistics.performer');
  const common = useTranslations('products.fields');

  // Find max sold to calculate relative bar width
  const maxSold = products.length > 0 ? Math.max(...products.map(p => p.totalSold)) : 0;

  return (
    <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-secondary/50 shadow-xl lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('topSelling')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{common('name')}</TableHead>
              <TableHead className="text-right">{t('soldUnits')}</TableHead>
              <TableHead>{common('price')}</TableHead>
              <TableHead className="text-right">{t('stockLeft')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="font-medium">
                  <div>
                    {product.productName}
                    <div className="mt-1 flex items-center gap-2">
                       <div className="h-1.5 w-full max-w-[100px] rounded-full bg-secondary dark:bg-secondary/80 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(product.totalSold / maxSold) * 100}%` }}
                          />
                       </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="font-bold">
                    {product.totalSold}
                  </Badge>
                </TableCell>
                <TableCell>
                  {product.minPrice === product.maxPrice 
                    ? `${product.minPrice}` 
                    : `${product.minPrice} - ${product.maxPrice}`}
                </TableCell>
                <TableCell className="text-right">
                  <span className={product.totalStock < 10 ? "text-destructive font-bold" : "text-success"}>
                    {product.totalStock}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
