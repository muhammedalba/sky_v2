'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { createProductSchema, CreateProductInput } from '@/features/products/product.schema';
import { useCreateProduct } from '@/features/products/hooks/useProducts';
import { useToast } from '@/shared/hooks/useToast';
import { SearchOption } from '@/shared/ui/form/SearchableSelect';

import { Button } from '@/shared/ui/Button';
import FormStickyHeader from '@/shared/ui/dashboard/FormStickyHeader';
import AttributeBuilder, { AttributeDefinition } from './shared/AttributeBuilder';
import VariantTable, { VariantRow } from './shared/VariantTable';
import { ProductBasicInfo } from './shared/ProductBasicInfo';
import { ProductStatusPanel } from './shared/ProductStatusPanel';
import { ProductMediaPanel } from './shared/ProductMediaPanel';
import { ProductTaxonomyPanel } from './shared/ProductTaxonomyPanel';
import { cartesian } from './shared/utils/cartesian';
import { useProductFormOptions } from './shared/hooks/useProductFormOptions';

interface CreateProductFormProps {
  locale: string;
}

export default function CreateProductForm({ locale }: CreateProductFormProps) {
  const t = useTranslations('products.form');
  const tError = (msg?: string) => (msg ? (msg.startsWith('validation.') ? t(msg) : msg) : undefined);
  const toast = useToast();
  const router = useRouter();
  const createMutation = useCreateProduct();

  // ─── Form setup ──────────────────────────────────────
  const form = useForm<CreateProductInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      uses: { en: [], ar: [] },
      isUnlimitedStock: true,
      isActive: true,
      isFeatured: false,
      category: '',
      SubCategories: [],
      brand: '',
      supplier: '',
      allowedAttributes: [],
      variants: [{ sku: '', price: 0, stock: 0, attributes: {}, isActive: true }],
      imageCover: undefined,
    },
  });

  const { register, setValue, watch, handleSubmit, formState: { errors, isSubmitting } } = form;

  // ─── Media State ─────────────────────────────────────
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  // ─── SubCategory selection state ─────────────────────
  const [selectedSubCategories, setSelectedSubCategories] = useState<SearchOption[]>([]);

  // ─── Attribute & Variant State ───────────────────────
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([
    { sku: '', price: 0, stock: 0, attributes: {}, isActive: true },
  ]);

  // ─── Watched values ───────────────────────────────────
  const watchedCategory = watch('category');
  const watchedBrand = watch('brand');
  const watchedSupplier = watch('supplier');

  // ─── Search states + data fetching (shared hook) ─────
  const options = useProductFormOptions(watchedCategory);

  // ─── Variant generation from attributes ──────────────
  const regenerateVariants = useCallback((attrs: AttributeDefinition[]) => {
    const combos = cartesian(attrs);
    if (combos.length === 0) {
      setVariants([{ sku: '', price: 0, stock: 0, attributes: {}, isActive: true }]);
      return;
    }
    setVariants(
      combos.map((combo) => {
        const skuParts = Object.values(combo).map((v) => {
          if (typeof v === 'object' && v !== null && 'value' in v && 'unit' in v) {
            return `${v.value}-${v.unit}`.toUpperCase().trim();
          }
          return String(v).toUpperCase().replace(/\s+/g, '-').trim();
        });
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        skuParts.push(dateStr);
        return { sku: skuParts.join('-'), price: 0, stock: 0, attributes: combo, isActive: true };
      }),
    );
  }, []);

  const handleAttributesChange = useCallback(
    (newAttrs: AttributeDefinition[]) => {
      setAttributes(newAttrs);
      regenerateVariants(newAttrs);
    },
    [regenerateVariants],
  );

  // ─── Sync to form ────────────────────────────────────
  useEffect(() => {
    setValue(
      'variants',
      variants.map((v) => ({
        sku: v.sku || undefined,
        price: v.price,
        priceAfterDiscount: v.priceAfterDiscount,
        stock: v.stock,
        attributes: v.attributes,
        components: v.components,
        label: v.label,
        isActive: v.isActive,
      })),
    );
  }, [variants, setValue]);

  useEffect(() => {
    setValue('allowedAttributes', attributes);
  }, [attributes, setValue]);

  // ─── Gallery handlers ─────────────────────────────────
  const handleGalleryAdd = (file: File) => {
    if (galleryFiles.length >= 3) {
      toast.error(t('validation.maxGalleryImagesReached', { defaultValue: 'You can only upload up to 3 images' }));
      return;
    }
    setGalleryFiles((prev) => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => setGalleryPreviews((prev) => [...prev, e.target?.result as string]);
    reader.readAsDataURL(file);
  };

  const handleGalleryRemove = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Submit ──────────────────────────────────────────
  const onSubmit = async (data: CreateProductInput) => {
    const formattedAllowedAttributes = data.allowedAttributes?.map((attr) => {
      if (attr.type === 'number') {
        return { name: attr.name, type: attr.type, required: true, allowedUnits: attr.allowedUnits || [] };
      }
      return { name: attr.name, type: attr.type, required: true, allowedValues: attr.allowedValues || [] };
    });

    const formattedVariants = data.variants.map((variant) => ({
      ...variant,
      attributes: variant.attributes,
      components: variant.components || [],
    }));

    const formData = new FormData();
    formData.append('title', JSON.stringify(data.title));
    formData.append('description', JSON.stringify(data.description));
    if (data.uses) formData.append('uses', JSON.stringify(data.uses));
    formData.append('category', data.category);
    data.SubCategories?.forEach((id) => formData.append('SubCategories', id));
    formData.append('isUnlimitedStock', String(data.isUnlimitedStock));
    formData.append('isActive', String(data.isActive));
    formData.append('isFeatured', String(data.isFeatured));
    if (data.brand) formData.append('brand', data.brand);
    if (data.supplier) formData.append('supplier', data.supplier);
    formData.append('allowedAttributes', JSON.stringify(formattedAllowedAttributes || []));
    formData.append('variants', JSON.stringify(formattedVariants));
    if (coverFile) formData.append('imageCover', coverFile);
    if (galleryFiles.length > 0) galleryFiles.forEach((f) => formData.append('images', f));
    if (pdfFile) formData.append('infoProductPdf', pdfFile);

    createMutation.mutate(formData, {
      onSuccess: () => {
        router.push(`/${locale}/dashboard/products`);
      }
    });
  };

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="pb-12">
      <FormStickyHeader
        title={t('titleCreate')}
        subtitle={t('subtitle')}
        cancelLabel={t('cancel')}
        saveLabel={t('publish')}
        formId="create-product-form"
        isSubmitting={isSubmitting || createMutation.isPending}
        backUrl={`/${locale}/dashboard/products`}
      />

      <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <form
          id="create-product-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-2 space-y-6">
            <ProductBasicInfo register={register} errors={errors as any} tError={tError} watch={watch} setValue={setValue} />

            <AttributeBuilder attributes={attributes} onChange={handleAttributesChange} />

            <VariantTable
              variants={variants}
              onChange={setVariants}
              mode="create"
              errors={errors.variants}
            />
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="space-y-6">
            <ProductMediaPanel
              coverPreview={coverPreview}
              coverError={coverError}
              coverFieldError={tError(errors.imageCover?.message as string)}
              onCoverChange={(file) => {
                setCoverFile(file);
                setCoverPreview(URL.createObjectURL(file));
                setValue('imageCover', file, { shouldValidate: true });
              }}
              onCoverRemove={() => {
                setCoverFile(null);
                setCoverPreview(null);
                setValue('imageCover', undefined, { shouldValidate: true });
              }}
              galleryPreviews={galleryPreviews}
              onGalleryAdd={handleGalleryAdd}
              onGalleryRemove={handleGalleryRemove}
              pdfFile={pdfFile}
              onPdfChange={setPdfFile}
            />

            <ProductStatusPanel register={register} />

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
                setValue('SubCategories', next.map((sc) => sc._id), { shouldValidate: true });
              }}
              onSubCategoryRemove={(id) => {
                const next = selectedSubCategories.filter((sc) => sc._id !== id);
                setSelectedSubCategories(next);
                setValue('SubCategories', next.map((sc) => sc._id), { shouldValidate: true });
              }}
              onCategoryChange={(id) => {
                setValue('category', id, { shouldValidate: true });
                setValue('SubCategories', []);
                setSelectedSubCategories([]);
              }}
              onBrandChange={(id) => setValue('brand', id)}
              onSupplierChange={(id) => setValue('supplier', id)}
              {...options}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
