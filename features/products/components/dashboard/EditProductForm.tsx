
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { editProductSchema, EditProductInput } from '@/lib/validations/schemas';
import { useUpdateProduct } from '@/hooks/api/useProducts';
import { useCategories } from '@/hooks/api/useCategories';
import { useSubCategories } from '@/hooks/api/useSubCategories';
import { useBrands } from '@/hooks/api/useBrands';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useTrans } from '@/hooks/useTrans';
import { LocalizedString, Product, ProductVariant, Category } from '@/types';
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

interface EditProductFormProps {
  locale: string;
  initialData: Product;
  initialVariants?: ProductVariant[];
}

// ─── Cartesian product generator ───────────────────────
function cartesian(attrs: AttributeDefinition[]): Record<string, any>[] {
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
        options = attr.allowedValues || [];
      } else if (attr.type === 'number') {
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

// Helper: يولد مفتاحاً فريداً لكل متغير لمنع التكرار ويدعم الكائنات
const getVariantKey = (attrs: Record<string, any>) => {
  return Object.entries(attrs)
    .sort()
    .map(([k, val]) => {
      if (typeof val === 'object' && val !== null && 'value' in val && 'unit' in val) {
        return `${k}:${val.value}${val.unit}`;
      }
      return `${k}:${val}`;
    })
    .join('|');
};

export default function EditProductForm({ locale, initialData, initialVariants = [] }: EditProductFormProps) {
  const t = useTranslations('products.form');
  const router = useRouter();
  const getTrans = useTrans();
  const updateMutation = useUpdateProduct();
  console.log('initialData ', initialData);
  // ─── Derived initial values ──────────────────────────
  const defaultTitle = useMemo(() => {
    if (typeof initialData.title === 'object') return initialData.title;
    return { en: String(initialData.title || ''), ar: '' };
  }, [initialData.title]);

  const defaultDesc = useMemo(() => {
    if (typeof initialData.description === 'object') return initialData.description;
    return { en: String(initialData.description || ''), ar: '' };
  }, [initialData.description]);

  const initialCategoryId = useMemo(() => {
    if (typeof initialData.category === 'string') return initialData.category;
    return initialData.category?._id || '';
  }, [initialData.category]);

  const initialSupCatIds = useMemo(() => {
    return (initialData.supCategories || []).map(sc => typeof sc === 'string' ? sc : sc._id);
  }, [initialData.supCategories]);

  const initialBrandId = useMemo(() => {
    if (!initialData.brand) return '';
    return typeof initialData.brand === 'string' ? initialData.brand : initialData.brand._id;
  }, [initialData.brand]);

  const initialSupplierId = useMemo(() => {
    if (!initialData.supplier) return '';
    return typeof initialData.supplier === 'string' ? initialData.supplier : initialData.supplier._id;
  }, [initialData.supplier]);

  const getLabel = (obj: unknown): string => {
    if (!obj || typeof obj !== 'object') return '';
    const item = obj as { name: string | { en: string; ar: string } };
    if (!item.name) return '';
    if (typeof item.name === 'string') return item.name;
    return getTrans(item.name as { en: string; ar: string });
  };

  // 🌟 استعادة الأرقام المفقودة من المتغيرات لعرضها في منشئ الخصائص 🌟
  const initialAttributes = useMemo(() => {
    console.log("initialData allowedAttributes", initialData.allowedAttributes);

    const attrs = initialData.allowedAttributes || [];
    return attrs.map(attr => {
      if (attr.type === 'number') {
        const extractedValues = new Set<string>();
        initialVariants.forEach(v => {
          const val = v.attributes[attr.name];
          if (typeof val === 'object' && val !== null && 'value' in val) {
            extractedValues.add(String(val.value));
          }
        });
        return {
          ...attr,
          allowedValues: Array.from(extractedValues),
          allowedUnits: attr.allowedUnits || []
        };
      }
      return {
        ...attr,
        allowedValues: attr.allowedValues || []
      };
    }) as AttributeDefinition[];
  }, [initialData.allowedAttributes, initialVariants]);

  // ─── Form setup ──────────────────────────────────────
  const form = useForm<EditProductInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editProductSchema) as any,
    defaultValues: {
      title: defaultTitle as { en: string; ar: string },
      description: defaultDesc as { en: string; ar: string },
      isUnlimitedStock: initialData.isUnlimitedStock ?? true,
      disabled: initialData.disabled ?? false,
      isFeatured: initialData.isFeatured ?? false,
      category: initialCategoryId,
      supCategories: initialSupCatIds,
      brand: initialBrandId,
      supplier: initialSupplierId,
      allowedAttributes: initialAttributes,
      variantsToCreate: [],
      variantsToUpdate: [],
      variantsToDelete: [],
    },
  });

  const { register, setValue, watch, handleSubmit, formState: { errors, isSubmitting } } = form;
  console.log("errors", errors);

  // ─── Media State ─────────────────────────────────────
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData.imageCover || null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData.images || []);


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
  const [existingImages, setExistingImages] = useState<string[]>(initialData.images || []);
  const [selectedSubCategories, setSelectedSubCategories] = useState<SearchOption[]>(
    ((initialData?.supCategories as unknown as (Category | string)[]) || []).map((sc) => ({
      _id: typeof sc === 'object' ? sc._id : String(sc),
      name: typeof sc === 'object' ? sc.name : { en: 'Selected', ar: 'تم التحديد' }
    })) as SearchOption[]
  );

  // ─── Attribute & Variant State ───────────────────────
  const [attributes, setAttributes] = useState<AttributeDefinition[]>(initialAttributes);

  const [existingVariants, setExistingVariants] = useState<VariantRow[]>(
    initialVariants.map(v => ({
      _id: v._id,
      sku: v.sku || '',
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      attributes: v.attributes || {},
      components: v.components as { name: string; value: number; unit: string }[] || [],
      label: v.label,
      isActive: v.isActive,
    }))
  );
  const [newVariants, setNewVariants] = useState<VariantRow[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

  // Snapshot for change detection
  const [originalVariants] = useState<VariantRow[]>(
    initialVariants.map(v => ({
      _id: v._id,
      sku: v.sku || '',
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      attributes: v.attributes || {},
      components: v.components as { name: string; value: number; unit: string }[] || [],
      label: v.label,
      isActive: v.isActive,
    }))
  );

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

  // ─── Regenerate new combos ────────────────────────────
  const handleAttributesChange = useCallback((newAttrs: AttributeDefinition[]) => {
    setAttributes(newAttrs);
    const combos = cartesian(newAttrs);

    // استخدام الدالة المساعدة لضمان قراءة الكائنات بشكل سليم عند المقارنة
    const existingKeys = new Set(existingVariants.map(v => getVariantKey(v.attributes)));

    const newCombos = combos.filter(combo => {
      const key = getVariantKey(combo);
      return !existingKeys.has(key);
    });

    setNewVariants(newCombos.map(combo => {
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
    }));
  }, [existingVariants]);

  const addNewVariant = () => {
    setNewVariants(prev => [...prev, { sku: '', price: 0, stock: 0, attributes: {}, isActive: true }]);
  };

  const markForDelete = (id: string) => setDeletedVariantIds(prev => [...prev, id]);
  const unmarkDelete = (id: string) => setDeletedVariantIds(prev => prev.filter(d => d !== id));

  // ─── Sync to form ────────────────────────────────────
  useEffect(() => { setValue('allowedAttributes', attributes); }, [attributes, setValue]);

  useEffect(() => {
    const changed = existingVariants.filter(v => {
      if (!v._id) return false;
      const orig = originalVariants.find(o => o._id === v._id);
      if (!orig) return false;
      return v.sku !== orig.sku || v.price !== orig.price || v.stock !== orig.stock ||
        v.priceAfterDiscount !== orig.priceAfterDiscount || v.isActive !== orig.isActive;
    });

    setValue('variantsToUpdate', changed.map(v => ({
      _id: v._id!,
      sku: v.sku || undefined,
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      isActive: v.isActive,
    })));

    setValue('variantsToCreate', newVariants.map(v => ({
      sku: v.sku || undefined,
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      attributes: v.attributes,
      components: v.components,
      label: v.label,
      isActive: v.isActive,
    })));

    setValue('variantsToDelete', deletedVariantIds);
  }, [existingVariants, newVariants, deletedVariantIds, originalVariants, setValue]);

  // ─── Media handlers ──────────────────────────────────
  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(initialData.imageCover || null);
    }
  };

  const handleGalleryAdd = (file: File) => {
    setGalleryFiles(prev => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => setGalleryPreviews(prev => [...prev, e.target?.result as string]);
    reader.readAsDataURL(file);
  };

  const handleGalleryRemove = (index: number) => {
    // 1. الحصول على الرابط/المعاينة التي نريد حذفها
    const targetUrl = galleryPreviews[index];
    console.log(index, 'index');

    console.log(existingImages.length, 'existingImages.length');

    // 2. إذا كان الرابط يبدأ بـ http أو / فهو غالباً صورة قديمة من السيرفر
    if (typeof targetUrl === 'string' && (targetUrl.startsWith('http') || targetUrl.startsWith('/'))) {
      setExistingImages(prev => prev.filter(url => url !== targetUrl));
    } else {
      // 3. إذا كانت صورة جديدة (DataURL)، نحسب موقعها في مصفوفة الملفات
      // الموقع في مصفوفة الملفات = الموقع الحالي - عدد الصور القديمة المتبقية
      const fileIndex = index - existingImages.length;
      setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    // 4. حذف المعاينة من المصفوفة العامة للعرض في كل الأحوال
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Submit ──────────────────────────────────────────
  const onSubmit = async (data: EditProductInput) => {
    // console.log("data ....", data);
    if (!coverFile && !initialData.imageCover) {
      setCoverError(t('coverImageRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('title', JSON.stringify(data.title));
    formData.append('description', JSON.stringify(data.description));
    formData.append('category', data.category);
    data.supCategories?.forEach((id) => formData.append('supCategories', id));
    formData.append('isUnlimitedStock', String(data.isUnlimitedStock));
    formData.append('disabled', String(data.disabled));
    formData.append('isFeatured', String(data.isFeatured));

    if (data.brand) formData.append('brand', data.brand);
    if (data.supplier) formData.append('supplier', data.supplier);

    // 🌟 تنظيف allowedAttributes قبل الإرسال لتطابق الباك إند 🌟
    const formattedAllowedAttributes = data.allowedAttributes?.map((attr) => {
      if (attr.type === 'number') {
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

    // console.log('Editing Product - formattedAllowedAttributes:', formattedAllowedAttributes);
    formData.append('allowedAttributes', JSON.stringify(formattedAllowedAttributes || []));

    const variantOps = {
      create: data.variantsToCreate || [],
      update: data.variantsToUpdate || [],
      delete: data.variantsToDelete || [],
    };
    // console.log('Variant Operations:', variantOps);
    formData.append('variants', JSON.stringify(variantOps));

    if (coverFile) formData.append('imageCover', coverFile);

    // إرسال الملفات الجديدة (ستذهب إلى files.images في NestJS)
    galleryFiles.forEach(f => formData.append('images', f));
    // إرسال الروابط القديمة (ستذهب إلى updateProductDto.images في NestJS)
    existingImages.forEach((url) => {
      formData.append('images', url);
    });

    if (pdfFile) formData.append('infoProductPdf', pdfFile);
    console.log('formData images on submit', formData.getAll('images'));
    await updateMutation.mutateAsync({ id: initialData._id, data: formData });
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
            {t('titleEdit')}
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
            form="edit-product-form"
            className="rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
            isLoading={isSubmitting || updateMutation.isPending}
          >
            {t('save')}
          </Button>
        </div>
      </div>

      <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          {/* Existing Variants */}
          {existingVariants.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                {t('existingVariants')} ({existingVariants.length})
              </h3>
              <VariantTable
                variants={existingVariants}
                onChange={setExistingVariants}
                mode="edit"
                deletedIds={deletedVariantIds}
                onMarkForDelete={markForDelete}
                onUnmarkDelete={unmarkDelete}
              />
            </div>
          )}

          {/* New Variants */}
          {newVariants.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider px-1">
                {t('newVariants')} ({newVariants.length})
              </h3>
              <VariantTable
                variants={newVariants}
                onChange={setNewVariants}
                mode="create"
              />
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-xl gap-1.5 font-bold text-xs"
            onClick={addNewVariant}
          >
            <Icons.Plus className="w-4 h-4" />
            {t('addVariant')}
          </Button>

          {/* Media */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm">{t('coverImage')}</h3>
            </div>
            <div className="space-y-4">
              <ImageUpload
                value={coverPreview || undefined}
                onChange={(file: File) => handleCoverChange(file)}
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
                {pdfFile ? pdfFile.name : (initialData.infoProductPdf ? 'Current PDF attached' : t('attachPdf'))}
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
                  setValue('supCategories', []);
                  setSelectedSubCategories([]);
                }}
                error={errors.category?.message as string}
                initialDisplayValue={getLabel(initialData?.category)}
              />

              <SearchableMultiSelect
                label={t('subCategories')}
                placeholder={t('searchSubCategory')}
                error={errors.supCategories?.message as string}
                isLoading={isSubCategoriesFetching}
                options={(subCategoriesData?.data as unknown as SearchOption[]) || []}
                selectedOptions={selectedSubCategories}
                getDisplayValue={(opt: SearchOption) => getTrans(opt.name as LocalizedString)}
                onSearch={(term: string) => setSubCategorySearch(term)}
                onOpen={() => setIsSubCategoryOpen(true)}
                onSelect={(opt: SearchOption) => {
                  const newSelected = [...selectedSubCategories, opt];
                  setSelectedSubCategories(newSelected);
                  setValue('supCategories', newSelected.map(sc => sc._id), { shouldValidate: true });
                }}
                onRemove={(id: string) => {
                  const newSelected = selectedSubCategories.filter(sc => sc._id !== id);
                  setSelectedSubCategories(newSelected);
                  setValue('supCategories', newSelected.map(sc => sc._id), { shouldValidate: true });
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
                initialDisplayValue={getLabel(initialData?.brand)}
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
                initialDisplayValue={getLabel(initialData?.supplier)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm">{t('statusSettings')}</h3>
            </div>
            <div className="space-y-4">
              <Switch {...register('isUnlimitedStock')} label={t('unlimitedStock')} defaultChecked={initialData.isUnlimitedStock} />
              <div className="h-px bg-border/50 w-full" />
              <Switch {...register('isFeatured')} label={t('featured')} description={t('featuredDesc')} defaultChecked={initialData.isFeatured} />
              <div className="h-px bg-border/50 w-full" />
              <Switch {...register('disabled')} label={t('disabled')} description={t('disabledDesc')} defaultChecked={initialData.disabled} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
