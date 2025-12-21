
export type DocumentType = 'Prescription' | 'Lab Report' | 'Imaging' | 'Summary' | 'Other';
export type UserRole = 'user' | 'super_admin' | 'admin';

export type FeatureKey = 'can_use_biometrics' | 'storage_limit' | 'max_vaults' | 'family_profiles' | 'guardian_protocol' | 'secure_camera_mode' | 'inheritance_planning';

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
export interface Beneficiary {
  name: string;
  email: string;
  phone: string;
  relationship?: string;
  type: 'primary' | 'alternate';
  role?: 'primary' | 'alternate';
  status: 'pending' | 'active' | 'verified';
  verified?: boolean;
  addedAt: string;
}

export interface InheritanceInfo {
  primary?: Beneficiary;
  alternate?: Beneficiary;
  inactivityPeriodDays: number;
  status: 'inactive' | 'active';
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
  guardians?: GuardianInfo[];
  // Added inheritance property to UserRecord
  inheritance?: InheritanceInfo;
  // Added webauthn flag for biometric login
  webauthnEnabled?: boolean;
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