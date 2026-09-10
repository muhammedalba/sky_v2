"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  editProductSchema,
  EditProductInput,
  EditProductFormInput,
} from "@/features/products/product.schema";
import { useUpdateProduct } from "@/features/products/hooks/useProducts";
import { useTrans } from "@/shared/hooks/useTrans";
import { useToast } from "@/shared/hooks/useToast";
import { Product, ProductVariant, SubCategory } from "@/types";
import { SearchOption } from "@/shared/ui/form/SearchableSelect";

import FormStickyHeader from "@/shared/ui/dashboard/FormStickyHeader";
import AttributeBuilder, {
  AttributeDefinition,
} from "./shared/AttributeBuilder";
import VariantTable, {
  VariantRow,
  ShippingProfileRow,
} from "./shared/VariantTable";
import { ProductBasicInfo } from "./shared/ProductBasicInfo";
import { ProductStatusPanel } from "./shared/ProductStatusPanel";
import { ProductMediaPanel } from "./shared/ProductMediaPanel";
import { ProductTaxonomyPanel } from "./shared/ProductTaxonomyPanel";
import { cartesian, getVariantKey } from "./shared/utils/cartesian";
import { useProductFormOptions } from "./shared/hooks/useProductFormOptions";
import { FileAsset } from "@/shared/types/file-asset";

interface EditProductFormProps {
  locale: string;
  initialData: Product;
  initialVariants?: ProductVariant[];
}

const formatShippingProfile = (sp?: ShippingProfileRow) => {
  if (!sp) return undefined;
  return {
    weightGrams: sp.weightGrams ?? 0,
    dimensions: sp.dimensions,
    packageType: sp.packageType || "box",
    quantityPerPackage: sp.quantityPerPackage ?? 1,
  };
};
/**
 * `EditProductForm` Component
 *
 * This component handles the "Edit Product" interface within the dashboard. It manages core product data,
 * images, categories, and—most importantly—the management of complex variants and attributes.
 *
 * Developer Notes:
 * - To add new fields, ensure they are included in `product.schema.ts`, the form's `defaultValues`, and the `onSubmit` function to map them to `FormData`.
 * - The `variantsToUpdate` state relies on comparing changes against the original `originalVariants`.
 */
