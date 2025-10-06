import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from './ui/Card';
import { useCrops, useFormulas, useInventory, useLocations, usePlantBatches, useAuth, useMotherPlants } from '../context/AppProvider';
import { LogEntry, CropStage, Formula, PlantBatchStatus, Crop, PlantBatch, SensorDataPoint, MotherPlant, Location, UserRole, User, PnoWeekParameters, PLANT_HEALTH_OPTIONS } from '../types';
import { useNavigate } from 'react-router-dom';
import { getStageInfo, getFormulaForWeek, getParentLocationId, getPnoParametersForWeek, isOutOfRange } from '../services/nutritionService';
import CameraModal from './ui/CameraModal';
import { useDailyTasks } from '../hooks/useDailyTasks';


const DynamicNumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
  buttonStep: number;
  min: number;
  max: number;
  precision?: number;
  unit?: string;
  isWarning?: boolean;
}> = ({
  label,
  value,
  onChange,
  step,
  buttonStep,
  min,
  max,
  precision = 1,
  unit,
  isWarning = false,
}) => {
  const [inputValue, setInputValue] = useState(value.toFixed(precision));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sync from parent state, but only if the input is not focused or if the numeric values differ significantly.
    // This prevents overwriting the user's input while they are typing (e.g., typing "5." won't be forced to "5.0").
    if (document.activeElement !== inputRef.current || parseFloat(inputValue) !== value) {
       if (value.toFixed(precision) !== inputValue) {
            setInputValue(value.toFixed(precision));
       }
    }
  }, [value, precision, inputValue]);

  const commitValue = (valStr: string) => {
    let val = parseFloat(valStr);
    if (isNaN(val)) {
        val = value; // revert to last good value if input is invalid
    }
    const clamped = Math.max(min, Math.min(max, val));
    const final = parseFloat(clamped.toFixed(precision));
    onChange(final);
    // setInputValue(final.toFixed(precision));
  };
  
  const handleStep = (direction: 'up' | 'down') => {
      const currentVal = parseFloat(inputValue) || value;
      const newVal = currentVal + (direction === 'up' ? buttonStep : -buttonStep);
      commitValue(newVal.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setInputValue(valStr);
    const parsed = parseFloat(valStr);
    if(!isNaN(parsed)) {
        onChange(parsed); // Update parent for real-time validation
    }
  };

  const handleBlur = () => {
    commitValue(inputValue);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      (e.target as HTMLInputElement).blur();
    }
  };


  return (
    <div>
      <label className="block text-sm text-text-secondary mb-2 text-center">{label} {unit && `(${unit})`}</label>
      <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={() => handleStep('down')} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-text-primary w-12 h-12 flex items-center justify-center font-bold text-2xl flex-shrink-0" aria-label={`Decrease ${label}`}>-</button>
        <input
          ref={inputRef}
          type="number"
          step={step}
          min={min}
          max={max}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-28 text-center text-2xl font-bold p-2 border-b-2 rounded-md transition-colors ${isWarning ? 'border-yellow-500 bg-yellow-50' : 'border-border-color bg-white'} text-text-primary focus:outline-none focus:ring-2 focus:ring-primary`}
        />
        <button type="button" onClick={() => handleStep('up')} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-text-primary w-12 h-12 flex items-center justify-center font-bold text-2xl flex-shrink-0" aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
};

const TargetSelector: React.FC<{
    allCrops: Crop[];
    plantBatches: PlantBatch[];
    motherPlants: MotherPlant[];
    locations: Location[];
    currentUser: User | null;
    onSelect: (id: string) => void;
}> = ({ allCrops, plantBatches, motherPlants, locations, currentUser, onSelect }) => {

    const visibleCrops = useMemo(() => {
        const nonArchivedCrops = allCrops.filter(crop => !crop.isArchived);
        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return nonArchivedCrops;
        }
        if (!currentUser.locationId) return [];
        const userMainLocationId = currentUser.locationId;
        return nonArchivedCrops.filter(crop => {
            const room = locations.find(l => l.id === crop.locationId);
            return room?.parentId === userMainLocationId;
        });
    }, [allCrops, currentUser, locations]);

    const visibleBatches = useMemo(() => {
        const germinatingBatches = plantBatches.filter(b => b.status === PlantBatchStatus.GERMINATION_ROOTING);
        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return germinatingBatches;
        }
        if (!currentUser.locationId) return [];
        const userMainLocationId = currentUser.locationId;
        return germinatingBatches.filter(batch => batch.sourceLocationId === userMainLocationId || batch.creatorId === currentUser.id);
    }, [plantBatches, currentUser]);

    const visibleMotherPlants = useMemo(() => {
        const activeMotherPlants = motherPlants.filter(p => !p.isArchived);
        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return activeMotherPlants;
        }
        if (!currentUser.locationId) return [];
        const userMainLocationId = currentUser.locationId;
        return activeMotherPlants.filter(plant => {
            const room = locations.find(l => l.id === plant.locationId);
            return room?.parentId === userMainLocationId;
        });
    }, [motherPlants, currentUser, locations]);
    
    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Seleccionar Cultivo, Lote o Planta Madre</h2>
            <p className="text-text-secondary mb-4">Elige para qué quieres registrar una nueva entrada.</p>
            <select
                onChange={(e) => onSelect(e.target.value)}
                defaultValue=""
                className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md"
            >
                <option value="" disabled>-- Elige una opción --</option>
                <optgroup label="Acciones Grupales">
                    <option value="log-all-mother-plants">
                        Registrar para Todas las Plantas Madre
                    </option>
                </optgroup>
                <optgroup label="Cultivos Activos">
                    {visibleCrops.map(crop => (
                        <option key={crop.id} value={crop.id}>
                            {locations.find(l => l.id === crop.locationId)?.name || crop.id}
                        </option>
                    ))}
                </optgroup>
                <optgroup label="Lotes en Germinación/Enraizamiento">
                    {visibleBatches.map(batch => (
                        <option key={batch.id} value={batch.id}>
                            Lote: {batch.name}
                        </option>
                    ))}
                </optgroup>
                 <optgroup label="Plantas Madre Individuales">
                    {visibleMotherPlants.map(plant => (
                        <option key={plant.id} value={plant.id}>
                            Planta Madre: {plant.name}
                        </option>
                    ))}
                </optgroup>
            </select>
        </Card>
    );
};


// Main Log component
const Log: React.FC = () => {
  const { allCrops, activeCrop, saveCrop, setActiveCropId } = useCrops();
  const { plantBatches, activeBatch, savePlantBatch, setActiveBatchId } = usePlantBatches();
  const { motherPlants, activeMotherPlant, saveMotherPlant, setActiveMotherPlantId, saveLogForAllActiveMotherPlants } = useMotherPlants();
  const { locations } = useLocations();
  const { currentUser } = useAuth();
  const { formulas, formulaSchedule } = useFormulas();
  const { inventory } = useInventory();
  const { pendingTasks } = useDailyTasks(new Date());
  const navigate = useNavigate();
  const MAX_PHOTOS = 5;
  const topRef = useRef<HTMLDivElement>(null);

  // Productos foliares y suplementos dinámicos desde inventario de Supabase
  const FOLIAR_PRODUCTS = useMemo(() => {
    const foliarCategories = ['Suplemento/Bioestimulante', 'Microorganismos/Biológicos', 'Control de Plagas/Enfermedades'];
    return inventory
      .filter(item => foliarCategories.includes(item.category))
      .map(item => ({
        name: item.name,
        dose: item.unit === 'ml' ? '2.5 ml/L' : item.unit === 'g' ? '1 g/L' : '1 unidad/L'
      }));
  }, [inventory]);

  const SUPPLEMENT_PRODUCTS = useMemo(() => {
    const supplementCategories = ['Suplemento/Bioestimulante', 'Microorganismos/Biológicos'];
    return inventory
      .filter(item => supplementCategories.includes(item.category))
      .map(item => ({
        name: item.name,
        dose: item.unit === 'ml' ? '2.5 ml/L' : item.unit === 'g' ? '1 g/L' : '1 unidad/L'
      }));
  }, [inventory]);
  const sensorFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const [isLoggingForAllMothers, setIsLoggingForAllMothers] = useState(false);
  
  const [formulaForWeek, setFormulaForWeek] = useState<Formula | null>(null);
  const [formData, setFormData] = useState({
    temp: 24,
    humidity: 55,
    leafTemp: 22,
    co2: 400,
    ppfd: 600,
    ph: 6.0,
    ppm: 700,
    volume: 200,
    phOut: 0,
    ppmOut: 0,
    notes: ''
  });
  
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [isFoliarOpen, setIsFoliarOpen] = useState(false);
  const [openHealthCategories, setOpenHealthCategories] = useState<Record<string, boolean>>({});
  const [selectedFoliar, setSelectedFoliar] = useState<string[]>([]);
  const [foliarVolume, setFoliarVolume] = useState<number>(7);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [vpd, setVpd] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [sensorData, setSensorData] = useState<SensorDataPoint[] | null>(null);
  
  const [irrigationSuggestion, setIrrigationSuggestion] = useState<string | null>(null);
  const [irrigationChoice, setIrrigationChoice] = useState<'nutrients' | 'supplements' | null>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  const todaysCropTasks = useMemo(() => {
      if (!activeCrop) return [];
      // Filter tasks to only show grower-related ones on this page
      return pendingTasks.filter(task => task.assigneeRoles.includes(UserRole.GROWER));
  }, [pendingTasks, activeCrop]);

  const loggingTarget = useMemo(() => activeCrop || activeBatch || activeMotherPlant || isLoggingForAllMothers, [activeCrop, activeBatch, activeMotherPlant, isLoggingForAllMothers]);
  const isLoggingForBatch = useMemo(() => !!activeBatch, [activeBatch]);
  const isLoggingForMotherPlant = useMemo(() => !!activeMotherPlant, [activeMotherPlant]);

  const toggleHealthCategory = (category: string) => {
    setOpenHealthCategories(prev => ({
        ...prev,
        [category]: !prev[category]
    }));
  };

  const parentLocationId = useMemo(() => {
    if (activeCrop) {
      return getParentLocationId(activeCrop.locationId, locations);
    }
    if (activeBatch) {
      return activeBatch.sourceLocationId;
    }
    if (activeMotherPlant) {
      return getParentLocationId(activeMotherPlant.locationId, locations);
    }
    if (isLoggingForAllMothers && currentUser) {
      return currentUser.locationId !== 'TODAS' ? currentUser.locationId : undefined;
    }
    return undefined;
  }, [activeCrop, activeBatch, activeMotherPlant, isLoggingForAllMothers, locations, currentUser]);

  const targetName = useMemo(() => {
    if (isLoggingForAllMothers) {
        return 'Todas las Plantas Madre';
    }
    if (activeCrop) {
      return locations.find(l => l.id === activeCrop.locationId)?.name || activeCrop.id;
    }
    if (activeBatch) {
      return `Lote: ${activeBatch.name}`;
    }
    if (activeMotherPlant) {
      return `Planta Madre: ${activeMotherPlant.name}`;
    }
    return '';
  }, [activeCrop, activeBatch, activeMotherPlant, locations, isLoggingForAllMothers]);


  const stageInfo = useMemo(() => {
    if (isLoggingForAllMothers) {
        return { stage: CropStage.VEGETATION, weekInStage: 1 };
    }
    if (activeCrop) {
      return getStageInfo(activeCrop);
    }
    if (activeBatch) {
      const days = Math.floor((new Date().getTime() - new Date(activeBatch.creationDate).getTime()) / (1000 * 3600 * 24));
      return {
        stage: CropStage.CLONING,
        weekInStage: Math.floor(days / 7) + 1,
        daysInStage: days,
        dayOfWeekInStage: (days % 7) + 1,
        totalDays: days,
        totalWeek: Math.floor(days / 7) + 1,
        totalDayOfWeek: (days % 7) + 1,
        canTransition: false,
      };
    }
    if (activeMotherPlant) {
      const days = Math.floor((new Date().getTime() - new Date(activeMotherPlant.sowingDate).getTime()) / (1000 * 3600 * 24));
      return {
        stage: CropStage.VEGETATION,
        weekInStage: Math.floor(days / 7) + 1,
        daysInStage: days,
        dayOfWeekInStage: (days % 7) + 1,
        totalDays: days,
        totalWeek: Math.floor(days / 7) + 1,
        totalDayOfWeek: (days % 7) + 1,
        canTransition: false,
      };
    }
    return null;
  }, [activeCrop, activeBatch, activeMotherPlant, isLoggingForAllMothers]);

    const pnoParams = useMemo(() => {
        if (!stageInfo) return null;
        return getPnoParametersForWeek(stageInfo.stage, stageInfo.weekInStage);
    }, [stageInfo]);
  
  useEffect(() => {
    if (stageInfo) {
      const formula = getFormulaForWeek(stageInfo.stage, stageInfo.weekInStage, formulaSchedule, formulas);
      setFormulaForWeek(formula);
      
      let defaultPPM = 700;
      if (irrigationChoice === 'nutrients') {
          defaultPPM = formula?.targetPPM ?? (stageInfo.stage === CropStage.FLOWERING ? 1000 : 700);
      } else if (irrigationChoice === 'supplements') {
          defaultPPM = 200; // Low PPM for supplements
      }

      setFormData(prev => ({
          ...prev,
          ph: 6.0,
          ppm: defaultPPM,
          co2: stageInfo.stage === CropStage.FLOWERING ? 1200 : 400,
      }));
    }
  }, [stageInfo, formulas, formulaSchedule, irrigationChoice]);

  useEffect(() => {
    if (activeCrop) {
        const irrigationLogs = activeCrop.logEntries.filter(l => l.irrigation);
        const warnings: string[] = [];
        let recommendation = ""; // Primary watering type recommendation

        const currentStageInfo = getStageInfo(activeCrop);
        const currentPnoParams = getPnoParametersForWeek(currentStageInfo.stage, currentStageInfo.weekInStage);

        if (irrigationLogs.length > 0) {
            const lastLog = irrigationLogs[irrigationLogs.length - 1];
            if (lastLog.irrigation) {
                // --- Build Warnings List (for critical issues) ---
                const phOut = lastLog.irrigation.phOut;
                if (phOut && (phOut < 5.7 || phOut > 6.4)) {
                    warnings.push(`El último pH de salida (${phOut}) está fuera de rango. Corrige el pH en la próxima mezcla.`);
                }

                // --- Determine Watering Recommendation ---
                const ppmOut = lastLog.irrigation.ppmOut;
                const targetPpmIn = currentPnoParams?.ppm; // This is the target PPM for the current week's NUTRITION feed.

                // Check if PPM is high relative to the PNO target for the week
                if (ppmOut && typeof targetPpmIn === 'number' && ppmOut > targetPpmIn * 1.25) {
                    recommendation = "PPM de salida alto. Se recomienda riego solo con suplementos o agua para lavar raíces.";
                } else {
                    // PPM Out is fine, so follow the standard 2-for-1 cycle.
                    const lastThreeIrrigations = irrigationLogs.slice(-3);
                    const nutrientIrrigationCount = lastThreeIrrigations.filter(l => l.irrigation?.type === 'nutrients').length;

                    if (nutrientIrrigationCount >= 2) {
                        recommendation = "Se recomienda un riego con suplementos para mantener el balance (2 de nutrición, 1 de suplementos).";
                    } else {
                        recommendation = "Se recomienda un riego con nutrición según el programa.";
                    }
                }
            }
        } else {
            // First watering of the crop.
            recommendation = "Primer riego del cultivo. Se recomienda empezar con nutrición según el programa.";
        }
        
        // Combine warnings and recommendation into the final suggestion string.
        const finalSuggestion = [...warnings, recommendation].filter(Boolean).join(' ');
        setIrrigationSuggestion(finalSuggestion);
    }
}, [activeCrop]);

  useEffect(() => {
    const calculateSVP = (temp: number) => (0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)));
    const svpLeaf = calculateSVP(formData.leafTemp);
    const avpAir = calculateSVP(formData.temp) * (formData.humidity / 100);
    const calculatedVpd = svpLeaf - avpAir;
    setVpd(parseFloat(Math.max(0, calculatedVpd).toFixed(2)));
  }, [formData.temp, formData.humidity, formData.leafTemp]);

  const isPhOutOfRange = useMemo(() => {
    const ph = formData.ph;
    return ph > 0 && (ph < 5.7 || ph > 6.4);
  }, [formData.ph]);

  const isPhOutOutOfRange = useMemo(() => {
    const ph = formData.phOut;
    return ph > 0 && (ph < 5.7 || ph > 6.4);
  }, [formData.phOut]);

  const phAlert = useMemo(() => {
    if (isPhOutOfRange) {
        return `¡Alerta! El pH está fuera del rango ideal (5.7 - 6.4). Considera usar un ajustador de pH (pH Up/Down) para corregirlo.`;
    }
    return null;
  }, [isPhOutOfRange]);

  const handleNumericChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData(prev => ({...prev, notes: e.target.value}));
  };

  const handleCheckboxChange = (
    value: string, 
    list: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
  };

  const handleCapture = (dataUrl: string) => {
    if (photos.length < MAX_PHOTOS) {
      setPhotos(prevPhotos => [...prevPhotos, dataUrl]);
    }
    setIsCameraOpen(false);
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const clearSensorData = () => {
    setSensorData(null);
    setSelectedFileName('');
    if (sensorFileInputRef.current) {
        sensorFileInputRef.current.value = '';
    }
    setFormData(prev => {
        const notesWithoutSummary = prev.notes.replace(/\n\nResumen de datos del sensor \(\d+ lecturas\):[\s\S]*/, '').trim();
        return { ...prev, notes: notesWithoutSummary };
    });
  };

  const handleSensorFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      clearSensorData();
      return;
    }

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            if (!text) throw new Error("El archivo está vacío.");

            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) throw new Error("El archivo CSV debe tener una cabecera y al menos una fila de datos.");
            
            const separator = lines[0].includes(';') ? ';' : ',';
            const header = lines[0].toLowerCase().split(separator).map(h => h.trim().replace(/"/g, ''));
            const dateIndex = header.findIndex(h => h.includes('fecha') || h.includes('date'));
            const hourIndex = header.findIndex(h => h.includes('hora') || h.includes('time'));
            const tempIndex = header.findIndex(h => h.includes('temperatura') || h.includes('temperature'));
            const humIndex = header.findIndex(h => h.includes('humedad') || h.includes('humidity'));

            if ([dateIndex, hourIndex, tempIndex, humIndex].some(i => i === -1)) {
                throw new Error("Columnas requeridas no encontradas: 'Fecha', 'Hora', 'Temperatura', 'Humedad'.");
            }

            const detailedData: SensorDataPoint[] = [];
            let temps: number[] = [];
            let hums: number[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, ''));
                if (values.length < header.length) continue;

                const dateStr = values[dateIndex];
                const timeStr = values[hourIndex];
                const temp = parseFloat(values[tempIndex].replace(',', '.'));
                const humidity = parseFloat(values[humIndex].replace(',', '.'));

                if (dateStr && timeStr && !isNaN(temp) && !isNaN(humidity)) {
                    const dateParts = dateStr.split(/[\/-]/);
                    if (dateParts.length !== 3) continue;

                    const [day, month, year] = dateParts.map(Number);
                    const [hour, minute] = timeStr.split(':').map(Number);

                    if ([day, month, year, hour, minute].some(isNaN)) continue;

                    const fullYear = year < 100 ? 2000 + year : year;
                    const dateObject = new Date(fullYear, month - 1, day, hour, minute);

                    if (isNaN(dateObject.getTime())) continue;

                    temps.push(temp);
                    hums.push(humidity);
                    detailedData.push({ timestamp: dateObject.toISOString(), temperature: temp, humidity });
                }
            }

            if (temps.length === 0) {
                throw new Error("No se encontraron datos válidos en el formato esperado (ej. 25/09/2025;14:30;25.5;60).");
            }

            const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);
            const avgHum = hums.reduce((a, b) => a + b, 0) / hums.length;
            const minHum = Math.min(...hums);
            const maxHum = Math.max(...hums);

            const summary = `Resumen de datos del sensor (${detailedData.length} lecturas):\n- Temp: Min ${minTemp.toFixed(1)}°C, Prom ${avgTemp.toFixed(1)}°C, Max ${maxTemp.toFixed(1)}°C\n- Humedad: Min ${minHum.toFixed(0)}%, Prom ${avgHum.toFixed(0)}%, Max ${maxHum.toFixed(0)}%`;
            
            setFormData(prev => {
                const notesWithoutSummary = prev.notes.replace(/\n\nResumen de datos del sensor \(\d+ lecturas\):[\s\S]*/, '').trim();
                return {
                    ...prev,
                    temp: parseFloat(avgTemp.toFixed(1)),
                    humidity: Math.round(avgHum),
                    notes: `${notesWithoutSummary}\n\n${summary}`.trim()
                };
            });

            setSensorData(detailedData);

        } catch (error) {
            clearSensorData();
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
            alert(`Error al importar: ${errorMessage}`);
        }
    };
    reader.readAsText(file);
  };

  const handleTargetSelection = (id: string) => {
      setIsLoggingForAllMothers(false);
      setActiveCropId(null);
      setActiveBatchId(null);
      setActiveMotherPlantId(null);
      
      if (id === 'log-all-mother-plants') {
          setIsLoggingForAllMothers(true);
      } else if (id.startsWith('crop-')) {
          setActiveCropId(id);
      } else if (id.startsWith('mp-')) {
          setActiveMotherPlantId(id);
      } else {
          setActiveBatchId(id);
      }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingTarget) return;
    
    if (!irrigationChoice && !sensorData) {
        alert("Por favor, selecciona un tipo de riego o importa datos de sensor antes de guardar.");
        return;
    }
    
    const base64Photos = photos.map(p => p.split(',')[1]);

    const newLogEntry: Omit<LogEntry, 'id'> = {
      date: new Date().toISOString(),
      environmental: {
        temp: formData.temp,
        humidity: formData.humidity,
        leafTemp: formData.leafTemp,
        vpd: vpd,
        co2: formData.co2,
        ppfd: formData.ppfd,
      },
      foliarSpray: FOLIAR_PRODUCTS.filter(p => selectedFoliar.includes(p.name)),
      supplements: irrigationChoice === 'supplements' ? SUPPLEMENT_PRODUCTS.filter(p => selectedSupplements.includes(p.name)) : [],
      plantHealth: selectedHealth,
      notes: formData.notes,
      photos: base64Photos,
      sensorData: sensorData || undefined,
    };

    if (irrigationChoice) {
        newLogEntry.irrigation = {
            type: irrigationChoice,
            ph: formData.ph,
            ppm: formData.ppm,
            volume: formData.volume,
            phOut: formData.phOut || undefined,
            ppmOut: formData.ppmOut || undefined,
        };
    }
    
    if (isLoggingForAllMothers) {
        saveLogForAllActiveMotherPlants(newLogEntry);
        navigate('/');
        return;
    }

    if (isLoggingForMotherPlant && activeMotherPlant) {
      const updatedPlant = {
        ...activeMotherPlant,
        logEntries: [...activeMotherPlant.logEntries, {...newLogEntry, id: `log-${Date.now()}`}]
      };
      saveMotherPlant(updatedPlant);
      setActiveMotherPlantId(null);
      navigate('/mother-plants');
    } else if (isLoggingForBatch && activeBatch) {
      const updatedBatch = {
        ...activeBatch,
        logEntries: [...activeBatch.logEntries, {...newLogEntry, id: `log-${Date.now()}`}]
      };
      savePlantBatch(updatedBatch);
      setActiveBatchId(null);
      navigate('/batches');
    } else if (activeCrop) {
      const updatedCrop = {
          ...activeCrop,
          logEntries: [...activeCrop.logEntries, {...newLogEntry, id: `log-${Date.now()}`}]
      };
      saveCrop(updatedCrop);
      setActiveCropId(activeCrop.id); // Ensure it stays active
      navigate('/');
    }
  }

  const isSuggestionWarning = irrigationSuggestion?.toLowerCase().includes('ppm de salida alto') || irrigationSuggestion?.toLowerCase().includes('ph');

  if (!loggingTarget) {
    return (
        <div ref={topRef}>
            <TargetSelector 
                allCrops={allCrops}
                plantBatches={plantBatches}
                motherPlants={motherPlants}
                locations={locations}
                currentUser={currentUser}
                onSelect={handleTargetSelection}
            />
        </div>
    );
  }

  return (
    <div ref={topRef}>
      <h1 className="text-3xl font-bold mb-6 text-text-primary">Nueva Entrada de Registro para {targetName}</h1>
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
      <form className="space-y-6" onSubmit={handleSubmit}>

        {todaysCropTasks.length > 0 && (
            <Card>
                <h3 className="text-xl font-semibold text-primary mb-4">Tareas Pendientes para Hoy</h3>
                <div className="space-y-2">
                    {todaysCropTasks.map(task => (
                        <div key={task.id} className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="font-bold text-primary">{task.title}</p>
                            {task.description && <p className="text-sm text-text-secondary mt-1">{task.description}</p>}
                        </div>
                    ))}
                </div>
            </Card>
        )}
        
        {loggingTarget && pnoParams && (
            <Card>
              <h3 className="text-xl font-semibold text-primary mb-4">Asistente del PNO</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center">
                <div className={`p-2 rounded-lg ${isOutOfRange(formData.temp, pnoParams.tempDay, 2) ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                  <p className="font-bold text-lg text-text-secondary">Temp Día (°C)</p>
                  <p className="font-semibold text-lg">{pnoParams.tempDay.join(' - ')}</p>
                </div>
                <div className={`p-2 rounded-lg ${isOutOfRange(formData.humidity, pnoParams.humidityDay, 5) ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                  <p className="font-bold text-lg text-text-secondary">Humedad Día (%)</p>
                  <p className="font-semibold text-lg">{pnoParams.humidityDay.join(' - ')}</p>
                </div>
                <div className={`p-2 rounded-lg ${isOutOfRange(vpd, pnoParams.vpd, 0.2) ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                  <p className="font-bold text-lg text-text-secondary">VPD (kPa)</p>
                  <p className="font-semibold text-lg">{pnoParams.vpd.join(' - ')}</p>
                </div>
                <div className={`p-2 rounded-lg ${isOutOfRange(formData.co2, pnoParams.co2, 200) ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                  <p className="font-bold text-lg text-text-secondary">CO₂ (ppm)</p>
                  <p className="font-semibold text-lg">{pnoParams.co2 === 'Ambiente' ? pnoParams.co2 : pnoParams.co2.join(' - ')}</p>
                </div>
                <div className={`p-2 rounded-lg ${pnoParams.ppfd && isOutOfRange(formData.ppfd, pnoParams.ppfd, 100) ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                    <p className="font-bold text-lg text-text-secondary">PPFD</p>
                    <p className="font-semibold text-lg">{pnoParams.ppfd?.join(' - ')}</p>
                </div>
                <div className={`p-2 rounded-lg ${isOutOfRange(formData.ph, pnoParams.ph, 0.2) ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                  <p className="font-bold text-lg text-text-secondary">pH Riego</p>
                  <p className="font-semibold text-lg">{pnoParams.ph.join(' - ')}</p>
                </div>
                <div className={`p-2 rounded-lg ${isOutOfRange(formData.ppm, pnoParams.ppm) ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                  <p className="font-bold text-lg text-text-secondary">PPM Riego</p>
                  <p className="font-semibold text-lg">{pnoParams.ppm}</p>
                </div>
              </div>
            </Card>
        )}

        <Card>
          <h3 className="text-xl font-semibold text-primary mb-4">Parámetros Ambientales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <DynamicNumberInput label="Temperatura" unit="°C" value={formData.temp} onChange={(v) => handleNumericChange('temp', v)} step={0.1} buttonStep={1} min={15} max={35} precision={1} isWarning={pnoParams ? isOutOfRange(formData.temp, pnoParams.tempDay, 2) : false} />
            <DynamicNumberInput label="Humedad" unit="%" value={formData.humidity} onChange={(v) => handleNumericChange('humidity', v)} step={1} buttonStep={5} min={30} max={90} precision={0} isWarning={pnoParams ? isOutOfRange(formData.humidity, pnoParams.humidityDay, 5) : false} />
            <DynamicNumberInput label="Temp. Hoja" unit="°C" value={formData.leafTemp} onChange={(v) => handleNumericChange('leafTemp', v)} step={0.1} buttonStep={1} min={15} max={35} precision={1} />
            <DynamicNumberInput label="CO2" unit="ppm" value={formData.co2} onChange={(v) => handleNumericChange('co2', v)} step={10} buttonStep={50} min={300} max={2000} precision={0} isWarning={pnoParams ? isOutOfRange(formData.co2, pnoParams.co2, 200) : false} />
            <DynamicNumberInput label="PPFD" unit="µmol/m²/s" value={formData.ppfd} onChange={(v) => handleNumericChange('ppfd', v)} step={10} buttonStep={50} min={100} max={2000} precision={0} isWarning={pnoParams ? isOutOfRange(formData.ppfd, pnoParams.ppfd, 100) : false} />
            <div>
              <label className="block text-sm text-text-secondary mb-2 text-center">VPD (calculado)</label>
              <div className={`w-full p-3 text-center rounded-md font-bold text-2xl text-text-primary ${pnoParams && isOutOfRange(vpd, pnoParams.vpd, 0.2) ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                {vpd.toFixed(2)} kPa
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-primary mb-4">Datos de Riego</h3>
          
          {irrigationSuggestion && !isLoggingForBatch && (
              <div className={`mb-4 p-3 rounded-lg border ${isSuggestionWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-primary/10 border-primary/20'}`}>
                  <p className={`font-semibold ${isSuggestionWarning ? 'text-yellow-800' : 'text-primary-dark'}`}>Sugerencia del Sistema:</p>
                  <p className="text-sm text-text-secondary whitespace-pre-line">{irrigationSuggestion}</p>
              </div>
          )}

          {!irrigationChoice ? (
              <div className="flex flex-col sm:flex-row gap-4">
                  <button type="button" onClick={() => setIrrigationChoice('nutrients')} className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 rounded-md font-bold text-white transition-colors">Riego con Nutrición</button>
                  <button type="button" onClick={() => setIrrigationChoice('supplements')} className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-bold text-white transition-colors">Riego con Suplementos</button>
              </div>
          ) : (
          <>
              <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-lg text-text-primary">
                      Tipo de Riego: <span className={irrigationChoice === 'nutrients' ? 'text-sky-600' : 'text-purple-600'}>
                          {irrigationChoice === 'nutrients' ? 'Nutrición' : 'Suplementos'}
                      </span>
                  </p>
                  <button type="button" onClick={() => setIrrigationChoice(null)} className="text-xs text-muted hover:underline">Cambiar tipo</button>
              </div>
              
              <div className="mb-6">
                  <label className="block text-sm text-text-secondary mb-1 font-bold">Volumen Total de Riego (L)</label>
                  <input type="number" step={10} value={formData.volume} onChange={(e) => handleNumericChange('volume', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" />
              </div>
              
              {irrigationChoice === 'nutrients' && formulaForWeek && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-border-color">
                    <h4 className="font-semibold text-text-secondary text-base">Fórmula de la Semana: <span className="text-primary">{formulaForWeek.name}</span></h4>
                    {formulaForWeek.nutrients.length > 0 && formData.volume > 0 && (
                        <div className="mt-2">
                             <p className="text-sm font-bold text-text-secondary mb-1">Preparación para {formData.volume} L:</p>
                            <ul className="text-lg text-text-secondary list-disc list-inside space-y-1">
                                {formulaForWeek.nutrients.map(n => {
                                    const nutrientItem = inventory.find(item => item.id === `${n.inventoryItemId}-${parentLocationId}`);
                                    const totalAmount = n.amountPerLiter * formData.volume;
                                    return <li key={n.inventoryItemId}>{nutrientItem?.name || n.inventoryItemId}: <b>{totalAmount.toFixed(2)} {nutrientItem?.unit || 'g'}</b></li>
                                })}
                            </ul>
                        </div>
                    )}
                     {formulaForWeek.targetPPM !== undefined && (
                         <p className="text-base text-text-secondary mt-2"><b>PPM Objetivo:</b> <span className="font-bold text-primary">{formulaForWeek.targetPPM}</span></p>
                     )}
                </div>
              )}
              
              {irrigationChoice === 'supplements' && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-text-secondary mb-2">Seleccionar Suplementos de Riego</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 p-2 bg-gray-50 rounded-md">
                        {SUPPLEMENT_PRODUCTS.map(product => {
                            const isSelected = selectedSupplements.includes(product.name);
                            const doseValue = parseFloat(product.dose);
                            const unitMatch = product.dose.match(/([a-zA-Z]+)\/L/);
                            const unit = unitMatch ? unitMatch[1] : '';
                            const totalAmount = (doseValue * formData.volume).toFixed(2);

                            return (
                                <label key={product.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="flex items-center">
                                        <input type="checkbox" checked={isSelected} onChange={() => handleCheckboxChange(product.name, selectedSupplements, setSelectedSupplements)} className="form-checkbox h-5 w-5 bg-white border-border-color text-primary focus:ring-primary rounded" />
                                        <span className="ml-3 text-text-secondary">{product.name} <span className="text-xs text-muted">({product.dose})</span></span>
                                    </div>
                                    {isSelected && formData.volume > 0 && (
                                        <span className="font-bold text-primary ml-2 text-sm">
                                            {totalAmount} {unit}
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <DynamicNumberInput
                        label="pH Entrada"
                        value={formData.ph}
                        onChange={(v) => handleNumericChange('ph', v)}
                        step={0.1}
                        buttonStep={0.5}
                        min={5}
                        max={7}
                        precision={1}
                        isWarning={isPhOutOfRange}
                    />
                    {phAlert && (
                        <div className="mt-2 text-xs text-yellow-800 p-2 bg-yellow-50 rounded border border-yellow-200">
                            {phAlert}
                        </div>
                    )}
                </div>
                <DynamicNumberInput label="PPM Entrada" value={formData.ppm} onChange={(v) => handleNumericChange('ppm', v)} step={1} buttonStep={50} min={0} max={2000} precision={0} isWarning={pnoParams ? isOutOfRange(formData.ppm, pnoParams.ppm) : false} />
                <DynamicNumberInput label="pH Salida" value={formData.phOut} onChange={(v) => handleNumericChange('phOut', v)} step={0.1} buttonStep={0.5} min={0} max={10} precision={1} isWarning={isPhOutOutOfRange} />
                <DynamicNumberInput label="PPM Salida" value={formData.ppmOut} onChange={(v) => handleNumericChange('ppmOut', v)} step={1} buttonStep={50} min={0} max={3000} precision={0} />
              </div>
          </>
          )}
        </Card>
        
        <Card>
             <button type="button" onClick={() => setIsFoliarOpen(!isFoliarOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-xl font-semibold text-primary">Aplicación Foliar</h3>
                <span className="text-xl transform transition-transform">{isFoliarOpen ? '▲' : '▼'}</span>
            </button>
            {isFoliarOpen && (
                <div className="mt-4">
                    <div className="mb-4">
                        <label className="block text-sm text-text-secondary mb-1 font-bold">Volumen Total de Aspersión (L)</label>
                        <input
                            type="number"
                            step={1}
                            value={foliarVolume}
                            onChange={(e) => setFoliarVolume(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md"
                        />
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {FOLIAR_PRODUCTS.map(product => {
                           const isSelected = selectedFoliar.includes(product.name);
                           const doseValue = parseFloat(product.dose);
                           const unitMatch = product.dose.match(/([a-zA-Z]+)\/L/);
                           const unit = unitMatch ? unitMatch[1] : '';
                           const totalAmount = (doseValue * foliarVolume).toFixed(2);
                            return (
                                <label key={product.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="flex items-center">
                                        <input type="checkbox" checked={isSelected} onChange={() => handleCheckboxChange(product.name, selectedFoliar, setSelectedFoliar)} className="form-checkbox h-5 w-5 bg-white border-border-color text-primary focus:ring-primary rounded" />
                                        <span className="ml-3 text-text-secondary">{product.name} <span className="text-xs text-muted">({product.dose})</span></span>
                                    </div>
                                    {isSelected && foliarVolume > 0 && (
                                        <span className="font-bold text-primary ml-2 text-sm">
                                            {totalAmount} {unit}
                                        </span>
                                    )}
                                </label>
                            )
                        })}
                    </div>
                </div>
            )}
        </Card>

        <Card>
            <h3 className="text-xl font-semibold text-primary">Fotos e Importación de Datos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Fotos del Día</label>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      disabled={photos.length >= MAX_PHOTOS}
                      className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary font-bold rounded-md transition-colors disabled:opacity-50"
                    >
                      Tomar Foto ({photos.length}/{MAX_PHOTOS})
                    </button>
                    {photos.length >= MAX_PHOTOS && <p className="text-xs text-center text-muted mt-2">Límite de fotos alcanzado.</p>}
                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img src={photo} alt={`Foto del día ${index + 1}`} className="w-full h-auto rounded-lg object-cover aspect-square" />
                          <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Importar Datos de Sensor (CSV)</label>
                    <p className="text-xs text-muted mb-2">Carga datos de sensor para esta entrada.</p>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sensor-file-input" className="cursor-pointer py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary font-bold rounded-md transition-colors text-sm whitespace-nowrap">
                            Seleccionar archivo
                        </label>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-border-color rounded-md w-full min-w-0">
                            <span className="text-sm text-text-secondary truncate flex-grow min-w-0" title={selectedFileName || 'Sin archivo seleccionado'}>
                                {selectedFileName || 'Sin archivo seleccionado'}
                            </span>
                            {selectedFileName && (
                                <button 
                                    type="button" 
                                    onClick={clearSensorData} 
                                    className="ml-auto text-red-500 hover:text-red-700 text-xl font-bold flex-shrink-0 leading-none"
                                    aria-label="Quitar archivo"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>
                    <input
                        id="sensor-file-input"
                        ref={sensorFileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleSensorFile}
                        className="hidden"
                    />
                </div>
            </div>
        </Card>

        <Card>
            <h3 className="text-xl font-semibold text-primary">Salud General y Notas</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="max-h-96 overflow-y-auto pr-2">
                  {Object.entries(PLANT_HEALTH_OPTIONS).map(([category, options]) => {
                      const isOpen = openHealthCategories[category];
                      return (
                        <div key={category} className="mb-2">
                          <button type="button" onClick={() => toggleHealthCategory(category)} className="w-full flex justify-between items-center text-left font-semibold text-text-secondary border-b border-border-color pb-1 mb-2">
                            <span>{category}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {isOpen && (
                              <div className="space-y-2 mt-2">
                                {(options as string[]).map(option => (
                                  <label key={option} className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={selectedHealth.includes(option)} onChange={() => handleCheckboxChange(option, selectedHealth, setSelectedHealth)} className="form-checkbox h-4 w-4 bg-white border-border-color text-primary focus:ring-primary rounded" />
                                    <span className="ml-2 text-text-secondary text-sm">{option}</span>
                                  </label>
                                ))}
                              </div>
                          )}
                        </div>
                      )
                  })}
                </div>
                <div>
                  <h4 className="font-semibold text-text-secondary mb-2">Notas Adicionales</h4>
                  <textarea rows={10} value={formData.notes} onChange={handleTextChange} className="w-full h-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" placeholder="Observaciones, defoliaciones, podas, etc."></textarea>
                </div>
            </div>
        </Card>

        <div className="flex justify-end">
          <button type="submit" className="py-2 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors">
            Guardar Entrada
          </button>
        </div>
      </form>
    </div>
  );
};

export default Log;