import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { FilterDrawer } from "@/shared/ui/FilterDrawer";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  SearchableSelect,
  SearchOption,
} from "@/shared/ui/form/SearchableSelect";
import { Category, SubCategory, Brand, LocalizedString } from "@/types";
import { useTrans } from "@/shared/hooks/useTrans";
import { ProductFilters } from "@/features/products/hooks/useProductFilters";
import {
  TagIcon as Tag,
  BriefcaseIcon as Briefcase,
  LayersIcon as Layers,
  PaletteIcon as Palette,
  CoinsIcon as Coins,
} from "@/shared/ui/Icons";

interface ProductsFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilterCount: number;
  filters: ProductFilters;
  categoriesList: Category[];
  subCategoriesList: SubCategory[];
  brandsList: Brand[];
  setFilter: (key: keyof ProductFilters, value: string | number | null) => void;
  onClearAll: () => void;
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function ProductsFilterDrawer({
  isOpen,
  onClose,
  activeFilterCount,
  filters,
  categoriesList,
  subCategoriesList,
  brandsList,
  setFilter,
  onClearAll,
}: ProductsFilterDrawerProps) {
  const t = useTranslations("store.productsPage");
  const commonT = useTranslations("common.buttons");
  const getTrans = useTrans();

  const [categorySearch, setCategorySearch] = useState("");
  const [subCategorySearch, setSubCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const [prevFilters, setPrevFilters] = useState(filters);
  const [localMinPrice, setLocalMinPrice] = useState(filters["pricerange[min]"] || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(filters["pricerange[max]"] || "");
  const [localColor, setLocalColor] = useState(filters.color || "");

  if (prevFilters !== filters) {
    setPrevFilters(filters);
    setLocalMinPrice(filters["pricerange[min]"] || "");
    setLocalMaxPrice(filters["pricerange[max]"] || "");
    setLocalColor(filters.color || "");
  }

  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handlePriceOrColorChange = (
    key: "pricerange[min]" | "pricerange[max]" | "color",
    val: string,
  ) => {
    if (key === "pricerange[min]") setLocalMinPrice(val);
    if (key === "pricerange[max]") setLocalMaxPrice(val);
    if (key === "color") setLocalColor(val);

    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
    }
    debounceTimersRef.current[key] = setTimeout(() => {
      setFilter(key, val.trim() ? val.trim() : null);
      delete debounceTimersRef.current[key];
    }, 500);
  };

  const filteredCategoryOptions = useMemo(
    () =>
      categoriesList.filter((c) =>
        getTrans(c.name).toLowerCase().includes(categorySearch.toLowerCase()),
      ) as unknown as SearchOption[],
    [categoriesList, categorySearch, getTrans],
  );
  const filteredSubCategoryOptions = useMemo(
    () =>
      subCategoriesList.filter((c) =>
        getTrans(c.name).toLowerCase().includes(subCategorySearch.toLowerCase()),
      ) as unknown as SearchOption[],
    [subCategoriesList, subCategorySearch, getTrans],
  );
  const filteredBrandOptions = useMemo(
    () =>
      brandsList.filter((b) =>
        getTrans(b.name).toLowerCase().includes(brandSearch.toLowerCase()),
      ) as unknown as SearchOption[],
    [brandsList, brandSearch, getTrans],
  );

  const handleClear = () => {
    Object.values(debounceTimersRef.current).forEach((timer) => clearTimeout(timer));
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalColor("");
    setCategorySearch("");
    setSubCategorySearch("");
    setBrandSearch("");
    onClearAll();
  };

  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("filtersTitle")}
      activeCount={activeFilterCount}
      subtitle={
        activeFilterCount > 0
          ? `${activeFilterCount} ${t("activeFilters")}`
          : t("noActiveFilters")
      }
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="destructive"
            onClick={handleClear}
            className="flex-1 h-11 font-bold rounded-xl"
          >
            {commonT("clearAll")}
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 h-11 font-bold rounded-xl shadow-md shadow-primary/20"
          >
            {commonT("applyFilters")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <FilterSection title={t("categories")}>
          <SearchableSelect
            label={t("categories")}
            icon={Tag}
            value={filters.category}
            options={filteredCategoryOptions}
            getDisplayValue={(opt) => getTrans(opt.name as LocalizedString)}
            onSearch={setCategorySearch}
            onSelect={(id) => {
              setFilter("category", id || null);
              setFilter("SubCategories", null);
            }}
            className="mt-2"
          />
          <SearchableSelect
            label={t("subCategories")}
            icon={Layers}
            value={filters.SubCategories}
            options={filteredSubCategoryOptions}
            getDisplayValue={(opt) => getTrans(opt.name as LocalizedString)}
            onSearch={setSubCategorySearch}
            onSelect={(id) => setFilter("SubCategories", id || null)}
            className="mt-5"
          />
          <SearchableSelect
            label={t("brands")}
            icon={Briefcase}
            value={filters.brand}
            options={filteredBrandOptions}
            getDisplayValue={(opt) => getTrans(opt.name as LocalizedString)}
            onSearch={setBrandSearch}
            onSelect={(id) => setFilter("brand", id || null)}
            className="mt-5"
          />
        </FilterSection>

        <FilterSection title={t("priceRange")}>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              icon={Coins}
              label={t("minPrice")}
              value={localMinPrice}
              onChange={(e) => handlePriceOrColorChange("pricerange[min]", e.target.value)}
              className="h-10"
            />
            <Input
              type="number"
              icon={Coins}
              label={t("maxPrice")}
              value={localMaxPrice}
              onChange={(e) => handlePriceOrColorChange("pricerange[max]", e.target.value)}
              className="h-10"
            />
          </div>
        </FilterSection>

        <FilterSection title={t("color")}>
          <Input
            icon={Palette}
            placeholder={t("colorPlaceholder")}
            value={localColor}
            onChange={(e) => handlePriceOrColorChange("color", e.target.value)}
            className="h-10"
          />
        </FilterSection>
      </div>
    </FilterDrawer>
  );
}