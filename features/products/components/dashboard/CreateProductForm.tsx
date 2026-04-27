'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { createProductSchema, CreateProductInput } from '@/features/products/product.schema';
import { useCreateProduct } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useSubCategories } from '@/features/categories/hooks/useSubCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useTrans } from '@/shared/hooks/useTrans';
import { LocalizedString } from '@/types';
import { SearchOption } from '@/shared/ui/form/SearchableSelect';

import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { SearchableSelect } from '@/shared/ui/form/SearchableSelect';
import { SearchableMultiSelect } from '@/shared/ui/form/SearchableMultiSelect';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import AttributeBuilder, { AttributeDefinition } from './shared/AttributeBuilder';
import VariantTable, { VariantRow } from './shared/VariantTable';

interface CreateProductFormProps {
  locale: string;
}

// ─── Cartesian product generator ───────────────────────
// ─── Cartesian product generator ───────────────────────
function cartesian(attrs: AttributeDefinition[]): Record<string, any>[] {
  // نتأكد أن الخاصية صالحة ولديها بيانات
  const validAttrs = attrs.filter(a =>
    a.name && (
      (a.type === 'string' && a.allowedValues && a.allowedValues.length > 0) ||
      (a.type === 'number' && a.allowedValues && a.allowedValues.length > 0 && a.allowedUnits && a.allowedUnits.length > 0)
    )
  );

  if (validAttrs.length === 0) return [];

  return validAttrs.reduce<Record<string, any>[]>(
    (acc, attr) => {
      let options: any[] = [];

      if (attr.type === 'string') {
        // للألوان والنصوص: نأخذ القيم المسموحة كما هي
        options = attr.allowedValues || [];
      } else if (attr.type === 'number') {
        // للأحجام: نضرب القيم في الوحدات لتكوين الكائن المطلوب للباك إند
        const values = attr.allowedValues || [];
        const units = attr.allowedUnits || [];
        options = values.flatMap(v => units.map(u => ({ value: Number(v), unit: u })));
      }

      if (acc.length === 0) {
        return options.map(opt => ({ [attr.name]: opt }));
      }
      return acc.flatMap(combo =>
        options.map(opt => ({ ...combo, [attr.name]: opt }))
      );
    },
    []
  );
}

