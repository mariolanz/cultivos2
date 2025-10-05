

import { Crop, CropStage, Formula, FormulaSchedule, Location, PnoParameters, PnoWeekParameters } from '../types';
import { PNO_PARAMETERS } from '../constants';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface StageInfo {
  stage: CropStage;
  daysInStage: number;
  weekInStage: number;
  dayOfWeekInStage: number;
  totalDays: number;
  totalWeek: number;
  totalDayOfWeek: number;
  canTransition: boolean;
}

export const getStageInfo = (crop: Crop, date: Date = new Date()): StageInfo => {
  const cloningDate = new Date(crop.cloningDate);
  const preVegDate = crop.preVegDate ? new Date(crop.preVegDate) : null;
  const vegDate = crop.vegDate ? new Date(crop.vegDate) : null;
  const flowerDate = crop.flowerDate ? new Date(crop.flowerDate) : null;
  const dryingCuringDate = crop.dryingCuringDate ? new Date(crop.dryingCuringDate) : null;
  const harvestDate = crop.harvestDate ? new Date(crop.harvestDate) : null;
  
  // Use Math.max to prevent negative days if dates are in the future
  const totalDays = Math.max(0, Math.floor((date.getTime() - cloningDate.getTime()) / MS_PER_DAY));

  const calculateInfo = (stage: CropStage, stageStartDate: Date | null, canTransition: boolean) => {
      const startDate = stageStartDate || cloningDate; // Fallback to cloningDate if start is null
      const daysInStage = Math.max(0, Math.floor((date.getTime() - startDate.getTime()) / MS_PER_DAY));
      return {
          stage,
          daysInStage,
          weekInStage: Math.floor(daysInStage / 7) + 1,
          dayOfWeekInStage: (daysInStage % 7) + 1,
          totalDays,
          totalWeek: Math.floor(totalDays / 7) + 1,
          totalDayOfWeek: (totalDays % 7) + 1,
          canTransition
      };
  };

  if (harvestDate && date >= harvestDate) {
    return calculateInfo(CropStage.HARVESTED, harvestDate, false);
  }
  
  if (dryingCuringDate && date >= dryingCuringDate) {
    return calculateInfo(CropStage.DRYING_CURING, dryingCuringDate, true);
  }

  if (flowerDate && date >= flowerDate) {
    return calculateInfo(CropStage.FLOWERING, flowerDate, true);
  }

  if (vegDate && date >= vegDate) {
      return calculateInfo(CropStage.VEGETATION, vegDate, true);
  }
  
  if (preVegDate && date >= preVegDate) {
    return calculateInfo(CropStage.PRE_VEGETATION, preVegDate, true);
  }
  
  // If we are here, we are in cloning stage.
  return calculateInfo(CropStage.CLONING, cloningDate, true);
};


export const getFormulaForWeek = (
  stage: CropStage, 
  week: number, 
  schedule: FormulaSchedule,
  allFormulas: Formula[]
): Formula | null => {
    if (!schedule[stage] || !schedule[stage][week]) {
        // Fallback for weeks beyond the defined schedule, e.g., long veg
        const stageWeeks = Object.keys(schedule[stage] || {}).map(Number);
        if (stageWeeks.length > 0) {
            const lastWeek = Math.max(...stageWeeks);
            if (week > lastWeek) {
                 const formulaId = schedule[stage][lastWeek];
                 return allFormulas.find(r => r.id === formulaId) || null;
            }
        }
        return null;
    }
    const formulaId = schedule[stage][week];
    return allFormulas.find(r => r.id === formulaId) || null;
};

export const getPnoParametersForWeek = (
  stage: CropStage,
  week: number
): PnoWeekParameters | null => {
  const stageParams = PNO_PARAMETERS[stage];
  if (!stageParams) return null;
  
  const typedStageParams = stageParams as Record<number, PnoWeekParameters>;

  if (typedStageParams[week]) {
    return typedStageParams[week];
  }
  // Fallback to the last defined week for that stage
  const definedWeeks = Object.keys(typedStageParams).map(Number);
  if (definedWeeks.length > 0) {
    const maxWeek = Math.max(...definedWeeks);
    if (week > maxWeek) {
      return typedStageParams[maxWeek];
    }
  }
  return null;
};

export const isOutOfRange = (
    value: number, 
    range: [number, number] | number | 'Ambiente', 
    tolerance: number = 0.1 /* 10% for single value, absolute for range */
): boolean => {
    if (typeof value !== 'number' || !range || range === 'Ambiente') return false;
    
    if (typeof range === 'number') {
        // For single target values like PPM, allow a percentage tolerance
        return value < range * (1 - tolerance) || value > range * (1 + tolerance);
    }
    // For range values, tolerance is absolute
    return value < (range[0] - tolerance) || value > (range[1] + tolerance);
};


export const getRangeStatus = (
    value: number,
    range: [number, number] | number | 'Ambiente',
    warningTolerance: number,
    dangerTolerance?: number 
): 'in-range' | 'warning' | 'danger' => {
    if (typeof value !== 'number' || !range || range === 'Ambiente') return 'in-range';
    
    const finalDangerTolerance = dangerTolerance ?? warningTolerance;

    if (typeof range === 'number') {
        // Percentage-based for single values (e.g., PPM)
        const lowerDanger = range * (1 - (finalDangerTolerance / 100));
        const upperDanger = range * (1 + (finalDangerTolerance / 100));
        if (value < lowerDanger || value > upperDanger) return 'danger';
        
        const lowerWarning = range * (1 - (warningTolerance / 100));
        const upperWarning = range * (1 + (warningTolerance / 100));
        if (value < lowerWarning || value > upperWarning) return 'warning';

    } else {
        // Absolute for ranges (e.g., Temperature)
        const [min, max] = range;
        if (value < min - finalDangerTolerance || value > max + finalDangerTolerance) return 'danger';
        if (value < min - warningTolerance || value > max + warningTolerance) return 'warning';
        if (value < min || value > max) return 'warning'; // Also warning if outside base range but within tolerance
    }

    return 'in-range';
};


export const getParentLocationId = (roomId: string, allLocations: Location[]): string | undefined => {
    const room = allLocations.find(l => l.id === roomId);
    return room?.parentId;
};