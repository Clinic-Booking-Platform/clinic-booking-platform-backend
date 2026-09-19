export interface PrescriptionItemInput {
    medicine_name: string;
    dosage: string;
    quantity: number;
    unit: string;
    instructions?: string | null;
}

export interface CreatePrescriptionData {
    items: PrescriptionItemInput[];
}

export interface UpdatePrescriptionData {
    items: PrescriptionItemInput[];
}
