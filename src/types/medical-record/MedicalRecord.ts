export interface CreateMedicalRecordData {
    appointment_id: number;
    symptoms?: string;
    clinical_examination?: string;
    diagnosis: string;
    icd10_code?: string;
    icd10_name?: string;
    blood_pressure?: string;
    pulse?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    doctor_advice?: string;
    re_examination_date?: string;
    consultation_type?: string;
    recommendation?: string;
    attachments?: AttachmentInput[];
}

export interface UpdateMedicalRecordData {
    symptoms?: string;
    clinical_examination?: string;
    diagnosis?: string;
    icd10_code?: string;
    icd10_name?: string;
    blood_pressure?: string;
    pulse?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    doctor_advice?: string;
    re_examination_date?: string;
    consultation_type?: string;
    recommendation?: string;
    attachments?: AttachmentInput[];
}

export interface AttachmentInput {
    file_url: string;
    file_name: string;
    description?: string;
}

export interface GetUserMedicalRecordsQuery {
    page?: number;
}

export interface GetDoctorMedicalRecordsQuery {
    page?: number;
    search?: string;
    from_date?: string;
    to_date?: string;
}

export interface GetAdminMedicalRecordsQuery extends GetDoctorMedicalRecordsQuery {
    doctor_id?: number;
}
