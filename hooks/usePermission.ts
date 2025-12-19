
import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FeatureKey, TierConfig, UserRecord } from '../types';

/**
 * HATI PERMISSION AUTHORITY
 * Checks live user tier against the global feature config.
 */
export const usePermission = (featureName: FeatureKey) => {
  const [allowed, setAllowed] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Listen to User's Profile for their plan ID
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
      const userData = userDoc.data() as UserRecord;
      const planId = userData?.plan || 'essential';

      // 2. Listen to the Tier Configuration for that plan
      const unsubTier = onSnapshot(doc(db, 'product_tiers', planId), (tierDoc) => {
        const tierData = tierDoc.data() as any;
        if (tierData && tierData.features) {
          const featureValue = tierData.features[featureName];
          if (typeof featureValue === 'boolean') {
            setAllowed(featureValue);
          } else if (typeof featureValue === 'number') {
            setLimit(featureValue);
            setAllowed(featureValue > 0);
          }
        }
        setLoading(false);
      });

      return () => unsubTier();
    });

    return () => unsubUser();
  }, [featureName]);

  return { allowed, limit, loading };
};
