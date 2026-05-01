'use client';

import { useState } from 'react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useSubCategories } from '@/features/categories/hooks/useSubCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';

/**
 * Encapsulates all the search state + lazy data-fetching required by the
 * taxonomy selects (Brand, Supplier, Category, SubCategory).
 * Used by both CreateProductForm and EditProductForm.
 */
export function useProductFormOptions(watchedCategory: string) {
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandOpen, setIsBrandOpen] = useState(false);

  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);

  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);

  const { data: categoriesData, isFetching: isCategoriesFetching } = useCategories(
    { keywords: categorySearch },
    { enabled: isCategoryOpen },
  );

  const { data: brandsData, isFetching: isBrandsFetching } = useBrands(
    { keywords: brandSearch },
    { enabled: isBrandOpen },
  );

  const { data: suppliersData, isFetching: isSuppliersFetching } = useSuppliers(
    { keywords: supplierSearch },
    { enabled: isSupplierOpen },
  );

  const { data: subCategoriesData, isFetching: isSubCategoriesFetching } = useSubCategories(
    { keywords: subCategorySearch, category: watchedCategory },
    { enabled: isSubCategoryOpen && !!watchedCategory },
  );

  return {
    // Category
    categoriesData,
    isCategoriesFetching,
    onCategorySearch: (term: string) => setCategorySearch(term),
    onCategoryOpen: () => setIsCategoryOpen(true),

    // Brand
    brandsData,
    isBrandsFetching,
    onBrandSearch: (term: string) => setBrandSearch(term),
    onBrandOpen: () => setIsBrandOpen(true),

    // Supplier
    suppliersData,
    isSuppliersFetching,
    onSupplierSearch: (term: string) => setSupplierSearch(term),
    onSupplierOpen: () => setIsSupplierOpen(true),

    // SubCategory
    subCategoriesData,
    isSubCategoriesFetching,
    onSubCategorySearch: (term: string) => setSubCategorySearch(term),
    onSubCategoryOpen: () => setIsSubCategoryOpen(true),
  };
}
