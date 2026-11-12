/**
 * Dynamic Fitting Step Router
 * 
 * Manages routing logic for category-based fitting workflow.
 * Routes users through only their selected club categories.
 */

export type FittingStep = {
  stepNumber: number;
  path: string;
  label: string;
  isUniversal: boolean;
  category?: string;
};

// Universal steps (always shown)
const UNIVERSAL_STEPS: FittingStep[] = [
  { stepNumber: 0, path: '0', label: 'Club Selection', isUniversal: true },
  { stepNumber: 1, path: '1', label: 'Player Profile', isUniversal: true },
  { stepNumber: 2, path: '2', label: 'Golf Experience', isUniversal: true },
  // Physical measurements (currently step 3) - will become variable position
  { stepNumber: 99, path: '3', label: 'Physical Info', isUniversal: true },
];

// Category-specific steps
const CATEGORY_STEP_MAP: Record<string, { path: string; label: string }> = {
  driver: { path: '3-driver', label: 'Driver Fitting' },
  fairway_woods: { path: '3-fairway-woods', label: 'Fairway Woods' },
  hybrids: { path: '3-hybrids', label: 'Hybrids' },
  irons: { path: '3-irons', label: 'Iron Fitting' },
  wedges: { path: '3-wedges', label: 'Wedges' },
  putter: { path: '7', label: 'Putter Fitting' },
  golf_ball: { path: '8', label: 'Golf Ball' },
};

// Closing universal steps
const CLOSING_STEPS: FittingStep[] = [
  { stepNumber: 98, path: '3', label: 'Physical Info', isUniversal: true },
  { stepNumber: 97, path: '4', label: 'Current Equipment', isUniversal: true },
  { stepNumber: 96, path: '5', label: 'Goals', isUniversal: true },
  { stepNumber: 95, path: '6', label: 'Course Conditions', isUniversal: true },
];

/**
 * Build the complete step sequence for a fitting session
 */
export function buildStepSequence(selectedCategories: string[]): FittingStep[] {
  const sequence: FittingStep[] = [];
  let stepNumber = 0;

  // Add opening universal steps (0, 1, 2)
  sequence.push({ stepNumber: stepNumber++, path: '0', label: 'Club Selection', isUniversal: true });
  sequence.push({ stepNumber: stepNumber++, path: '1', label: 'Player Profile', isUniversal: true });
  sequence.push({ stepNumber: stepNumber++, path: '2', label: 'Golf Experience', isUniversal: true });

  // Add category-specific steps
  selectedCategories.forEach(category => {
    const categoryStep = CATEGORY_STEP_MAP[category];
    if (categoryStep) {
      sequence.push({
        stepNumber: stepNumber++,
        path: categoryStep.path,
        label: categoryStep.label,
        isUniversal: false,
        category
      });
    }
  });

  // Add closing universal steps (physical, equipment, goals, conditions)
  // Note: We're using the OLD step numbers (3, 4, 5, 6) for these universal steps
  sequence.push({ stepNumber: stepNumber++, path: '3', label: 'Physical Info', isUniversal: true });
  sequence.push({ stepNumber: stepNumber++, path: '4', label: 'Current Equipment', isUniversal: true });
  sequence.push({ stepNumber: stepNumber++, path: '5', label: 'Goals', isUniversal: true });
  sequence.push({ stepNumber: stepNumber++, path: '6', label: 'Course Conditions', isUniversal: true });

  return sequence;
}

/**
 * Get the next step path based on current position and selected categories
 */
export function getNextStepPath(
  currentPath: string,
  selectedCategories: string[]
): string | null {
  const sequence = buildStepSequence(selectedCategories);
  const currentIndex = sequence.findIndex(step => step.path === currentPath);
  
  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return null; // Current step not found or already at end
  }

  return sequence[currentIndex + 1].path;
}

/**
 * Get the previous step path based on current position and selected categories
 */
export function getPreviousStepPath(
  currentPath: string,
  selectedCategories: string[]
): string | null {
  const sequence = buildStepSequence(selectedCategories);
  const currentIndex = sequence.findIndex(step => step.path === currentPath);
  
  if (currentIndex <= 0) {
    return null; // Already at first step or step not found
  }

  return sequence[currentIndex - 1].path;
}

/**
 * Get the current step number (0-indexed) in the sequence
 */
export function getCurrentStepNumber(
  currentPath: string,
  selectedCategories: string[]
): number {
  const sequence = buildStepSequence(selectedCategories);
  const stepIndex = sequence.findIndex(step => step.path === currentPath);
  return stepIndex >= 0 ? stepIndex : 0;
}

/**
 * Get the total number of steps in the sequence
 */
export function getTotalSteps(selectedCategories: string[]): number {
  return buildStepSequence(selectedCategories).length;
}

/**
 * Check if a step should be shown based on selected categories
 */
export function shouldShowStep(
  stepPath: string,
  selectedCategories: string[]
): boolean {
  const sequence = buildStepSequence(selectedCategories);
  return sequence.some(step => step.path === stepPath);
}

/**
 * Get step label for progress display
 */
export function getStepLabel(
  stepPath: string,
  selectedCategories: string[]
): string {
  const sequence = buildStepSequence(selectedCategories);
  const step = sequence.find(s => s.path === stepPath);
  return step?.label || 'Unknown Step';
}