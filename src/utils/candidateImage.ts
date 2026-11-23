import type { SyntheticEvent } from 'react';

export const CANDIDATE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23e2e8f0'/%3E%3Ccircle cx='80' cy='58' r='28' fill='%2394a3b8'/%3E%3Cpath d='M24 150c4-32 26-50 56-50s52 18 56 50' fill='%2394a3b8'/%3E%3C/svg%3E";

export const handleCandidateImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = CANDIDATE_IMAGE_PLACEHOLDER;
};
