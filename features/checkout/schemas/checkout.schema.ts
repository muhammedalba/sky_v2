import { z } from "zod";

export const CheckoutAddressSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول يجب أن يكون حرفين على الأقل"),
  lastName: z.string().min(2, "اسم العائلة يجب أن يكون حرفين على الأقل"),
  phone: z.string().min(5, "رقم الهاتف يجب أن يكون 5 أرقام على الأقل"),
  countryId: z.string().min(1, "يرجى اختيار الدولة"),
  regionId: z.string().min(1, "يرجى اختيار المنطقة"),
  cityId: z.string().min(1, "يرجى اختيار المدينة"),
  street: z.string().min(2, "اسم الشارع يجب أن يكون حرفين على الأقل"),
  building: z.string().optional(),
  postalCode: z.string().optional(),
  additionalInfo: z.string().optional(),
  addressType: z.string().optional(),
});

// Since the whole form in Address step uses these fields, 
// CheckoutFormSchema is the same as CheckoutAddressSchema for now.
// If we had more fields in other steps that are part of the same form, we would extend it.
export const CheckoutFormSchema = CheckoutAddressSchema;

export type CheckoutAddress = z.infer<typeof CheckoutAddressSchema>;
export type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;