export default function EditProductForm({
  locale,
  initialData,
  initialVariants = [],
}: EditProductFormProps) {
  // hooks
  const t = useTranslations("products.form");
  const tMessages = useTranslations("products.messages");
  const toast = useToast();
  const router = useRouter();
  const getTrans = useTrans();
  const updateMutation = useUpdateProduct();
  // ─── State for existing PDF file (unchanged for now) ─────────
  // ─── Media State ─────────────────────────────────────
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    typeof initialData.imageCover === "object"
      ? initialData.imageCover.url
      : initialData.imageCover || null,
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<FileAsset[]>(
    (initialData.images as FileAsset[]) || [],
  );
  const [existingImages, setExistingImages] = useState<FileAsset[]>(
    (initialData.images as FileAsset[]) || [],
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // ─── SubCategory selection state ─────────────────────
  const [selectedSubCategories, setSelectedSubCategories] = useState<
    SearchOption[]
  >(
    ((initialData?.SubCategories as SubCategory[]) || []).map((sc) => ({
      _id: typeof sc === "object" ? sc._id : String(sc),
      name:
        typeof sc === "object" ? sc.name : { en: "Selected", ar: "تم التحديد" },
    })),
  );

  /**
   * A helper function that takes an object (such as a brand or category) and extracts the name,
   * whether it is a simple string or a multilingual object using translation.
   */
  const getLabel = (obj: unknown): string => {
    if (!obj || typeof obj !== "object") return "";
    const item = obj as { name: string | { en: string; ar: string } };
    if (!item.name) return "";
    if (typeof item.name === "string") return item.name;
    return getTrans(item.name as { en: string; ar: string });
  };
  const tError = (msg?: string) =>
    msg ? (msg.startsWith("validation.") ? t(msg) : msg) : undefined;
  const defaultVal = (initialData?: string | { en: string; ar: string }) => {
    if (typeof initialData === "object") return initialData;
    return { en: String(initialData || ""), ar: "" };
  };

  // ─── Initialization and Extraction of Derived Initial Values ​​─────────
  // Here, data is extracted from `initialData` and converted to match the form field format.
  const defaultTitle = useMemo(() => {
    return defaultVal(initialData.title);
  }, [initialData.title]);

  const defaultDesc = useMemo(() => {
    return defaultVal(initialData.description);
  }, [initialData.description]);

  const initialCategoryId = useMemo(() => {
    if (typeof initialData.category === "string") return initialData.category;
    return initialData.category?._id || "";
  }, [initialData.category]);

  const initialBrandId = useMemo(() => {
    if (!initialData.brand) return "";
    return typeof initialData.brand === "string"
      ? initialData.brand
      : initialData.brand._id;
  }, [initialData.brand]);

  const initialSupplierId = useMemo(() => {
    if (!initialData.supplier) return "";
    return typeof initialData.supplier === "string"
      ? initialData.supplier
      : initialData.supplier._id;
  }, [initialData.supplier]);

  // 🌟 Recovering tags and data from the existing product 🌟
  // Specifically for numeric attributes: we extract all numeric values ​​used
  // in the current state (`initialVariants`) and place them into `allowedValues`
  // so they are correctly recognized by the Attribute Builder.
  const initialAttributes = useMemo(() => {
    const attrs = initialData.allowedAttributes || [];
    return attrs.map((attr) => {
      if (attr.type.toLocaleLowerCase().trim() === "number") {
        const extractedValues = new Set<string>();
        initialVariants.forEach((v) => {
          const val = v.attributes?.[attr.name];
          if (typeof val === "object" && val !== null && "value" in val) {
            extractedValues.add(String(val.value));
          }
        });
        return {
          ...attr,
          allowedValues: Array.from(extractedValues),
          allowedUnits: attr.allowedUnits || [],
        };
      }
      return { ...attr, allowedValues: attr.allowedValues || [] };
    }) as AttributeDefinition[];
  }, [initialData.allowedAttributes, initialVariants]);

  // ─── Form setup ──────────────────────────────────────
  const form = useForm<EditProductFormInput, unknown, EditProductInput>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      title: defaultTitle as { en: string; ar: string },
      description: defaultDesc as { en: string; ar: string },
      uses: (initialData.uses as { en: string[]; ar: string[] }) || {
        en: [],
        ar: [],
      },
      isUnlimitedStock: initialData.isUnlimitedStock ?? true,
      isActive: initialData.isActive ?? true,
      isFeatured: initialData.isFeatured ?? false,
      category: initialCategoryId,
      SubCategories: (initialData.SubCategories || []).map((sc) =>
        typeof sc === "string" ? sc : sc._id,
      ),
      brand: initialBrandId,
      supplier: initialSupplierId,
      allowedAttributes: initialAttributes,
      variantsToCreate: [],
      variantsToUpdate: [],
      variantsToDelete: [],
      imageCover:
        typeof initialData.imageCover === "object"
          ? initialData.imageCover.url
          : initialData.imageCover || "",
    },
  });

  const {
    register,
    setValue,
    watch,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  // ─── Attribute & Variant State ───────────────────────
  const [attributes, setAttributes] =
    useState<AttributeDefinition[]>(initialAttributes);

  const [existingVariants, setExistingVariants] = useState<VariantRow[]>(
    initialVariants.map((v) => ({
      _id: v._id,
      sku: v.sku || "",
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      attributes: v.attributes || {},
      components:
        (v.components as { name: string; value: number; unit: string }[]) || [],
      shippingProfile: v.shippingProfile,
      label: v.label,
      isActive: v.isActive,
    })),
  );

  const [newVariants, setNewVariants] = useState<VariantRow[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [autoDeletedVariantIds, setAutoDeletedVariantIds] = useState<string[]>(
    [],
  );

  // Snapshot for change detection
  const [originalVariants] = useState<VariantRow[]>(
    initialVariants.map((v) => ({
      _id: v._id,
      sku: v.sku || "",
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      attributes: v.attributes || {},
      components:
        (v.components as { name: string; value: number; unit: string }[]) || [],
      shippingProfile: v.shippingProfile,
      label: v.label,
      isActive: v.isActive,
    })),
  );

  // ─── Watched values ───────────────────────────────────
  const watchedCategory = useWatch({ control, name: "category" });
  const watchedBrand = useWatch({ control, name: "brand" });
  const watchedSupplier = useWatch({ control, name: "supplier" });

  // ─── Search states + data fetching (shared hook) ─────
  const options = useProductFormOptions(watchedCategory);

  // ─── Regenerating Variants Upon Attribute Modification (Core Variant Logic) ────
  /**
   * This function is called whenever the user modifies attributes (adding/deleting an attribute or adding/deleting a value).
   * 1. Saves the new attributes and builds a map of allowed values.
   * 2. Checks existing variants: if a variant relies on an attribute or value that has been deleted, it is automatically moved to the "deleted" list.
   * 3. Generates new Cartesian variant combinations based on the updated attributes.
   * 4. Excludes pre-existing combinations and adds the remaining ones as new variants.
   */
  const handleAttributesChange = useCallback(
    (newAttrs: AttributeDefinition[]) => {
      setAttributes(newAttrs);

      // Build lookup: attrName → Set of still-allowed values (string comparison)
      const allowedValuesByName = new Map<string, Set<string>>();
      newAttrs.forEach((attr) => {
        if (attr.type === "string") {
          allowedValuesByName.set(
            attr.name,
            new Set((attr.allowedValues || []).map(String)),
          );
        } else if (attr.type === "number") {
          // For number attrs only values matter; units can shift so we match by numeric value
          allowedValuesByName.set(
            attr.name,
            new Set((attr.allowedValues || []).map(String)),
          );
        }
      });

      const newAttrNames = new Set(newAttrs.map((a) => a.name));

      const invalidatedIds: string[] = [];
      const stillValidExisting: VariantRow[] = [];

      existingVariants.forEach((v) => {
        const attrEntries = Object.entries(v.attributes || {});

        // Rule 1: variant uses an attribute NAME that was removed entirely
        const nameRemoved = attrEntries.some(([key]) => !newAttrNames.has(key));

        // Rule 2: variant uses a VALUE that is no longer in the allowed list
        const valueRemoved = attrEntries.some(([key, val]) => {
          const allowed = allowedValuesByName.get(key);
          if (!allowed) return true; // attr name itself was removed
          // number attrs are stored as {value, unit} objects
          const strVal =
            typeof val === "object" && val !== null && "value" in val
              ? String((val as { value: number }).value)
              : String(val);
          return !allowed.has(strVal);
        });

        // Rule 3: variant is missing a required attribute name that has been added
        const missingRequiredAttr = Array.from(newAttrNames).some(
          (name) => !(name in (v.attributes || {})),
        );

        if ((nameRemoved || valueRemoved || missingRequiredAttr) && v._id) {
          invalidatedIds.push(v._id);
        } else {
          stillValidExisting.push(v);
        }
      });

      // Auto-mark invalidated variants for deletion (deduplicated and reversible)
      setDeletedVariantIds((prev) => {
        const noLongerInvalidated = autoDeletedVariantIds.filter(
          (id) => !invalidatedIds.includes(id),
        );
        const filtered = prev.filter((id) => !noLongerInvalidated.includes(id));
        return [...new Set([...filtered, ...invalidatedIds])];
      });
      setAutoDeletedVariantIds(invalidatedIds);

      // Generate new combos only against STILL-VALID existing variants
      const combos = cartesian(newAttrs);
      const existingKeys = new Set(
        stillValidExisting.map((v) => getVariantKey(v.attributes)),
      );
      const newCombos = combos.filter(
        (combo) => !existingKeys.has(getVariantKey(combo)),
      );

      setNewVariants(
        newCombos.map((combo) => {
          const skuParts = Object.values(combo).map((v) => {
            if (
              typeof v === "object" &&
              v !== null &&
              "value" in v &&
              "unit" in v
            ) {
              return `${v.value}-${v.unit}`.toUpperCase().trim();
            }
            return String(v).toUpperCase().replace(/\s+/g, "-").trim();
          });
          const dateStr = new Date()
            .toISOString()
            .split("T")[0]
            .replace(/-/g, "");
          skuParts.push(dateStr);
          return {
            sku: skuParts.join("-"),
            price: 0,
            stock: 0,
            attributes: combo,
            shippingProfile: {
              packageType: "box",
              quantityPerPackage: 1,
              weightGrams: 0,
            },
            isActive: true,
          };
        }),
      );
    },
    [existingVariants, autoDeletedVariantIds],
  );

  const markForDelete = (id: string) =>
    setDeletedVariantIds((prev) => [...prev, id]);
  const unmarkDelete = (id: string) =>
    setDeletedVariantIds((prev) => prev.filter((d) => d !== id));

  // ─── Sync to form ────────────────────────────────────
  useEffect(() => {
    setValue("allowedAttributes", attributes);
  }, [attributes, setValue]);

  // ─── Synchronizing Variant States with the Form ────
  // Since variants are managed via separate `useState` hooks, this hook acts as a bridge
  // to automatically update `react-hook-form` values ​​and submit them with the form.
  // Any modifications (to price, stock, etc.) are detected by comparing `existingVariants`
  // with `originalVariants`.
  useEffect(() => {
    const changed = existingVariants.filter((v) => {
      if (!v._id) return false;
      if (deletedVariantIds.includes(v._id)) return false; // Skip deleted variants from update
      const orig = originalVariants.find((o) => o._id === v._id);
      if (!orig) return false;
      return (
        v.sku !== orig.sku ||
        v.price !== orig.price ||
        v.stock !== orig.stock ||
        v.priceAfterDiscount !== orig.priceAfterDiscount ||
        v.isActive !== orig.isActive ||
        JSON.stringify(v.components) !== JSON.stringify(orig.components) ||
        JSON.stringify(v.shippingProfile) !==
          JSON.stringify(orig.shippingProfile)
      );
    });

    setValue(
      "variantsToUpdate",
      changed.map((v) => ({
        _id: v._id!,
        sku: v.sku || undefined,
        price: v.price,
        priceAfterDiscount: v.priceAfterDiscount,
        stock: v.stock,
        isActive: v.isActive,
        components: v.components,
        shippingProfile: formatShippingProfile(v.shippingProfile),
      })),
    );

    setValue(
      "variantsToCreate",
      newVariants.map((v) => ({
        sku: v.sku || undefined,
        price: v.price,
        priceAfterDiscount: v.priceAfterDiscount,
        stock: v.stock,
        attributes: v.attributes,
        components: v.components,
        shippingProfile: formatShippingProfile(v.shippingProfile),
        label: v.label,
        isActive: v.isActive,
      })),
    );

    setValue("variantsToDelete", deletedVariantIds);
  }, [
    existingVariants,
    newVariants,
    deletedVariantIds,
    originalVariants,
    setValue,
  ]);

  // ─── (Gallery Handlers) ───────────────────────
  /**
   * Adds a new image to the image gallery with a maximum limit of 3 images.
   * Generates a local preview URL using FileReader to display the image immediately.
   */
  const handleGalleryAdd = (file: File) => {
    if (galleryPreviews.length >= 3) {
      toast.error(
        t("validation.maxGalleryImagesReached", {
          defaultValue: "You can only upload up to 3 images",
        }),
      );
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setGalleryFiles((prev) => [...prev, file]);
    setGalleryPreviews((prev) => [
      ...prev,
      { url: objectUrl, publicId: file.name },
    ]);
  };

  /**
   * Deletes an image from the gallery based on its index.
   * Distinguishes between pre-existing images (URLs) and newly uploaded ones (files).
   */
  const handleGalleryRemove = (index: number) => {
    const target = galleryPreviews[index];
    if (
      target &&
      typeof target === "object" &&
      (target.url.startsWith("http") || target.url.startsWith("/"))
    ) {
      setExistingImages((prev) => prev.filter((img) => img.url !== target.url));
    } else {
      const fileIndex = index - existingImages.length;
      setGalleryFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Submission and Saving (Submit) ─────────────────────────────────────────
  /**
   * Main submission function.
   * - Checks for the presence of a cover image.
   * - Prepares `FormData` to send data and files together.
   * - Separates variables for create, update, and delete operations.
   */
  const onSubmit = async (data: EditProductInput) => {
    const formData = new FormData();
    formData.append("title", JSON.stringify(data.title));
    formData.append("description", JSON.stringify(data.description));
    if (data.uses) formData.append("uses", JSON.stringify(data.uses));
    formData.append("category", data.category);
    data.SubCategories?.forEach((id) => formData.append("SubCategories", id));
    formData.append("isUnlimitedStock", String(data.isUnlimitedStock));
    formData.append("isActive", String(data.isActive));
    formData.append("isFeatured", String(data.isFeatured));
    if (data.brand) formData.append("brand", data.brand);
    if (data.supplier) formData.append("supplier", data.supplier);

    const formattedAllowedAttributes = data.allowedAttributes?.map((attr) => {
      if (attr.type === "number") {
        return {
          name: attr.name,
          type: attr.type,
          required: true,
          allowedUnits: attr.allowedUnits || [],
        };
      }
      return {
        name: attr.name,
        type: attr.type,
        required: true,
        allowedValues: attr.allowedValues || [],
      };
    });
    formData.append(
      "allowedAttributes",
      JSON.stringify(formattedAllowedAttributes || []),
    );

    const variantOps = {
      create: data.variantsToCreate || [],
      update: data.variantsToUpdate || [],
      delete: data.variantsToDelete || [],
    };
    formData.append("variants", JSON.stringify(variantOps));

    if (coverFile) formData.append("imageCover", coverFile);
    galleryFiles.forEach((f) => formData.append("images", f));
    existingImages.forEach((img) =>
      formData.append("images", JSON.stringify(img)),
    );
    if (pdfFile) formData.append("infoProductPdf", pdfFile);

    try {
      await updateMutation.mutateAsync({ id: initialData._id, data: formData });
      toast.success(
        tMessages("updateSuccess") || "Product updated successfully",
      );
      router.push(`/dashboard/products`);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : tMessages("updateError") || "Error while updating product";
      toast.error(msg);
    }
  };

  const onInvalidSubmit = () => {
    toast.error(
      locale === "ar"
        ? "يرجى تصحيح الأخطاء في الحقول المطلوبة وملء البيانات بشكل صحيح."
        : "Please correct the errors in the required fields and fill in all data correctly.",
    );

    setTimeout(() => {
      const firstErrorEl = document.querySelector(
        '.border-destructive, [aria-invalid="true"]',
      );
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        if (firstErrorEl instanceof HTMLElement) {
          firstErrorEl.focus();
        }
      }
    }, 100);
  };

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="pb-12">
      <FormStickyHeader
        title={t("titleEdit")}
        subtitle={t("subtitle")}
        cancelLabel={t("cancel")}
        saveLabel={t("save")}
        formId="edit-product-form"
        isSubmitting={isSubmitting || updateMutation.isPending}
        backUrl={`/${locale}/dashboard/products`}
      />

      <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <form
          id="edit-product-form"
          onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-2 space-y-6">
            <ProductBasicInfo
              register={register}
              errors={
                errors as unknown as Parameters<
                  typeof ProductBasicInfo
                >[0]["errors"]
              }
              tError={tError}
              watch={watch}
              setValue={setValue}
            />

            <AttributeBuilder
              attributes={attributes}
              onChange={handleAttributesChange}
            />

            {/* Existing Variants */}
            {existingVariants.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                  {t("existingVariants")} ({existingVariants.length})
                </h3>
                <VariantTable
                  variants={existingVariants}
                  onChange={setExistingVariants}
                  mode="edit"
                  deletedIds={deletedVariantIds}
                  unrestorableIds={autoDeletedVariantIds}
                  onMarkForDelete={markForDelete}
                  onUnmarkDelete={unmarkDelete}
                  errors={errors.variantsToUpdate}
                />
              </div>
            )}

            {/* New Variants */}
            {newVariants.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-success uppercase tracking-wider px-1">
                  {t("newVariants")} ({newVariants.length})
                </h3>
                <VariantTable
                  variants={newVariants}
                  onChange={setNewVariants}
                  mode="create"
                  errors={errors.variantsToCreate}
                />
              </div>
            )}
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="space-y-6">
            <ProductMediaPanel
              coverPreview={coverPreview}
              coverFieldError={tError(errors.imageCover?.message as string)}
              onCoverChange={(file) => {
                setCoverFile(file);
                const reader = new FileReader();
                reader.onload = (e) =>
                  setCoverPreview(e.target?.result as string);
                reader.readAsDataURL(file);
                setValue("imageCover", file, { shouldValidate: true });
              }}
              onCoverRemove={() => {
                setCoverFile(null);
                setCoverPreview(null);
                setValue("imageCover", undefined, { shouldValidate: true });
              }}
              galleryPreviews={galleryPreviews}
              onGalleryAdd={handleGalleryAdd}
              onGalleryRemove={handleGalleryRemove}
              pdfFile={pdfFile}
              onPdfChange={setPdfFile}
              onPdfRemove={() => setPdfFile(null)}
              existingPdfLabel={
                initialData.infoProductPdf ? "Current PDF attached" : undefined
              }
            />

            <ProductStatusPanel
              register={register}
              defaultValues={{
                isUnlimitedStock: initialData.isUnlimitedStock,
                isFeatured: initialData.isFeatured,
                isActive: initialData.isActive,
              }}
            />

            <ProductTaxonomyPanel
              locale={locale}
              tError={tError}
              watchedCategory={watchedCategory}
              watchedBrand={watchedBrand}
              watchedSupplier={watchedSupplier}
              categoryError={errors.category?.message as string}
              subCategoryError={errors.SubCategories?.message as string}
              selectedSubCategories={selectedSubCategories}
              onSubCategorySelect={(opt) => {
                const next = [...selectedSubCategories, opt];
                setSelectedSubCategories(next);
                setValue(
                  "SubCategories",
                  next.map((sc) => sc._id),
                  { shouldValidate: true },
                );
              }}
              onSubCategoryRemove={(id) => {
                const next = selectedSubCategories.filter(
                  (sc) => sc._id !== id,
                );
                setSelectedSubCategories(next);
                setValue(
                  "SubCategories",
                  next.map((sc) => sc._id),
                  { shouldValidate: true },
                );
              }}
              onCategoryChange={(id) => {
                setValue("category", id, { shouldValidate: true });
                setValue("SubCategories", []);
                setSelectedSubCategories([]);
              }}
              onBrandChange={(id) => setValue("brand", id)}
              onSupplierChange={(id) => setValue("supplier", id)}
              initialBrandLabel={getLabel(initialData?.brand)}
              initialSupplierLabel={getLabel(initialData?.supplier)}
              initialCategoryLabel={getLabel(initialData?.category)}
              {...options}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
