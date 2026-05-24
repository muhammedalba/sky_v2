'use client';

import { useState, use, useEffect, useMemo } from 'react';
import { useProduct } from '@/features/products/hooks/useProducts';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ShoppingBagIcon, StarIcon, MinusIcon, PlusIcon, FileTextIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';

import { useTrans } from '@/shared/hooks/useTrans';
import { useToast } from '@/shared/hooks/useToast';
import { Product, ProductVariant, ProductWithVariants } from '@/types';

// تحديث واجهة البيانات لتطابق شكل الباك إيند الجديد
interface ProductResponse {
    product: Product;
    variants: ProductVariant[];
}

interface CartItem {
    _id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    attributes?: Record<string, unknown>;
    [key: string]: unknown;
}

export default function ProductDetailsClient({ params, initialData }: { params: Promise<{ locale: string; slug: string }>, initialData: ProductWithVariants | null }) {
    const { slug, locale } = use(params);
    const getTrans = useTrans();
    const toast = useToast();
    
    // --- State ---
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    
    // سنقوم بتخزين قيمة المتغير المختار، مثلاً: { volume: "20" }
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    // --- Fetch Data ---
    const { data: fetchResponse, isLoading, error } = useProduct(slug);
    
    // استخراج المنتج والمتغيرات بناءً على الشكل الجديد للبيانات
    const payload = fetchResponse || initialData;
    const product = payload?.product ||{} as Product;
    const variants = payload?.variants || [];

    const hasVariants = variants.length > 0;

    // --- Variants Logic ---
    // العثور على المتغير (Variant) الذي يطابق اختيارات المستخدم
    const selectedVariant = useMemo(() => {
        if (!hasVariants) return null;
        
        return variants.find((v: any) => {
            return Object.entries(selectedAttributes).every(([attrName, selectedValue]) => {
                const variantAttr = v.attributes?.[attrName];
                // مطابقة القيمة (value) الموجودة داخل الكائن الخاص بالخاصية
                return String(variantAttr?.value) === String(selectedValue);
            });
        });
    }, [hasVariants, variants, selectedAttributes]);

    // تحديد أول متغير متاح تلقائياً عند التحميل
    useEffect(() => {
        if (hasVariants && Object.keys(selectedAttributes).length === 0) {
            const firstAvailable = variants.find((v: any) => v.isActive && v.stock > 0) || variants[0];
            
            if (firstAvailable?.attributes) {
                const initialSelections: Record<string, string> = {};
                Object.keys(firstAvailable.attributes).forEach((key) => {
                    initialSelections[key] = String(firstAvailable.attributes[key].value);
                });
                setSelectedAttributes(initialSelections);
            }
        }
    }, [hasVariants, variants, selectedAttributes]);

    // --- Handlers ---
    const handleAttributeSelect = (attributeName: string, value: string) => {
        setSelectedAttributes(prev => ({ ...prev, [attributeName]: value }));
        setQuantity(1); // تصفير الكمية عند تغيير الاختيار
    };

    const handleAddToCart = () => {
        if (!product) return;
        
        // التحقق من أن المستخدم اختار كل الخصائص المطلوبة
        if (hasVariants && product.allowedAttributes && Object.keys(selectedAttributes).length !== product.allowedAttributes.length) {
            toast.error(getTrans('please_select_all_options') || 'الرجاء تحديد جميع الخيارات');
            return;
        }

        setAdding(true);
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
            
            const cartItemId = selectedVariant ? selectedVariant._id : product._id;
            const itemPrice = selectedVariant?.priceAfterDiscount || selectedVariant?.price || product.priceRange?.min || 0;

            const existingItemIndex = cart.findIndex((item) => item._id === cartItemId);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += quantity;
            } else {
                cart.push({ 
                    _id: cartItemId,
                    productId: product._id,
                    variantId: selectedVariant?._id,
                    title: typeof product.title === 'string' ? product.title : getTrans(product.title),
                    image: selectedVariant?.image || product.imageCover,
                    price: itemPrice,
                    attributes: selectedVariant?.attributes,
                    quantity 
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            setTimeout(() => {
                setAdding(false);
                toast.success(getTrans('added_to_cart') || 'تمت الإضافة للسلة بنجاح!');
            }, 400);
        } catch (e) {
            console.error(e);
            setAdding(false);
        }
    };

    // --- Loading & Error States ---
    if (isLoading && !product) return <ProductLoadingSkeleton />;
    if (error || !product) return <ProductNotFound />;

    // --- Derived Display Values ---
    // معالجة النصوص بناءً على هيكل البيانات (سواء كانت Object للغات أو String مباشر)
    const title = typeof product.title === 'string' ? product.title : getTrans(product.title) || 'Product';
    const description = typeof product.description === 'string' ? product.description : getTrans(product.description);
    const categoryName = typeof product.category === 'object' ? getTrans(product.category?.name) : '';
    const brandName = typeof product.brand === 'object' ? getTrans(product.brand?.name) : '';
    
    const allImages = [product.imageCover, ...(product.images || [])].filter(Boolean) as string[];
    const currentDisplayImage = selectedVariant?.image || selectedImage || product.imageCover || '';

    // حساب السعر (تفعيل الخصم الخاص بالـ Variant إن وجد)
    const displayPrice = selectedVariant?.priceAfterDiscount || selectedVariant?.price || product.priceRange?.min || 0;
    const oldPrice = selectedVariant?.priceAfterDiscount ? selectedVariant.price : product.priceRange?.max;
    const hasDiscount = !!(oldPrice && oldPrice > displayPrice);
    
    const currentStock = hasVariants ? (selectedVariant?.stock ?? 0) : (product.stockSummary ?? 0);
    const isOutOfStock = currentStock <= 0 && !product.isUnlimitedStock;

    // معالجة الاستخدامات (البيانات القادمة كـ Array مباشر)
    const usesList = Array.isArray(product.uses) ? product.uses : [];

    return (
        <div className="bg-background min-h-screen pb-20">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap no-scrollbar">
                    <span>الرئيسية</span> <span className="text-border">/</span>
                    {categoryName && (
                        <><span>{categoryName}</span> <span className="text-border">/</span></>
                    )}
                    <span className="text-foreground font-medium truncate">{title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    
                    {/* GALLERY */}
                    <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
                        {allImages.length > 1 && (
                            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 shrink-0 p-1">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-20 md:w-full aspect-square shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 
                                            ${currentDisplayImage === img ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-secondary'}`}
                                    >
                                        <ImageWithFallback src={img} alt={`${title} ${i}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/5] bg-secondary/10 rounded-3xl overflow-hidden group">
                            {hasDiscount && (
                                <Badge className="absolute top-4 rtl:right-4 ltr:left-4 z-10 bg-destructive text-destructive-foreground font-bold px-3 py-1 text-sm shadow-lg">
                                    خصم {Math.round(((oldPrice - displayPrice) / oldPrice) * 100)}%
                                </Badge>
                            )}
                            <ImageWithFallback
                                src={currentDisplayImage}
                                alt={title}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                                priority
                            />
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="lg:col-span-5 relative">
                        <div className="lg:sticky lg:top-28 space-y-8">
                            
                            {/* Header Info */}
                            <div className="space-y-3">
                                {brandName && (
                                    <p className="text-sm font-bold tracking-widest text-primary uppercase">{brandName}</p>
                                )}
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                                    {title}
                                </h1>
                            </div>

                            {/* Price */}
                            <div className="flex items-end gap-4 p-4 rounded-2xl bg-secondary/20 border border-secondary/50">
                                <span className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
                                    {formatCurrency(displayPrice)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xl sm:text-2xl font-semibold text-muted-foreground line-through mb-1">
                                        {formatCurrency(oldPrice)}
                                    </span>
                                )}
                            </div>

                            <p className="text-base text-muted-foreground leading-relaxed">
                                {description}
                            </p>

                            {/* --- Variants Selector --- */}
                            {hasVariants && product.allowedAttributes && (
                                <div className="space-y-6 pt-6 border-t border-border/50">
                                    {product.allowedAttributes.map((attr: any) => {
                                        // استخراج الخيارات المتاحة لهذا المتغير مع وحداتها
                                        const optionsMap = new Map();
                                        variants.forEach((v: any) => {
                                            const attrData = v.attributes?.[attr.name];
                                            if (attrData && attrData.value) {
                                                optionsMap.set(String(attrData.value), attrData.unit || '');
                                            }
                                        });

                                        const uniqueValues = Array.from(optionsMap.keys());

                                        return (
                                            <div key={attr.name} className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold uppercase tracking-wider">{attr.name}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                                    {uniqueValues.map((val) => {
                                                        const isSelected = selectedAttributes[attr.name] === val;
                                                        const unit = optionsMap.get(val);
                                                        
                                                        // التحقق من توفر الكمية لهذا الخيار
                                                        const isAvailable = variants.some((v: any) => 
                                                            String(v.attributes[attr.name]?.value) === val && (v.stock > 0 || product.isUnlimitedStock)
                                                        );

                                                        return (
                                                            <button
                                                                key={val}
                                                                onClick={() => handleAttributeSelect(attr.name, val)}
                                                                disabled={!isAvailable}
                                                                className={`h-12 px-6 rounded-xl font-medium text-sm transition-all border-2 flex items-center justify-center gap-1
                                                                    ${isSelected ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-border/50 bg-background text-foreground hover:border-primary/50'}
                                                                    ${!isAvailable ? 'opacity-40 cursor-not-allowed line-through decoration-muted-foreground' : ''}
                                                                `}
                                                            >
                                                                <span dir="ltr">{val} {unit}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* --- Action Area --- */}
                            <div className="pt-6 border-t border-border/50 space-y-4">
                                <div className={`flex items-center gap-2 text-sm font-bold ${isOutOfStock ? 'text-destructive' : 'text-success'}`}>
                                    {isOutOfStock ? <AlertCircleIcon className="w-5 h-5" /> : <CheckCircle2Icon className="w-5 h-5" />}
                                    {isOutOfStock 
                                        ? 'المنتج غير متوفر حالياً' 
                                        : (product.isUnlimitedStock ? 'متوفر بالمخزون' : `متبقي ${currentStock} قطع فقط`)}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center border-2 border-border/60 rounded-2xl h-14 bg-background p-1 w-full sm:w-36 shrink-0">
                                        <button
                                            className="w-10 h-full flex items-center justify-center hover:bg-secondary rounded-xl transition-colors disabled:opacity-30"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1 || isOutOfStock}
                                        >
                                            <MinusIcon className="w-4 h-4" />
                                        </button>
                                        <div className="flex-1 text-center font-black text-lg">{quantity}</div>
                                        <button
                                            className="w-10 h-full flex items-center justify-center hover:bg-secondary rounded-xl transition-colors disabled:opacity-30"
                                            onClick={() => setQuantity(product.isUnlimitedStock ? quantity + 1 : Math.min(currentStock, quantity + 1))}
                                            disabled={isOutOfStock || (!product.isUnlimitedStock && quantity >= currentStock)}
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                                        onClick={handleAddToCart}
                                        isLoading={adding}
                                        disabled={isOutOfStock}
                                    >
                                        <ShoppingBagIcon className="w-5 h-5 rtl:ml-2 ltr:mr-2" />
                                        {isOutOfStock ? 'نفذت الكمية' : 'إضافة للسلة'}
                                    </Button>
                                </div>
                            </div>

                            {/* Uses List */}
                            {usesList.length > 0 && (
                                <div className="pt-8 space-y-6">
                                    <div className="bg-secondary/30 rounded-2xl p-6">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <StarIcon className="w-5 h-5 text-primary" />
                                            طرق الاستخدام والمميزات
                                        </h3>
                                        <ul className="space-y-3">
                                            {usesList.map((useStr: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    <span className="leading-relaxed">{useStr}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ... (ProductLoadingSkeleton and ProductNotFound components remain exactly the same)
function ProductLoadingSkeleton() { return null; } // احتفظ بالكود السابق للتحميل هنا
function ProductNotFound() { return null; } // احتفظ بالكود السابق للخطأ هنا