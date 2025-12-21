
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * HATI MISSION CONTROL: TIER SEEDING SCRIPT
 */
export const seedProductTiers = async () => {
  const tiers = [
    {
      id: 'essential',
      name: 'Essential Plan',
      features: {
        can_use_biometrics: false,
        storage_limit: 5,
        max_vaults: 1,
        family_profiles: false,
        guardian_protocol: false,
        secure_camera_mode: false,
        inheritance_planning: false
      }
    },
    {
      id: 'guardian',
      name: 'Guardian Plan',
      features: {
        can_use_biometrics: true,
        storage_limit: 100,
        max_vaults: 10,
        family_profiles: true,
        guardian_protocol: true,
        secure_camera_mode: true,
        inheritance_planning: true
      }
    }
  ];

  try {
    for (const tier of tiers) {
      await setDoc(doc(db, 'product_tiers', tier.id), tier);
    }
    console.log("HATI_AUTHORITY: Product tiers seeded successfully.");
    return true;
  } catch (error) {
    console.error("HATI_AUTHORITY: Seeding failed", error);
    return false;
  }
};
