import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';

export type ExperienceLevel = 'beginner' | 'experienced' | 'professional';

interface UseOnboardingReturn {
  experienceLevel: ExperienceLevel | null;
  isFirstVisit: boolean;
  shouldShowTour: (pageKey: string) => boolean;
  markTourAsShown: (pageKey: string) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  resetOnboarding: () => void;
  wantsGuidance: boolean | null;
  setWantsGuidance: (wants: boolean) => void;
}

/**
 * Custom hook to manage user onboarding experience
 * Handles experience level selection, tour visibility, and guidance preferences
 */
export const useOnboarding = (): UseOnboardingReturn => {
  const { user } = useAuth();
  const userId = user?.id;

  const [experienceLevel, setExperienceLevelState] = useState<ExperienceLevel | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [wantsGuidance, setWantsGuidanceState] = useState<boolean | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    if (!userId) return;

    const storedLevel = localStorage.getItem(
      `userExperienceLevel_${userId}`
    ) as ExperienceLevel | null;
    const storedGuidance = localStorage.getItem(`wantsGuidance_${userId}`);

    setExperienceLevelState(storedLevel);
    setIsFirstVisit(!storedLevel);

    if (storedGuidance !== null) {
      setWantsGuidanceState(storedGuidance === 'true');
    }
  }, [userId]);

  /**
   * Set user's experience level and store in localStorage
   */
  const setExperienceLevel = useCallback(
    (level: ExperienceLevel) => {
      if (!userId) return;

      setExperienceLevelState(level);
      setIsFirstVisit(false);
      localStorage.setItem(`userExperienceLevel_${userId}`, level);
    },
    [userId]
  );

  /**
   * Set user's guidance preference (for experienced users)
   */
  const setWantsGuidance = useCallback(
    (wants: boolean) => {
      if (!userId) return;

      setWantsGuidanceState(wants);
      localStorage.setItem(`wantsGuidance_${userId}`, wants.toString());
    },
    [userId]
  );

  /**
   * Check if tour should be shown for a specific page
   * @param pageKey - Unique identifier for the page (e.g., 'home', 'dataset-list', 'chart-list')
   */
  const shouldShowTour = useCallback(
    (pageKey: string): boolean => {
      if (!userId || !experienceLevel) return false;

      const tourShownKey = `hasShownTour_${userId}_${pageKey}`;
      const hasShownTour = localStorage.getItem(tourShownKey) === 'true';

      // Already shown this tour
      if (hasShownTour) return false;

      // Beginner: Always show tour on first visit to each page
      if (experienceLevel === 'beginner') {
        return true;
      }

      // Experienced: Show tour only if they want guidance and haven't seen it
      if (experienceLevel === 'experienced') {
        return wantsGuidance === true;
      }

      // Professional: Never auto-show tour
      if (experienceLevel === 'professional') {
        return false;
      }

      return false;
    },
    [userId, experienceLevel, wantsGuidance]
  );

  /**
   * Mark a tour as shown for a specific page
   * @param pageKey - Unique identifier for the page
   */
  const markTourAsShown = useCallback(
    (pageKey: string) => {
      if (!userId) return;

      const tourShownKey = `hasShownTour_${userId}_${pageKey}`;
      localStorage.setItem(tourShownKey, 'true');
    },
    [userId]
  );

  /**
   * Reset all onboarding data (useful for testing or user preference reset)
   */
  const resetOnboarding = useCallback(() => {
    if (!userId) return;

    // Remove experience level
    localStorage.removeItem(`userExperienceLevel_${userId}`);

    // Remove guidance preference
    localStorage.removeItem(`wantsGuidance_${userId}`);

    // Remove all tour shown flags
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(`hasShownTour_${userId}_`)) {
        localStorage.removeItem(key);
      }
    });

    setExperienceLevelState(null);
    setIsFirstVisit(true);
    setWantsGuidanceState(null);
  }, [userId]);

  return {
    experienceLevel,
    isFirstVisit,
    shouldShowTour,
    markTourAsShown,
    setExperienceLevel,
    resetOnboarding,
    wantsGuidance,
    setWantsGuidance,
  };
};
