
export type DocumentType = 'Prescription' | 'Lab Report' | 'Imaging' | 'Summary' | 'Other';
export type UserRole = 'user' | 'super_admin' | 'admin';

export type FeatureKey = 'can_use_biometrics' | 'storage_limit' | 'max_vaults' | 'family_profiles' | 'guardian_protocol' | 'secure_camera_mode';

export interface Vitals {
  systolic?: number;
  diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  glucose?: number;
}

export interface Medication {
  name: string;
  dosage: string;
}

export interface Profile {
  id: string;
  name: string;
  relation: 'Self' | 'Child' | 'Spouse' | 'Parent' | 'Other';
}

export interface MedicalRecordData {
  patient_name: string;
  date: string;
  diagnosis: string[];
  medications: Medication[];
  vitals: Vitals;
  warnings: string[];
  document_type: DocumentType;
}

export interface MedicalRecord {
  id: string;
  profileId: string;
  createdAt: number;
  encryptedPayload: string;
}

export interface DecryptedMedicalRecord extends MedicalRecordData {
  id: string;
  profileId: string;
  createdAt: number;
}

export interface GuardianInfo {
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  inactivityThresholdDays: 30 | 90 | 365;
  status: 'inactive' | 'pending' | 'active' | 'escrow' | 'unlocked';
  unlockDate?: number;
}

// Added InheritanceInfo type for Inheritance Protocol feature
export interface InheritanceInfo {
  beneficiaryName: string;
  beneficiaryEmail: string;
  beneficiaryPhone: string;
  inactivityPeriodDays: number;
  status: 'inactive' | 'pending' | 'active' | 'escrow' | 'unlocked';
  unlockDate?: number;
}

export interface UserRecord {
  uid: string;
  name: string;
  email: string;
  createdAt: any;
  lastActiveAt: any;
  isPremium: boolean;
  plan: 'essential' | 'guardian';
  role?: UserRole;
  lastLogin?: number;
  guardian_settings?: GuardianInfo;
  // Added inheritance property to UserRecord
  inheritance?: InheritanceInfo;
}

export interface PlanConfig {
  id: string;
  name: string;
  price_kes: number;
  features: string[];
}

export interface TierConfig {
  id: 'essential' | 'guardian';
  features: {
    can_use_biometrics: boolean;
    storage_limit: number;
    max_vaults: number;
    family_profiles: boolean;
    guardian_protocol: boolean;
  };
}