export default function CreateProductForm({ locale }: CreateProductFormProps) {
  const t = useTranslations('products.form');
  const router = useRouter();
  const getTrans = useTrans();
  const createMutation = useCreateProduct();

  // ─── Form setup ──────────────────────────────────────
  const form = useForm<CreateProductInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      isUnlimitedStock: true,
      disabled: false,
      isFeatured: false,
      category: '',
      SubCategories: [],
      brand: '',
      supplier: '',

      allowedAttributes: [],
      variants: [{ sku: '', price: 0, stock: 0, attributes: {}, isActive: true }],
    },
  });

  const { register, setValue, watch, handleSubmit, formState: { errors, isSubmitting } } = form;
  console.log(errors);
  // ─── Media State ─────────────────────────────────────
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  // ─── Search States for Selects ───────────────────────
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState<SearchOption[]>([]);

  // ─── Attribute & Variant State ───────────────────────
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([
    { sku: '', price: 0, stock: 0, attributes: {}, isActive: true },
  ]);

  // ─── Global Components State (A+B) ───────────────────
  const [globalComponents, setGlobalComponents] = useState<{ name: string; value: number; unit: string }[]>([]);

  // ─── Data fetching ───────────────────────────────────
  const { data: categoriesData, isFetching: isCategoriesFetching } = useCategories(
    { keywords: categorySearch },
    { enabled: isCategoryOpen }
  );
  const { data: brandsData, isFetching: isBrandsFetching } = useBrands(
    { keywords: brandSearch },
    { enabled: isBrandOpen }
  );
  const { data: suppliersData, isFetching: isSuppliersFetching } = useSuppliers(
    { keywords: supplierSearch },
    { enabled: isSupplierOpen }
  );
  const { data: subCategoriesData, isFetching: isSubCategoriesFetching } = useSubCategories(
    { keywords: subCategorySearch },
    { enabled: isSubCategoryOpen }
  );

  // ─── Variant generation from attributes ──────────────
  const regenerateVariants = useCallback((attrs: AttributeDefinition[]) => {
    const combos = cartesian(attrs);
    if (combos.length === 0) {
      setVariants([{ sku: '', price: 0, stock: 0, attributes: {}, isActive: true }]);
      return;
    }
    setVariants(
      combos.map(combo => {
        // Build SKU correctly depending on whether it's a string or {value, unit} object
        const skuParts = Object.values(combo).map(v => {
          if (typeof v === 'object' && v !== null && 'value' in v && 'unit' in v) {
            return `${v.value}-${v.unit}`.toUpperCase();
          }
          return String(v).toUpperCase().replace(/\s+/g, '-');
        });

        return {
          sku: skuParts.join('-'),
          price: 0,
          stock: 0,
          attributes: combo,
          isActive: true,
        };
      })
    );
  }, []);

  const handleAttributesChange = useCallback((newAttrs: AttributeDefinition[]) => {
    console.log('newAttrs', newAttrs);
    setAttributes(newAttrs);
    regenerateVariants(newAttrs);
  }, [regenerateVariants]);

  // ─── Sync variants to form ──────────────────────────
  useEffect(() => {
    setValue('variants', variants.map(v => ({
      sku: v.sku || undefined,
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      attributes: v.attributes,
      components: globalComponents.length > 0 ? globalComponents : v.components,
      label: v.label,
      isActive: v.isActive,
    })));
  }, [variants, globalComponents, setValue]);

  useEffect(() => {
    setValue('allowedAttributes', attributes);
  }, [attributes, setValue]);

  const handleGalleryAdd = (file: File) => {
    setGalleryFiles(prev => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => setGalleryPreviews(prev => [...prev, e.target?.result as string]);
    reader.readAsDataURL(file);
  };

  const handleGalleryRemove = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Submit ──────────────────────────────────────────
  const onSubmit = async (data: CreateProductInput) => {
    if (!coverFile) {
      setCoverError(t('coverImageRequired'));
      return;
    }
    console.log(data);
    // 🌟 1. تنظيف allowedAttributes ليتطابق مع الباك إند تماماً 🌟
    const formattedAllowedAttributes = data.allowedAttributes?.map((attr) => {
      if (attr.type === 'number') {
        // إذا كان النوع رقم (وزن/حجم): نرسل الوحدات فقط ونمسح القيم
        return {
          name: attr.name,
          type: attr.type,
          required: true,
          allowedUnits: attr.allowedUnits || [],
        };
      }
      // إذا كان النوع نص (لون): نرسل القيم فقط
      return {
        name: attr.name,
        type: attr.type,
        required: true,
        allowedValues: attr.allowedValues || [],
      };
    });
    console.log(formattedAllowedAttributes);
    // 2. تجهيز المتغيرات (تبقى كما هي لأنها تعمل بشكل ممتاز)
    const formattedVariants = data.variants.map((variant) => ({
      ...variant,
      attributes: variant.attributes,
      components: globalComponents.length > 0 ? globalComponents : (variant.components || []),
    }));

    const formData = new FormData();
    formData.append('title', JSON.stringify(data.title));
    formData.append('description', JSON.stringify(data.description));
    formData.append('category', data.category);
    data.SubCategories?.forEach((id) => formData.append('SubCategories', id));
    formData.append('isUnlimitedStock', String(data.isUnlimitedStock));
    formData.append('disabled', String(data.disabled));
    formData.append('isFeatured', String(data.isFeatured));

    if (data.brand) formData.append('brand', data.brand);
    if (data.supplier) formData.append('supplier', data.supplier);

    // 🌟 3. إرسال allowedAttributes بعد التنظيف 🌟
    formData.append('allowedAttributes', JSON.stringify(formattedAllowedAttributes || []));
    formData.append('variants', JSON.stringify(formattedVariants));

    formData.append('imageCover', coverFile);
    galleryFiles.forEach(f => formData.append('images', f));
    if (pdfFile) formData.append('infoProductPdf', pdfFile);

    await createMutation.mutateAsync(formData);
    // router.push(`/${locale}/dashboard/products`);
  };

  // Watched values
  const watchedCategory = watch('category');
  const watchedBrand = watch('brand');
  const watchedSupplier = watch('supplier');

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('titleCreate')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl font-bold"
            onClick={() => router.push(`/${locale}/dashboard/products`)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            form="create-product-form"
            className="rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
            isLoading={isSubmitting || createMutation.isPending}
          >
            {t('publish')}
          </Button>
        </div>
      </div>

      <form id="create-product-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Information */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm">{t('basicInformation')}</h3>
              <p className="text-xs text-muted-foreground">{t('basicDesc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('titleEn')}</label>
                <Input {...register('title.en')} placeholder={t('placeholderTitleEn')} className="h-11 rounded-xl" />
                {errors.title?.en && <p className="text-xs text-destructive font-medium">{errors.title.en.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('titleAr')}</label>
                <Input {...register('title.ar')} placeholder={t('placeholderTitleAr')} dir="rtl" className="h-11 rounded-xl" />
                {errors.title?.ar && <p className="text-xs text-destructive font-medium">{errors.title.ar.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('descEn')}</label>
                <Textarea {...register('description.en')} placeholder={t('placeholderDescEn')} className="rounded-xl min-h-[100px]" />
                {errors.description?.en && <p className="text-xs text-destructive font-medium">{errors.description.en.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('descAr')}</label>
                <Textarea {...register('description.ar')} placeholder={t('placeholderDescAr')} dir="rtl" className="rounded-xl min-h-[100px]" />
                {errors.description?.ar && <p className="text-xs text-destructive font-medium">{errors.description.ar.message}</p>}
              </div>
            </div>
          </div>

          {/* Attributes Builder */}
          <AttributeBuilder attributes={attributes} onChange={handleAttributesChange} />

          {/* Components Section */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm">مكونات المنتج المتعددة (Components) - <span className="text-muted-foreground">اختياري</span></h3>
              <p className="text-xs text-muted-foreground">أضف المكونات إذا كان المنتج يتكون من عبوات منفصلة (مثل: مادة A ومادة B). سيتم إضافتها تلقائياً لكل المتغيرات.</p>
            </div>
            <div className="space-y-3">
              {globalComponents.map((comp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="الاسم (مثل: A)"
                    value={comp.name}
                    onChange={(e) => {
                      const newComps = [...globalComponents];
                      newComps[idx].name = e.target.value;
                      setGlobalComponents(newComps);
                    }}
                    className="w-1/3 rounded-xl h-11"
                  />
                  <Input
                    type="number"
                    placeholder="القيمة (مثال: 20)"
                    value={comp.value?.toString() || ''}
                    onChange={(e) => {
                      const newComps = [...globalComponents];
                      newComps[idx].value = Number(e.target.value);
                      setGlobalComponents(newComps);
                    }}
                    className="w-1/3 rounded-xl h-11"
                  />
                  <Input
                    placeholder="الوحدة (kg, ltr...)"
                    value={comp.unit}
                    onChange={(e) => {
                      const newComps = [...globalComponents];
                      newComps[idx].unit = e.target.value;
                      setGlobalComponents(newComps);
                    }}
                    className="w-1/3 rounded-xl h-11"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="shrink-0 h-11 w-11 rounded-xl"
                    onClick={() => setGlobalComponents(globalComponents.filter((_, i) => i !== idx))}
                  >
                    <Icons.X className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-dashed w-full"
                onClick={() => setGlobalComponents([...globalComponents, { name: '', value: 0, unit: 'kg' }])}
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                إضافة مكون جديد
              </Button>
            </div>
          </div>

          {/* Variant Table */}
          <VariantTable variants={variants} onChange={setVariants} mode="create" />

          {/* Media */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm">{t('coverImage')}</h3>
            </div>
            <div className="space-y-4">
              <ImageUpload
                value={coverPreview || undefined}
                onChange={(file: File) => {
                  setCoverFile(file);
                  setCoverError(null);
                }}
                onRemove={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
              />
              {coverError && <p className="text-xs text-destructive font-medium">{coverError}</p>}
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t('galleryImages')}</h4>
              <p className="text-xs text-muted-foreground">{t('galleryDesc')}</p>
              <div className="flex flex-wrap gap-3">
                {galleryPreviews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/40 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleGalleryRemove(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Icons.X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Icons.Plus className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleGalleryAdd(e.target.files[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* PDF */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t('productPdf')}</h4>
              <p className="text-xs text-muted-foreground">{t('pdfDesc')}</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors text-sm font-medium">
                {pdfFile ? pdfFile.name : t('attachPdf')}
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-6">

          {/* Taxonomy */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm">{t('taxonomy')}</h3>
              <p className="text-xs text-muted-foreground">{t('taxonomyDesc')}</p>
            </div>

            <div className="space-y-4">
              <SearchableSelect
                label={t('mainCategory')}
                placeholder={t('searchCategory')}
                value={watchedCategory || ''}
                isLoading={isCategoriesFetching}
                options={(categoriesData?.data as unknown as SearchOption[]) || []}
                getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
                onSearch={(term: string) => setCategorySearch(term)}
                onOpen={() => setIsCategoryOpen(true)}
                onSelect={(id: string) => {
                  setValue('category', id, { shouldValidate: true });
                  setValue('SubCategories', []);
                  setSelectedSubCategories([]);
                }}
                error={errors.category?.message as string}
              />

              <SearchableMultiSelect
                label={t('SubCategories')}
                placeholder={t('searchSubCategory')}
                error={errors.SubCategories?.message as string}
                isLoading={isSubCategoriesFetching}
                options={(subCategoriesData?.data as unknown as SearchOption[]) || []}
                selectedOptions={selectedSubCategories}
                getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
                onSearch={(term: string) => setSubCategorySearch(term)}
                onOpen={() => setIsSubCategoryOpen(true)}
                onSelect={(opt: SearchOption) => {
                  const newSelected = [...selectedSubCategories, opt];
                  setSelectedSubCategories(newSelected);
                  setValue('SubCategories', newSelected.map(sc => sc._id), { shouldValidate: true });
                }}
                onRemove={(id: string) => {
                  const newSelected = selectedSubCategories.filter(sc => sc._id !== id);
                  setSelectedSubCategories(newSelected);
                  setValue('SubCategories', newSelected.map(sc => sc._id), { shouldValidate: true });
                }}
              />

              <SearchableSelect
                label={t('brand')}
                placeholder={t('searchBrand')}
                value={watchedBrand || ''}
                isLoading={isBrandsFetching}
                options={(brandsData?.data as unknown as SearchOption[]) || []}
                getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
                onSearch={(term: string) => setBrandSearch(term)}
                onOpen={() => setIsBrandOpen(true)}
                onSelect={(id: string) => setValue('brand', id)}
              />

              <SearchableSelect
                label={t('supplier')}
                placeholder={t('searchSupplier')}
                value={watchedSupplier || ''}
                isLoading={isSuppliersFetching}
                options={(suppliersData?.data as unknown as SearchOption[]) || []}
                getDisplayValue={(opt: SearchOption) => String(opt.name)}
                onSearch={(term: string) => setSupplierSearch(term)}
                onOpen={() => setIsSupplierOpen(true)}
                onSelect={(id: string) => setValue('supplier', id)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm">{t('statusSettings')}</h3>
            </div>
            <div className="space-y-4">
              <Switch {...register('isUnlimitedStock')} label={t('unlimitedStock')} />
              <div className="h-px bg-border/50 w-full" />
              <Switch {...register('isFeatured')} label={t('featured')} description={t('featuredDesc')} />
              <div className="h-px bg-border/50 w-full" />
              <Switch {...register('disabled')} label={t('disabled')} description={t('disabledDesc')} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
