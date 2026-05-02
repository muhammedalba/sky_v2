'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { editProductSchema, EditProductInput } from '@/features/products/product.schema';
import { useUpdateProduct } from '@/features/products/hooks/useProducts';
import { useTrans } from '@/shared/hooks/useTrans';
import { useToast } from '@/shared/hooks/useToast';
import { Product, ProductVariant, SubCategory } from '@/types';
import { SearchOption } from '@/shared/ui/form/SearchableSelect';

import { Button } from '@/shared/ui/Button';
import FormStickyHeader from '@/shared/ui/dashboard/FormStickyHeader';
import AttributeBuilder, { AttributeDefinition } from './shared/AttributeBuilder';
import VariantTable, { VariantRow } from './shared/VariantTable';
import { ProductBasicInfo } from './shared/ProductBasicInfo';
import { ProductStatusPanel } from './shared/ProductStatusPanel';
import { ProductMediaPanel } from './shared/ProductMediaPanel';
import { ProductTaxonomyPanel } from './shared/ProductTaxonomyPanel';
import { cartesian, getVariantKey } from './shared/utils/cartesian';
import { useProductFormOptions } from './shared/hooks/useProductFormOptions';

interface EditProductFormProps {
  locale: string;
  initialData: Product;
  initialVariants?: ProductVariant[];
}

/**
 * مكون `EditProductForm`
 * 
 * هذا المكون هو المسؤول عن واجهة "تعديل المنتج" في لوحة التحكم. يتعامل مع بيانات المنتج الأساسية، 
 * الصور، التصنيفات، والأهم من ذلك: إدارة المتغيرات (Variants) والسمات (Attributes) المعقدة.
 * 
 * ملاحظات للمطورين:
 * - لإضافة حقول جديدة، تأكد من إضافتها في `product.schema.ts`، و`defaultValues` للنموذج، ودالة `onSubmit` لربطها بـ FormData.
 * - تعتمد حالة `variantsToUpdate` على مقارنة التغييرات مع النسخة الأصلية `originalVariants`.
 */
