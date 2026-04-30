
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { editProductSchema, EditProductInput } from '@/features/products/product.schema';
import { useUpdateProduct } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useSubCategories } from '@/features/categories/hooks/useSubCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useTrans } from '@/shared/hooks/useTrans';
import { useToast } from '@/shared/hooks/useToast';
import { LocalizedString, Product, ProductVariant, Category, SubCategory } from '@/types';
import { SearchOption } from '@/shared/ui/form/SearchableSelect';

import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { Icons } from '@/shared/ui/Icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import { SearchableSelect } from '@/shared/ui/form/SearchableSelect';
import { SearchableMultiSelect } from '@/shared/ui/form/SearchableMultiSelect';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import AttributeBuilder, { AttributeDefinition } from './shared/AttributeBuilder';
import ComponentBuilder from './shared/ComponentBuilder';
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
        // للأوزان والأحجام: كل قيمة مرتبطة بالوحدة الموجودة في نفس الموقع (zip)
        // مثال: values=[50, 40], units=[kg, kg] => [{value:50,unit:'kg'}, {value:40,unit:'kg'}]
        const values = attr.allowedValues || [];
        const units = attr.allowedUnits || [];
        options = values.map((v, i) => ({ value: Number(v), unit: units[i] ?? units[0] }));
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
const getVariantKey = (attrs: Record<string, any> = {}) => {
  return Object.entries(attrs || {})
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
  const toast = useToast();
  const router = useRouter();
  const getTrans = useTrans();
  const updateMutation = useUpdateProduct();
  console.log('initialData ', initialData);
  console.log('initialVariants ', initialVariants);
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
    return (initialData.SubCategories || []).map(sc => typeof sc === 'string' ? sc : sc._id);
  }, [initialData.SubCategories]);

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
    const attrs = initialData.allowedAttributes || [];
    console.log("attr ", attrs);
    return attrs.map(attr => {
      if (attr.type.toLocaleLowerCase().trim() === 'number') {
        const extractedValues = new Set<string>();
        console.log("initialVariants --------------", initialVariants);
        initialVariants.forEach(v => {
          console.log("v.attributes", v);
          const val = v.attributes?.[attr.name];
          console.log("val", val);
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
      isActive: initialData.isActive ?? true,
      isFeatured: initialData.isFeatured ?? false,
      category: initialCategoryId,
      SubCategories: initialSupCatIds,
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
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(initialData.images || []);
  const [selectedSubCategories, setSelectedSubCategories] = useState<SearchOption[]>(

    ((initialData?.SubCategories as unknown as SubCategory[]) || []).map((sc) => ({
      _id: typeof sc === 'object' ? sc._id : String(sc),
      name: typeof sc === 'object' ? sc.name : { en: 'Selected', ar: 'تم التحديد' }
    })) as SearchOption[]
  );

  // ─── Global Components State (A+B) ───────────────────
  const [globalComponents, setGlobalComponents] = useState<{ name: string; value: number; unit: string }[]>([]);

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

  // Watched values
  const watchedCategory = watch('category');
  const watchedBrand = watch('brand');
  const watchedSupplier = watch('supplier');

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
    { keywords: subCategorySearch, category: watchedCategory },
    { enabled: isSubCategoryOpen && !!watchedCategory }
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
          return `${v.value}-${v.unit}`.toUpperCase().trim();
        }
        return String(v).toUpperCase().replace(/\s+/g, '-').trim();
      });

      return {
        sku: skuParts.join('-'),
        price: 0,
        stock: 0,
        attributes: combo,
        isActive: true,
        components: globalComponents, // نستخدم المكونات العالمية كبداية
      };
    }));
  }, [existingVariants, globalComponents]);

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

      const componentsChanged = JSON.stringify(v.components) !== JSON.stringify(orig.components);

      return v.sku !== orig.sku || v.price !== orig.price || v.stock !== orig.stock ||
        v.priceAfterDiscount !== orig.priceAfterDiscount || v.isActive !== orig.isActive ||
        componentsChanged;
    });

    setValue('variantsToUpdate', changed.map(v => ({
      _id: v._id!,
      sku: v.sku || undefined,
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      isActive: v.isActive,
      components: v.components,
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
    if (galleryPreviews.length >= 3) {
      toast.error(t('maxGalleryImagesReached', { defaultValue: 'You can only upload up to 3 images' }));
      return;
    }
    setGalleryFiles(prev => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => setGalleryPreviews(prev => [...prev, e.target?.result as string]);
    reader.readAsDataURL(file);
  };

  const handleGalleryRemove = (index: number) => {
    // 1. الحصول على الرابط/المعاينة التي نريد حذفها
    const targetUrl = galleryPreviews[index];

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
    console.log("data ....", data);
    if (!coverFile && !initialData.imageCover) {
      setCoverError(t('coverImageRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('title', JSON.stringify(data.title));
    formData.append('description', JSON.stringify(data.description));
    formData.append('category', data.category);
    data.SubCategories?.forEach((id) => formData.append('SubCategories', id));
    formData.append('isUnlimitedStock', String(data.isUnlimitedStock));
    formData.append('isActive', String(data.isActive));
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
    await updateMutation.mutateAsync({ id: initialData._id, data: formData });
    // router.push(`/${locale}/dashboard/products`);
  };

  // Watched values - moved up

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md pb-4 pt-6 border-b border-border/40 flex items-center justify-between">
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
          <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <Icons.Edit className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="font-bold text-sm">{t('basicInformation')}</h3>
                <p className="text-xs text-muted-foreground">{t('basicDesc')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Input icon={Icons.Edit} iconColor="text-blue-500" error={errors.title?.en?.message} {...register('title.en')} label={t('titleEn')} className="h-11 rounded-xl" showAiAction aiActionTooltip={t('aiTranslateImprove')} />
              </div>
              <div className="space-y-2">
                <Input icon={Icons.Edit} iconColor="text-blue-500" error={errors.title?.ar?.message} {...register('title.ar')} label={t('titleAr')} dir="rtl" className="h-11 rounded-xl" showAiAction aiActionTooltip={t('aiTranslateImprove')} />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Textarea icon={Icons.Edit} iconColor="text-indigo-500" {...register('description.en')} error={errors.description?.en?.message} label={t('descEn')} className="rounded-xl min-h-[100px]" showAiAction aiActionTooltip={t('aiTranslateImprove')} />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Textarea icon={Icons.Edit} iconColor="text-indigo-500" {...register('description.ar')} error={errors.description?.ar?.message} label={t('descAr')} dir="rtl" className="rounded-xl min-h-[100px]" showAiAction aiActionTooltip={t('aiTranslateImprove')} />
              </div>
            </div>
          </div>

          {/* Attributes Builder */}
          <AttributeBuilder attributes={attributes} onChange={handleAttributesChange} />

          {/* Components Section */}
          <ComponentBuilder components={globalComponents} onChange={setGlobalComponents} />

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
                globalComponents={globalComponents}
              />
            </div>
          )}

          {/* New Variants */}
          {newVariants.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-success uppercase tracking-wider px-1">
                {t('newVariants')} ({newVariants.length})
              </h3>
              <VariantTable
                variants={newVariants}
                onChange={setNewVariants}
                mode="create"
                globalComponents={globalComponents}
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
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-6">

          {/* Media */}
          <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <Icons.Eye className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="font-bold text-sm">{t('coverImage')}</h3>
              </div>
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
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setIsGalleryExpanded(!isGalleryExpanded)}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t('galleryImages')}</h4>
                  {galleryPreviews.length > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {galleryPreviews.length}
                    </span>
                  )}
                </div>
                <Icons.ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isGalleryExpanded ? 'rotate-180' : ''}`} />
              </div>
              
              {isGalleryExpanded ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                    {galleryPreviews.length < 3 && (
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
                    )}
                  </div>
                </div>
              ) : (
                galleryPreviews.length > 0 ? (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-3 overflow-hidden">
                      {galleryPreviews.slice(0, 4).map((src, i) => (
                        <img key={i} src={src} alt="" className="inline-block h-10 w-10 rounded-lg ring-2 ring-card object-cover" />
                      ))}
                      {galleryPreviews.length > 4 && (
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-[10px] font-bold ring-2 ring-card">
                          +{galleryPreviews.length - 4}
                        </div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setIsGalleryExpanded(true); }}
                      className="text-[10px] font-bold text-primary hover:underline ml-2"
                    >
                      {t('manageGallery') || 'Manage Gallery'}
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsGalleryExpanded(true)}
                    className="w-full py-4 border border-dashed border-border/40 rounded-xl flex flex-col items-center gap-2 text-muted-foreground hover:bg-muted/30 transition-all"
                  >
                    <Icons.Plus className="w-5 h-5" />
                    <span className="text-xs font-bold">{t('addGalleryImages') || 'Add Gallery Images'}</span>
                  </button>
                )
              )}
            </div>

            {/* PDF */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t('productPdf')}</h4>
              <p className="text-xs text-muted-foreground">{t('pdfDesc')}</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors text-sm font-medium">
                {pdfFile ? pdfFile.name : (initialData.infoProductPdf ? 'Current PDF attached' : t('attachPdf'))}
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <Icons.Settings className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="font-bold text-sm">{t('statusSettings')}</h3>
              </div>
            </div>
            <div className="space-y-4">
              <Switch {...register('isUnlimitedStock')} label={t('unlimitedStock')} defaultChecked={initialData.isUnlimitedStock} />
              <div className="h-px bg-border/50 w-full" />
              <Switch {...register('isFeatured')} label={t('featured')} description={t('featuredDesc')} defaultChecked={initialData.isFeatured} />
              <div className="h-px bg-border/50 w-full" />
              <Switch {...register('isActive')} label={t('disabled')} description={t('disabledDesc')} defaultChecked={initialData.isActive} />
            </div>
          </div>

          {/* Taxonomy */}
          <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <Icons.Categories className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="font-bold text-sm">{t('taxonomy')}</h3>
                <p className="text-xs text-muted-foreground">{t('taxonomyDesc')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <SearchableSelect
                icon={Icons.Brands}
                iconColor="text-rose-500"
                label={t('brand')}
                // placeholder={t('searchBrand')}
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
                icon={Icons.Users}
                iconColor="text-teal-500"
                label={t('supplier')}
                // placeholder={t('searchSupplier')}
                value={watchedSupplier || ''}
                isLoading={isSuppliersFetching}
                options={(suppliersData?.data as unknown as SearchOption[]) || []}
                getDisplayValue={(opt: SearchOption) => String(opt.name)}
                onSearch={(term: string) => setSupplierSearch(term)}
                onOpen={() => setIsSupplierOpen(true)}
                onSelect={(id: string) => setValue('supplier', id)}
                initialDisplayValue={getLabel(initialData?.supplier)}
              />

              <SearchableSelect
                icon={Icons.Categories}
                iconColor="text-amber-500"
                label={t('mainCategory')}
                // placeholder={t('searchCategory')}
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
                initialDisplayValue={getLabel(initialData?.category)}
              />

              <SearchableMultiSelect
                icon={Icons.SubCategories}
                iconColor="text-orange-500"
                label={watchedCategory ? t('searchSubCategory') : t('selectCategoryFirst')}
                disabled={!watchedCategory}
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
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
