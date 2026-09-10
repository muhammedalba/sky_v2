"use client";

import { useTranslations } from "next-intl";
import { LocalizedString } from "@/types";
import { useTrans } from "@/shared/hooks/useTrans";
import {
  SearchableSelect,
  SearchOption,
} from "@/shared/ui/form/SearchableSelect";
import { SearchableMultiSelect } from "@/shared/ui/form/SearchableMultiSelect";
import {
  BrandsIcon,
  CategoriesIcon,
  SubCategoriesIcon,
  UsersIcon,
} from "@/shared/ui/Icons";

interface ProductTaxonomyPanelProps {
  locale: string;
  tError: (msg?: string) => string | undefined;

  // Current form values (watched)
  watchedCategory: string;
  watchedBrand: string | undefined;
  watchedSupplier: string | undefined;

  // Errors
  categoryError?: string;
  subCategoryError?: string;

  // SubCategory selection
  selectedSubCategories: SearchOption[];
  onSubCategorySelect: (opt: SearchOption) => void;
  onSubCategoryRemove: (id: string) => void;

  // Value setters
  onCategoryChange: (id: string) => void;
  onBrandChange: (id: string) => void;
  onSupplierChange: (id: string) => void;

  // Initial display labels (only needed in Edit mode)
  initialBrandLabel?: string | undefined;
  initialSupplierLabel?: string | undefined;
  initialCategoryLabel?: string | undefined;

  // Data + search callbacks from useProductFormOptions
  categoriesData: { data?: SearchOption[] } | undefined;
  isCategoriesFetching: boolean;
  onCategorySearch: (term: string) => void;
  onCategoryOpen: () => void;

  brandsData: { data?: SearchOption[] } | undefined;
  isBrandsFetching: boolean;
  onBrandSearch: (term: string) => void;
  onBrandOpen: () => void;

  suppliersData: { data?: SearchOption[] } | undefined;
  isSuppliersFetching: boolean;
  onSupplierSearch: (term: string) => void;
  onSupplierOpen: () => void;

  subCategoriesData: { data?: SearchOption[] } | undefined;
  isSubCategoriesFetching: boolean;
  onSubCategorySearch: (term: string) => void;
  onSubCategoryOpen: () => void;
}

/**
 * Shared "Taxonomy" card — Brand, Supplier, Category, SubCategory selects.
 * Used in both CreateProductForm and EditProductForm.
 */
export function ProductTaxonomyPanel({
  locale,
  tError,
  watchedCategory,
  watchedBrand,
  watchedSupplier,
  categoryError,
  subCategoryError,
  selectedSubCategories,
  onSubCategorySelect,
  onSubCategoryRemove,
  onCategoryChange,
  onBrandChange,
  onSupplierChange,
  initialBrandLabel,
  initialSupplierLabel,
  initialCategoryLabel,
  categoriesData,
  isCategoriesFetching,
  onCategorySearch,
  onCategoryOpen,
  brandsData,
  isBrandsFetching,
  onBrandSearch,
  onBrandOpen,
  suppliersData,
  isSuppliersFetching,
  onSupplierSearch,
  onSupplierOpen,
  subCategoriesData,
  isSubCategoriesFetching,
  onSubCategorySearch,
  onSubCategoryOpen,
}: ProductTaxonomyPanelProps) {
  const t = useTranslations("products.form");
  const getTrans = useTrans();

  return (
    <div className="rounded-xl border border-border/50 bg-card ">
      <div className="flex items-center gap-2 border-b border-border/50 bg-accent/60 rounded-t-lg p-4">
        <CategoriesIcon className="w-5 h-5 text-warning" />
        <div>
          <h3 className="font-bold text-sm title-gradient">{t("taxonomy")}</h3>
          <p className="text-xs text-muted-foreground">{t("taxonomyDesc")}</p>
        </div>
      </div>

      <div
        className="space-y-4 p-4"
      >
        {/* Brand */}
        <SearchableSelect
          icon={BrandsIcon}
          iconColor="text-rose-500"
          label={t("brand")}
          value={watchedBrand ?? ""}
          isLoading={isBrandsFetching}
          options={(brandsData?.data as unknown as SearchOption[]) || []}
          getDisplayValue={(opt: SearchOption) =>
            getTrans(opt.name as LocalizedString)
          }
          onSearch={onBrandSearch}
          onOpen={onBrandOpen}
          onSelect={onBrandChange}
          initialDisplayValue={initialBrandLabel}
          createLink={`/${locale}/dashboard/brands`}
          className="mt-1"
        />

        {/* Supplier */}
        <SearchableSelect
          icon={UsersIcon}
          iconColor="text-teal-500"
          label={t("supplier")}
          value={watchedSupplier ?? ""}
          isLoading={isSuppliersFetching}
          options={(suppliersData?.data as unknown as SearchOption[]) || []}
          getDisplayValue={(opt: SearchOption) => String(opt.name)}
          onSearch={onSupplierSearch}
          onOpen={onSupplierOpen}
          onSelect={onSupplierChange}
          initialDisplayValue={initialSupplierLabel}
          createLink={`/${locale}/dashboard/suppliers`}
        />

        {/* Main Category */}
        <SearchableSelect
          icon={CategoriesIcon}
          iconColor="text-amber-500"
          label={t("mainCategory")}
          value={watchedCategory || ""}
          isLoading={isCategoriesFetching}
          options={(categoriesData?.data as unknown as SearchOption[]) || []}
          getDisplayValue={(opt: SearchOption) =>
            getTrans(opt.name as LocalizedString)
          }
          onSearch={onCategorySearch}
          onOpen={onCategoryOpen}
          onSelect={onCategoryChange}
          error={tError(categoryError)}
          initialDisplayValue={initialCategoryLabel}
          createLink={`/${locale}/dashboard/categories`}
        />

        {/* Sub Categories */}
        <SearchableMultiSelect
          icon={SubCategoriesIcon}
          iconColor="text-orange-500"
          label={
            watchedCategory ? t("searchSubCategory") : t("selectCategoryFirst")
          }
          disabled={!watchedCategory}
          error={tError(subCategoryError)}
          isLoading={isSubCategoriesFetching}
          options={(subCategoriesData?.data as unknown as SearchOption[]) || []}
          selectedOptions={selectedSubCategories}
          getDisplayValue={(opt: SearchOption) =>
            getTrans(opt.name as LocalizedString)
          }
          onSearch={onSubCategorySearch}
          onOpen={onSubCategoryOpen}
          onSelect={onSubCategorySelect}
          onRemove={(id: string) => onSubCategoryRemove(id)}
          createLink={`/${locale}/dashboard/sub-categories`}
        />
      </div>
    </div>
  );
}
