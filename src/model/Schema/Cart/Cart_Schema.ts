import z from 'zod';

export const AddToCartSchema = z.object({
    package_id: z
        .number({ message: 'ID gói khám phải là số' })
        .int('ID gói khám phải là số nguyên')
        .positive('ID gói khám phải lớn hơn 0'),
    quantity: z
        .number({ message: 'Số lượng phải là số' })
        .int('Số lượng phải là số nguyên')
        .min(1, 'Số lượng tối thiểu là 1')
        .optional()
        .default(1),
});

export const UpdateCartQuantitySchema = z.object({
    quantity: z
        .number({ message: 'Số lượng phải là số' })
        .int('Số lượng phải là số nguyên')
        .min(1, 'Số lượng tối thiểu là 1'),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof UpdateCartQuantitySchema>;