export default function EditProductForm({ locale, initialData, initialVariants = [] }: EditProductFormProps) {
  const t = useTranslations('products.form');
  const tError = (msg?: string) => (msg ? (msg.startsWith('validation.') ? t(msg) : msg) : undefined);
  const toast = useToast();
  const router = useRouter();
  const getTrans = useTrans();
  const updateMutation = useUpdateProduct();


  // ─── التهيئة واستخراج البيانات الأولية (Derived Initial Values) ─────────
  // يتم هنا التأكد من استخراج البيانات من `initialData` وتحويلها لتلائم صيغة حقول النموذج
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

  const initialBrandId = useMemo(() => {
    if (!initialData.brand) return '';
    return typeof initialData.brand === 'string' ? initialData.brand : initialData.brand._id;
  }, [initialData.brand]);

  const initialSupplierId = useMemo(() => {
    if (!initialData.supplier) return '';
    return typeof initialData.supplier === 'string' ? initialData.supplier : initialData.supplier._id;
  }, [initialData.supplier]);

  /**
   * دالة مساعدة تأخذ كائناً (مثل الماركة أو التصنيف) وتستخرج منه الاسم،
   * سواء كان سلسلة نصية بسيطة أو كائناً متعدد اللغات باستخدام الترجمة.
   */
  const getLabel = (obj: unknown): string => {
    if (!obj || typeof obj !== 'object') return '';
    const item = obj as { name: string | { en: string; ar: string } };
    if (!item.name) return '';
    if (typeof item.name === 'string') return item.name;
    return getTrans(item.name as { en: string; ar: string });
  };

  // 🌟 استعادة السمات والبيانات من المتغيرات الموجودة 🌟
  // خاصة للسمات الرقمية (Number): نستخرج جميع القيم الرقمية المستخدمة 
  // في المتغيرات الحالية `initialVariants` ونضعها في `allowedValues` 
  // لكي تظهر بشكل صحيح في منشئ السمات (Attribute Builder).
  const initialAttributes = useMemo(() => {
    const attrs = initialData.allowedAttributes || [];
    return attrs.map((attr) => {
      if (attr.type.toLocaleLowerCase().trim() === 'number') {
        const extractedValues = new Set<string>();
        initialVariants.forEach((v) => {
          const val = v.attributes?.[attr.name];
          if (typeof val === 'object' && val !== null && 'value' in val) {
            extractedValues.add(String(val.value));
          }
        });
        return { ...attr, allowedValues: Array.from(extractedValues), allowedUnits: attr.allowedUnits || [] };
      }
      return { ...attr, allowedValues: attr.allowedValues || [] };
    }) as AttributeDefinition[];
  }, [initialData.allowedAttributes, initialVariants]);

  // ─── Form setup ──────────────────────────────────────
  const form = useForm<EditProductInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editProductSchema) as any,
    defaultValues: {
      title: defaultTitle as { en: string; ar: string },
      description: defaultDesc as { en: string; ar: string },
      uses: (initialData.uses as { en: string[]; ar: string[] }) || { en: [], ar: [] },
      isUnlimitedStock: initialData.isUnlimitedStock ?? true,
      isActive: initialData.isActive ?? true,
      isFeatured: initialData.isFeatured ?? false,
      category: initialCategoryId,
      SubCategories: (initialData.SubCategories || []).map((sc) =>
        typeof sc === 'string' ? sc : sc._id,
      ),
      brand: initialBrandId,
      supplier: initialSupplierId,
      allowedAttributes: initialAttributes,
      variantsToCreate: [],
      variantsToUpdate: [],
      variantsToDelete: [],
      imageCover: initialData.imageCover,
    },
  });

  const { register, setValue, watch, handleSubmit, formState: { errors, isSubmitting } } = form;

  // ─── Media State ─────────────────────────────────────
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData.imageCover || null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData.images || []);
  const [existingImages, setExistingImages] = useState<string[]>(initialData.images || []);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  // ─── SubCategory selection state ─────────────────────
  const [selectedSubCategories, setSelectedSubCategories] = useState<SearchOption[]>(
    ((initialData?.SubCategories as unknown as SubCategory[]) || []).map((sc) => ({
      _id: typeof sc === 'object' ? sc._id : String(sc),
      name: typeof sc === 'object' ? sc.name : { en: 'Selected', ar: 'تم التحديد' },
    })) as SearchOption[],
  );

  // ─── Attribute & Variant State ───────────────────────
  const [attributes, setAttributes] = useState<AttributeDefinition[]>(initialAttributes);

  const [existingVariants, setExistingVariants] = useState<VariantRow[]>(
    initialVariants.map((v) => ({
      _id: v._id,
      sku: v.sku || '',
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      attributes: v.attributes || {},
      components: (v.components as { name: string; value: number; unit: string }[]) || [],
      label: v.label,
      isActive: v.isActive,
    })),
  );

  const [newVariants, setNewVariants] = useState<VariantRow[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  const [autoDeletedVariantIds, setAutoDeletedVariantIds] = useState<string[]>([]);

  // Snapshot for change detection
  const [originalVariants] = useState<VariantRow[]>(
    initialVariants.map((v) => ({
      _id: v._id,
      sku: v.sku || '',
      price: v.price,
      priceAfterDiscount: v.priceAfterDiscount,
      stock: v.stock,
      attributes: v.attributes || {},
      components: (v.components as { name: string; value: number; unit: string }[]) || [],
      label: v.label,
      isActive: v.isActive,
    })),
  );

  // ─── Watched values ───────────────────────────────────
  const watchedCategory = watch('category');
  const watchedBrand = watch('brand');
  const watchedSupplier = watch('supplier');

  // ─── Search states + data fetching (shared hook) ─────
  const options = useProductFormOptions(watchedCategory);

  // ─── إعادة توليد المتغيرات عند تعديل السمات (Core Variant Logic) ────
  /**
   * تُستدعى هذه الدالة كلما قام المستخدم بتعديل السمات (إضافة/حذف سمة، أو إضافة/حذف قيمة).
   * 1. تحفظ السمات الجديدة وتبني خريطة بالقيم المسموحة.
   * 2. تفحص المتغيرات الحالية: إذا كانت تعتمد على سمة أو قيمة تم حذفها، يتم نقلها للمحذوفات تلقائياً.
   * 3. تولد احتمالات المتغيرات الجديدة `cartesian` بناءً على السمات الجديدة.
   * 4. تستبعد الاحتمالات الموجودة مسبقاً وتضيف المتبقي كمتغيرات جديدة.
   */
  const handleAttributesChange = useCallback(
    (newAttrs: AttributeDefinition[]) => {
      setAttributes(newAttrs);

      // Build lookup: attrName → Set of still-allowed values (string comparison)
      const allowedValuesByName = new Map<string, Set<string>>();
      newAttrs.forEach((attr) => {
        if (attr.type === 'string') {
          allowedValuesByName.set(attr.name, new Set((attr.allowedValues || []).map(String)));
        } else if (attr.type === 'number') {
          // For number attrs only values matter; units can shift so we match by numeric value
          allowedValuesByName.set(attr.name, new Set((attr.allowedValues || []).map(String)));
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
            typeof val === 'object' && val !== null && 'value' in val
              ? String((val as { value: number }).value)
              : String(val);
          return !allowed.has(strVal);
        });

        if ((nameRemoved || valueRemoved) && v._id) {
          invalidatedIds.push(v._id);
        } else {
          stillValidExisting.push(v);
        }
      });

      // Auto-mark invalidated variants for deletion (deduplicated)
      setAutoDeletedVariantIds(invalidatedIds);
      if (invalidatedIds.length > 0) {
        setDeletedVariantIds((prev) => [...new Set([...prev, ...invalidatedIds])]);
      }

      // Generate new combos only against STILL-VALID existing variants
      const combos = cartesian(newAttrs);
      const existingKeys = new Set(stillValidExisting.map((v) => getVariantKey(v.attributes)));
      const newCombos = combos.filter((combo) => !existingKeys.has(getVariantKey(combo)));

      setNewVariants(
        newCombos.map((combo) => {
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
    },
    [existingVariants],
  );

  const markForDelete = (id: string) => setDeletedVariantIds((prev) => [...prev, id]);
  const unmarkDelete = (id: string) => setDeletedVariantIds((prev) => prev.filter((d) => d !== id));

  // ─── Sync to form ────────────────────────────────────
  useEffect(() => {
    setValue('allowedAttributes', attributes);
  }, [attributes, setValue]);

  // ─── مزامنة حالات المتغيرات مع النموذج (Form Synchronization) ────
  // نظراً لأن المتغيرات تدار عبر `useState` منفصلة، يعمل هذا الخطاف كجسر
  // لتحديث قيم `react-hook-form` تلقائياً وإرسالها مع النموذج.
  // يتم التحقق من أي تعديل (في السعر أو المخزون الخ) بمقارنة `existingVariants` بـ `originalVariants`.
  useEffect(() => {
    const changed = existingVariants.filter((v) => {
      if (!v._id) return false;
      const orig = originalVariants.find((o) => o._id === v._id);
      if (!orig) return false;
      return (
        v.sku !== orig.sku ||
        v.price !== orig.price ||
        v.stock !== orig.stock ||
        v.priceAfterDiscount !== orig.priceAfterDiscount ||
        v.isActive !== orig.isActive ||
        JSON.stringify(v.components) !== JSON.stringify(orig.components)
      );
    });

    setValue(
      'variantsToUpdate',
      changed.map((v) => ({
        _id: v._id!,
        sku: v.sku || undefined,
        price: v.price,
        priceAfterDiscount: v.priceAfterDiscount,
        stock: v.stock,
        isActive: v.isActive,
        components: v.components,
      })),
    );

    setValue(
      'variantsToCreate',
      newVariants.map((v) => ({
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

    setValue('variantsToDelete', deletedVariantIds);
  }, [existingVariants, newVariants, deletedVariantIds, originalVariants, setValue]);

  // ─── إدارة الوسائط والصور (Gallery Handlers) ───────────────────────
  /**
   * تضيف صورة جديدة لمعرض الصور بحد أقصى 3 صور.
   * تقوم بتوليد رابط معاينة محلي باستخدام FileReader لعرض الصورة فوراً.
   */
  const handleGalleryAdd = (file: File) => {
    if (galleryPreviews.length >= 3) {
      toast.error(t('validation.maxGalleryImagesReached', { defaultValue: 'You can only upload up to 3 images' }));
      return;
    }
    setGalleryFiles((prev) => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => setGalleryPreviews((prev) => [...prev, e.target?.result as string]);
    reader.readAsDataURL(file);
  };

  /**
   * تحذف صورة من المعرض بناءً على الفهرس.
   * تفرّق بين الصور الموجودة مسبقاً (روابط) والصور المرفوعة حديثاً (ملفات).
   */
  const handleGalleryRemove = (index: number) => {
    const targetUrl = galleryPreviews[index];
    if (typeof targetUrl === 'string' && (targetUrl.startsWith('http') || targetUrl.startsWith('/'))) {
      setExistingImages((prev) => prev.filter((url) => url !== targetUrl));
    } else {
      const fileIndex = index - existingImages.length;
      setGalleryFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── الإرسال والحفظ (Submit) ─────────────────────────────────────────
  /**
   * دالة الإرسال الرئيسية.
   * - تتحقق من وجود صورة غلاف.
   * - تُجهز `FormData` لإرسال البيانات والملفات معاً.
   * - تفصل المتغيرات في عمليات إنشاء، تحديث، وحذف.
   */
  const onSubmit = async (data: EditProductInput) => {
    if (!coverFile && !initialData.imageCover) {
      setCoverError(t('coverImageRequired'));
      return;
    }

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

    const formattedAllowedAttributes = data.allowedAttributes?.map((attr) => {
      if (attr.type === 'number') {
        return { name: attr.name, type: attr.type, required: true, allowedUnits: attr.allowedUnits || [] };
      }
      return { name: attr.name, type: attr.type, required: true, allowedValues: attr.allowedValues || [] };
    });
    formData.append('allowedAttributes', JSON.stringify(formattedAllowedAttributes || []));

    const variantOps = {
      create: data.variantsToCreate || [],
      update: data.variantsToUpdate || [],
      delete: data.variantsToDelete || [],
    };
    formData.append('variants', JSON.stringify(variantOps));

    if (coverFile) formData.append('imageCover', coverFile);
    galleryFiles.forEach((f) => formData.append('images', f));
    existingImages.forEach((url) => formData.append('images', url));
    if (pdfFile) formData.append('infoProductPdf', pdfFile);

    updateMutation.mutate(
      { id: initialData._id, data: formData },
      {
        onSuccess: () => {
          router.push(`/${locale}/dashboard/products`);
        },
      }
    );
  };

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="pb-12">
      <FormStickyHeader
        title={t('titleEdit')}
        subtitle={t('subtitle')}
        cancelLabel={t('cancel')}
        saveLabel={t('save')}
        formId="edit-product-form"
        isSubmitting={isSubmitting || updateMutation.isPending}
        backUrl={`/${locale}/dashboard/products`}
      />

      <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <form
          id="edit-product-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-2 space-y-6">
            <ProductBasicInfo register={register} errors={errors as any} tError={tError} watch={watch} setValue={setValue} />

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
                  {t('newVariants')} ({newVariants.length})
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
              coverError={coverError}
              coverFieldError={tError(errors.imageCover?.message as string)}
              onCoverChange={(file) => {
                setCoverFile(file);
                const reader = new FileReader();
                reader.onload = (e) => setCoverPreview(e.target?.result as string);
                reader.readAsDataURL(file);
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
              existingPdfLabel={initialData.infoProductPdf ? 'Current PDF attached' : undefined}
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
