import React, { useMemo, useState } from 'react';
import { useCrops, useConfirmation, useAuth, usePlantBatches, useTasks, useGenetics, useLocations, useMotherPlants, useMaintenanceLogs } from '../context/AppProvider';
import Card from './ui/Card';
import { Crop, CropStage, UserRole, PlantBatch, PlantBatchStatus, Location, Task, SensorDataPoint, Genetics, MotherPlant, STAGES } from '../types';
import { getStageInfo, getPnoParametersForWeek, getRangeStatus } from '../services/nutritionService';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MaintenanceDashboard from './MaintenanceDashboard';
import WeeklyTaskCalendar from './WeeklyTaskCalendar';
import HarvestProjection from './HarvestProjection';
import SelectCropForTaskModal from './SelectCropForTaskModal';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const SensorDetailModal: React.FC<{
    data: SensorDataPoint[];
    onClose: () => void;
    logDate: string;
}> = ({ data, onClose, logDate }) => {
    const formattedData = data.map(d => ({
        ...d,
        time: new Date(d.timestamp).toLocaleString('es-ES', { day:'numeric', month:'short', hour: '2-digit', minute: '2-digit' }),
    }));
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl relative h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-2xl">&times;</button>
                <h3 className="text-lg font-bold mb-4">Detalle de Sensores - {new Date(logDate).toLocaleDateString()}</h3>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
                            <XAxis dataKey="time" stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
                            <YAxis yAxisId="left" stroke="#F56565" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#F56565' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#4299E1" label={{ value: '%', angle: -90, position: 'insideRight', fill: '#4299E1' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperatura" stroke="#F56565" dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humedad" stroke="#4299E1" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    )
};

const MoveCropModal: React.FC<{
    crop: Crop;
    destinationRooms: Location[];
    onConfirm: (destinationRoomId: string) => void;
    onCancel: () => void;
}> = ({ crop, destinationRooms, onConfirm, onCancel }) => {
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const { locations } = useLocations();
    const stageInfo = getStageInfo(crop);
    const nextStage = stageInfo.stage === CropStage.PRE_VEGETATION ? 'Vegetación' : 'Floración';

    const cropName = locations.find(l => l.id === crop.locationId)?.name || crop.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Mover Cultivo a {nextStage}</h3>
                <p className="text-text-secondary mb-4">El cultivo "{cropName}" está listo para avanzar. Por favor, selecciona la sala de destino desocupada.</p>
                <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md mb-6" required>
                    <option value="">Seleccionar cuarto...</option>
                    {destinationRooms.map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                </select>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                    <button onClick={() => onConfirm(selectedRoomId)} disabled={!selectedRoomId} className="px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white disabled:opacity-50">Confirmar</button>
                </div>
            </Card>
        </div>
    );
};

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const StageSection: React.FC<{ title: string; children: React.ReactNode; count: number; isOpen: boolean; onToggle: () => void; }> = ({ title, children, count, isOpen, onToggle }) => {
    if (count === 0) return null;
    return (
        <div className="bg-surface rounded-lg border border-border-color">
            <header onClick={onToggle} className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
                <h2 className="text-xl font-bold text-text-secondary">{title} ({count})</h2>
                <ChevronIcon isOpen={isOpen} />
            </header>
            {isOpen && (
                <div className="px-4 pb-4">
                    <div className="space-y-2">{children}</div>
                </div>
            )}
        </div>
    );
};

const CropRow: React.FC<{
    crop: Crop;
    onAdvance: (crop: Crop) => void;
    onLogEntry: (cropId: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ crop, onAdvance, onLogEntry, isOpen, onToggle }) => {
    const { activeCropId, deleteCrop, archiveCrop } = useCrops();
    const { showConfirmation } = useConfirmation();
    const { currentUser } = useAuth();
    const { genetics } = useGenetics();
    const { locations } = useLocations();
    const { plantBatches } = usePlantBatches();

    const stageInfo = getStageInfo(crop);

    const readyToAdvanceInfo = useMemo(() => {
        if (stageInfo.stage === CropStage.PRE_VEGETATION && stageInfo.daysInStage >= 14) {
            return { ready: true, message: 'Este cultivo ha cumplido su tiempo en Pre-Vegetación y está listo para moverse a Vegetación.', nextStageLabel: 'Mover a Veg' };
        }
        if (stageInfo.stage === CropStage.VEGETATION && stageInfo.daysInStage >= 21) {
            return { ready: true, message: 'Este cultivo ha cumplido su tiempo en Vegetación y está listo para pasar a Floración.', nextStageLabel: 'Mover a Flora' };
        }
        return { ready: false, message: '', nextStageLabel: '' };
    }, [stageInfo]);
    
    const pnoStatus = useMemo(() => {
        const lastLog = crop.logEntries[crop.logEntries.length - 1];
        if (!lastLog || !lastLog.environmental) return { status: 'nodata', warnings: [] };

        const params = getPnoParametersForWeek(stageInfo.stage, stageInfo.weekInStage);
        if (!params) return { status: 'nodata', warnings: [] };

        const warnings = [];
        let worstStatus: 'in-range' | 'warning' | 'danger' = 'in-range';

        const checkParam = (value: number, range: [number, number] | number, warningTol: number, dangerTol: number | undefined, name: string) => {
            const status = getRangeStatus(value, range, warningTol, dangerTol);
            if (status !== 'in-range') {
                warnings.push(name);
                if (status === 'danger') worstStatus = 'danger';
                else if (status === 'warning' && worstStatus !== 'danger') worstStatus = 'warning';
            }
        };
        
        checkParam(lastLog.environmental.temp, params.tempDay, 2, 3, 'Temp');
        checkParam(lastLog.environmental.humidity, params.humidityDay, 5, 10, 'Hum');
        checkParam(lastLog.environmental.vpd, params.vpd, 0.2, 0.3, 'VPD');

        return { status: warnings.length > 0 ? worstStatus : 'in-range', warnings: warnings };
    }, [crop.logEntries, stageInfo]);


    const lastLogDate = useMemo(() => {
        if (crop.logEntries.length === 0) return 'Nunca';
        const logDate = new Date(crop.logEntries[crop.logEntries.length - 1].date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (logDate.toDateString() === today.toDateString()) return 'Hoy';
        if (logDate.toDateString() === yesterday.toDateString()) return 'Ayer';
        const daysAgo = Math.floor((today.getTime() - logDate.getTime()) / MS_PER_DAY);
        return `Hace ${daysAgo} días`;

    }, [crop.logEntries]);
    
    const nextStageDate = useMemo(() => {
        let expectedDays = 0;
        let startDate: Date | null = null;
    
        if (stageInfo.stage === CropStage.PRE_VEGETATION) { expectedDays = 14; startDate = crop.preVegDate ? new Date(crop.preVegDate) : new Date(crop.cloningDate); }
        else if (stageInfo.stage === CropStage.VEGETATION) { expectedDays = 21; startDate = crop.vegDate ? new Date(crop.vegDate) : null; }
        else if (stageInfo.stage === CropStage.FLOWERING) { expectedDays = 63; startDate = crop.flowerDate ? new Date(crop.flowerDate) : null; }
        else return 'N/A';
    
        if (!startDate) return 'N/A';
    
        const targetDate = new Date(startDate.getTime() + expectedDays * MS_PER_DAY);
        return targetDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    }, [stageInfo, crop]);

    const isSelected = activeCropId === crop.id;
    const cropName = useMemo(() => locations.find(l => l.id === crop.locationId)?.name || crop.id, [locations, crop.locationId]);
    
    const lightCycle = useMemo(() => {
        const location = locations.find(l => l.id === crop.locationId);
        if (location?.lightOnTime && location?.lightOffTime) {
            return `${location.lightOnTime} - ${location.lightOffTime}`;
        }
        // Fallback for older data or unconfigured rooms
        return [CropStage.CLONING, CropStage.PRE_VEGETATION, CropStage.VEGETATION].includes(stageInfo.stage) ? '18/6h' : '12/12h';
    }, [locations, crop.locationId, stageInfo.stage]);
    
    const plantCountsByGenetic = useMemo(() => {
        const counts: Record<string, number> = {};
        if (!crop.plantCounts) return counts;

        crop.plantCounts.forEach(pc => {
            let genetic: Genetics | undefined;
            const batch = plantBatches.find(b => b.id === pc.batchId);
            
            if (batch) {
                genetic = genetics.find(g => g.id === batch.geneticsId);
            } else {
                // Fallback for missing batches in data, parse from ID
                const code = pc.batchId.split('-')[0];
                genetic = genetics.find(g => g.code === code);
            }
            
            if (genetic) {
                counts[genetic.name] = (counts[genetic.name] || 0) + pc.count;
            } else {
                // Last resort fallback
                counts[pc.batchId] = (counts[pc.batchId] || 0) + pc.count;
            }
        });
        return counts;
    }, [crop.plantCounts, plantBatches, genetics]);

    const totalPlants = useMemo(() => {
        return crop.plantCounts.reduce((sum, pc) => sum + pc.count, 0);
    }, [crop.plantCounts]);


    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirmation(`¿Estás seguro de que quieres eliminar el cultivo "${cropName}"? Esta acción no se puede deshacer.`, () => deleteCrop(crop.id));
    };

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirmation(`¿Estás seguro de que quieres archivar el cultivo "${cropName}"? Se moverá al historial y liberará la habitación.`, () => archiveCrop(crop.id));
    };
    
    const canAdvance = stageInfo.stage !== CropStage.HARVESTED;
    const canLog = [CropStage.PRE_VEGETATION, CropStage.VEGETATION, CropStage.FLOWERING].includes(stageInfo.stage);

    const statusColor = {
        'nodata': 'bg-gray-400',
        'in-range': 'bg-green-500',
        'warning': 'bg-yellow-500',
        'danger': 'bg-red-500',
    };

    return (
        <div className={`border rounded-lg transition-all duration-200 ${isSelected ? 'bg-gray-100 ring-2 ring-primary' : 'bg-gray-50'}`}>
            <header onClick={onToggle} className="flex justify-between items-center p-2 sm:p-4 cursor-pointer hover:bg-gray-100 rounded-t-lg">
                <span className="font-bold text-text-primary text-base sm:text-lg">{cropName}</span>
                <div className="flex items-center gap-2 sm:gap-4">
                     <span title={pnoStatus.status === 'nodata' ? "Sin datos" : (pnoStatus.warnings.length > 0 ? `Fuera de rango: ${pnoStatus.warnings.join(', ')}` : "Parámetros en rango")}>
                        <div className={`w-3 h-3 rounded-full ${statusColor[pnoStatus.status]}`}></div>
                     </span>
                     {readyToAdvanceInfo.ready && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white animate-pulse">
                            {readyToAdvanceInfo.nextStageLabel}
                        </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stageInfo.stage === CropStage.HARVESTED ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
                        {stageInfo.stage}
                    </span>
                    <span className="text-sm text-text-secondary w-28 sm:w-36 text-right">Sem {stageInfo.weekInStage} / Día {stageInfo.dayOfWeekInStage}</span>
                    <ChevronIcon isOpen={isOpen} />
                </div>
            </header>
            {isOpen && (
                <div className="p-2 sm:p-4 border-t border-border-color space-y-3">
                    {readyToAdvanceInfo.ready && (
                        <div className="p-3 mb-2 bg-blue-100 border border-blue-200 rounded-lg text-center">
                            <p className="font-bold text-blue-800">{readyToAdvanceInfo.message}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        <div className="col-span-full">
                            <span className="text-text-secondary">Genéticas:</span>
                            <p className="font-semibold text-text-primary break-words">
                                {Object.entries(plantCountsByGenetic).map(([name, count]) => `${name} (${count})`).join(', ') || 'N/A'}
                            </p>
                        </div>
                        <div><span className="text-text-secondary">Total Plantas:</span><p className="font-semibold text-text-primary">{totalPlants}</p></div>
                        <div><span className="text-text-secondary">Días Totales:</span><p className="font-semibold text-text-primary">{stageInfo.totalDays + 1}</p></div>
                        <div><span className="text-text-secondary">Ciclo Luz:</span><p className="font-semibold text-text-primary">{lightCycle}</p></div>
                        <div><span className="text-text-secondary">Último Log:</span><p className="font-semibold text-text-primary">{lastLogDate}</p></div>
                        <div><span className="text-text-secondary">Próxima Etapa (est.):</span><p className="font-semibold text-text-primary">{nextStageDate}</p></div>

                    </div>
                    <div className="flex justify-end items-center gap-4 pt-3">
                        {canLog && <button onClick={(e) => { e.stopPropagation(); onLogEntry(crop.id); }} className="text-xs font-bold py-1 px-3 rounded bg-gray-200 hover:bg-gray-300 text-text-primary">Registrar Cuidados</button>}
                        {canAdvance && <button onClick={(e) => { e.stopPropagation(); onAdvance(crop); }} className="text-xs font-bold py-1 px-3 rounded bg-primary hover:bg-primary-dark text-white">Avanzar Etapa</button>}
                        {stageInfo.stage === CropStage.HARVESTED && <button onClick={handleArchive} className="text-xs text-blue-500 hover:text-blue-400">Archivar</button>}
                        {currentUser?.roles.includes(UserRole.ADMIN) && <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-400">Eliminar</button>}
                    </div>
                </div>
            )}
        </div>
    );
};

const BatchRow: React.FC<{
    batch: PlantBatch;
    onMoveToPreVeg: (batch: PlantBatch) => void;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ batch, onMoveToPreVeg, isOpen, onToggle }) => {
    const navigate = useNavigate();
    const { setActiveBatchId } = usePlantBatches();
    const { genetics } = useGenetics();
    const { locations } = useLocations();
    const { motherPlants } = useMotherPlants();

    const totalDays = useMemo(() => {
        const creationDate = new Date(batch.creationDate);
        const start = new Date(creationDate.getFullYear(), creationDate.getMonth(), creationDate.getDate());
        const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        return Math.max(0, Math.floor((today.getTime() - start.getTime()) / MS_PER_DAY));
    }, [batch.creationDate]);

    const weekInStage = Math.floor(totalDays / 7) + 1;
    const dayOfWeekInStage = (totalDays % 7) + 1;
    
    const overdueDays = totalDays > 14 ? totalDays - 14 : 0;
    const overdueWeeks = Math.floor(overdueDays / 7);
    const overdueRemainderDays = overdueDays % 7;

    const canMoveToPreVeg = batch.status === PlantBatchStatus.GERMINATION_ROOTING && totalDays >= 14 && batch.rootedPlantCount && batch.rootedPlantCount > 0;
    const plantCountDisplay = `${batch.initialPlantCount} / ${batch.rootedPlantCount ?? 'N/A'} / ${batch.availablePlantCount}`;
    const geneticInfo = genetics.find(g => g.id === batch.geneticsId);

    const sourceInfo = useMemo(() => {
        if (batch.sourceLocationId.startsWith('mp-')) {
            return motherPlants.find(mp => mp.id === batch.sourceLocationId)?.name || 'Planta Madre Desconocida';
        }
        return locations.find(l => l.id === batch.sourceLocationId)?.name || 'Ubicación Desconocida';
    }, [batch.sourceLocationId, locations, motherPlants]);

    const handleLogEntry = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveBatchId(batch.id);
        navigate('/log');
    };

    return (
        <div className="bg-gray-50 rounded-lg border border-border-color">
            <header onClick={onToggle} className="flex justify-between items-center p-2 sm:p-4 cursor-pointer hover:bg-gray-100 rounded-t-lg">
                <span className="font-bold text-text-primary text-base sm:text-lg">{batch.id} <span className="text-text-secondary font-normal hidden sm:inline">({geneticInfo?.name})</span></span>
                <div className="flex items-center gap-2 sm:gap-4">
                    {overdueDays > 0 && (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                            RETRASO: {overdueWeeks > 0 && `${overdueWeeks} sem`} {overdueRemainderDays > 0 && `${overdueRemainderDays} días`}
                        </span>
                    )}
                    {canMoveToPreVeg && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white animate-pulse">
                            Mover a Pre-Veg
                        </span>
                    )}
                    <span className="text-sm text-text-secondary w-28 sm:w-36 text-right">Sem {weekInStage} / Día {dayOfWeekInStage}</span>
                    <ChevronIcon isOpen={isOpen} />
                </div>
            </header>
            {isOpen && (
                <div className="p-2 sm:p-4 border-t border-border-color space-y-3">
                    {canMoveToPreVeg && (
                        <div className="p-3 mb-2 bg-blue-100 border border-blue-200 rounded-lg text-center">
                            <p className="font-bold text-blue-800">Este lote está listo para ser movido a Pre-Vegetación. {overdueDays > 0 && `¡Tiene un retraso de ${overdueDays} días!`}</p>
                        </div>
                    )}
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        <div><span className="text-text-secondary">Creado:</span><p className="font-semibold text-text-primary">{new Date(batch.creationDate).toLocaleDateString()}</p></div>
                        <div><span className="text-text-secondary">Días en Germ.:</span><p className="font-semibold text-text-primary">{totalDays + 1}</p></div>
                        <div><span className="text-text-secondary">Fuente:</span><p className="font-semibold text-text-primary">{sourceInfo}</p></div>
                        <div className="col-span-full"><span className="text-text-secondary">Plantas (Ini/Enr/Disp):</span><p className="font-semibold text-text-primary">{plantCountDisplay}</p></div>
                     </div>
                    <div className="pt-3 space-y-2">
                        {batch.status === PlantBatchStatus.GERMINATION_ROOTING && (
                            <>
                                <button onClick={handleLogEntry} className="w-full text-sm font-bold py-2 px-3 rounded bg-gray-200 hover:bg-gray-300 text-text-primary">Registrar Cuidados</button>
                                {canMoveToPreVeg ? (
                                    <button onClick={(e) => { e.stopPropagation(); onMoveToPreVeg(batch); }} className="w-full text-sm font-bold py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white">Mover a Pre-Veg</button>
                                ) : (
                                    <p className="text-xs text-center text-text-secondary">Registra plantas enraizadas y espera 14 días para avanzar.</p>
                                )}
                            </>
                        )}
                        {batch.status === PlantBatchStatus.PRE_VEGETATION && (
                            <p className="text-sm text-center text-green-600 font-semibold">Listo para configurar cultivo.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const GrowerAdminDashboard: React.FC = () => {
  const { allCrops, saveCrop, setActiveCropId, activeCrop } = useCrops();
  const { plantBatches, savePlantBatch } = usePlantBatches();
  const { currentUser, activeRole } = useAuth();
  const { locations, saveLocation } = useLocations();
  const { showConfirmation } = useConfirmation();
  const { completeTaskForCrop } = useTasks();
  const navigate = useNavigate();
  const { maintenanceLogs } = useMaintenanceLogs();

  const [movingCrop, setMovingCrop] = useState<Crop | null>(null);
  const [viewingSensorData, setViewingSensorData] = useState<{ data: SensorDataPoint[], date: string } | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

  const weeklyCompletedTasks = useMemo(() => {
    const map = new Map<string, Set<string>>();
    maintenanceLogs.forEach(log => {
        const dateStr = log.completedAt.split('T')[0];
        if (!map.has(dateStr)) {
            map.set(dateStr, new Set());
        }
        map.get(dateStr)!.add(log.taskId);
    });
    return map;
  }, [maintenanceLogs]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
      () => ({
          calendar: false,
          projection: false,
          germination: false,
          preveg: false,
          ...STAGES.reduce((acc, stage) => ({...acc, [stage]: false}), {})
      })
  );

  const handleToggleSection = (sectionKey: string) => {
      setExpandedSections(prev => ({...prev, [sectionKey]: !prev[sectionKey]}));
  };

  const handleToggleRow = (id: string) => {
    const newExpandedId = expandedRowId === id ? null : id;
    setExpandedRowId(newExpandedId);
    if (id.startsWith('crop-')) {
        setActiveCropId(newExpandedId);
    } else if (activeCrop) {
        // If user opens a batch row, deselect any active crop
        setActiveCropId(null);
    }
  };

  const handleLogEntryForCrop = (cropId: string) => {
    setActiveCropId(cropId);
    navigate('/log');
  };

  const handleAdvanceStage = (crop: Crop) => {
    const stageInfo = getStageInfo(crop);
    const now = new Date().toISOString();
    const cropName = locations.find(l => l.id === crop.locationId)?.name || crop.id;
    const cropLocation = locations.find(l => l.id === crop.locationId);

    if (stageInfo.stage === CropStage.CLONING) {
        showConfirmation(`¿Estás seguro de que quieres avanzar "${cropName}" a Pre-Vegetación?`, () => saveCrop({ ...crop, preVegDate: now }));
    } else if (stageInfo.stage === CropStage.PRE_VEGETATION) {
        if (cropLocation?.type === 'VEGETACION') {
            setMovingCrop(crop);
            return;
        }
        showConfirmation(`¿Estás seguro de que quieres avanzar "${cropName}" a Vegetación?`, () => saveCrop({ ...crop, vegDate: now }));
    } else if (stageInfo.stage === CropStage.VEGETATION) {
        if (cropLocation?.type === 'VEGETACION') {
            setMovingCrop(crop);
            return;
        }
        showConfirmation(`¿Estás seguro de que quieres avanzar "${cropName}" a Floración?`, () => {
            saveCrop({ ...crop, flowerDate: now });
            if (cropLocation?.type === 'ciclo completo') {
                saveLocation({ ...cropLocation, lightOnTime: '06:00', lightOffTime: '18:00' });
            }
        });
    } else if (stageInfo.stage === CropStage.FLOWERING) {
        showConfirmation(`¿Estás seguro de que quieres mover "${cropName}" a Secado y Curado?`, () => saveCrop({ ...crop, dryingCuringDate: now }));
    } else if (stageInfo.stage === CropStage.DRYING_CURING) {
        showConfirmation(`¿Estás seguro de que quieres marcar "${cropName}" como Cosechado?`, () => saveCrop({ ...crop, harvestDate: now }));
    }
  };

  const handleMoveConfirm = (destinationRoomId: string) => {
    if (!movingCrop) return;
    const now = new Date().toISOString();
    const stageInfo = getStageInfo(movingCrop);

    let updatedCrop: Crop = { ...movingCrop, locationId: destinationRoomId };
    
    if (stageInfo.stage === CropStage.PRE_VEGETATION) {
        updatedCrop.vegDate = now;
    } else if (stageInfo.stage === CropStage.VEGETATION) {
        updatedCrop.flowerDate = now;
        const room = locations.find(l => l.id === destinationRoomId);
        if (room && room.type === 'ciclo completo') {
            saveLocation({ ...room, lightOnTime: '06:00', lightOffTime: '18:00' });
        }
    }
    
    saveCrop(updatedCrop);
    setMovingCrop(null);
  };
  
   const handleTaskCompletion = (task: Task) => {
      if (!currentUser) return;

      if (task.assigneeRoles.includes(UserRole.GROWER)) {
          setTaskToComplete(task);
      } else if (task.assigneeRoles.includes(UserRole.MAINTENANCE)) {
           navigate('/maintenance-calendar', { state: { taskToComplete: task } });
      }
   };

   const handleConfirmTaskCrop = (cropId: string) => {
       if (taskToComplete && currentUser) {
           completeTaskForCrop(taskToComplete.id, cropId, currentUser.id);
       }
       setTaskToComplete(null);
   };


  const cropsAndBatches = useMemo(() => {
    let filteredCrops = allCrops.filter(c => !c.isArchived);
    let filteredBatches = plantBatches;
    
    if (activeRole === UserRole.TRIMMER) {
        filteredCrops = filteredCrops.filter(c => {
            const stage = getStageInfo(c).stage;
            return stage === CropStage.DRYING_CURING || stage === CropStage.HARVESTED;
        });
        filteredBatches = []; // Trimmers do not see batches
    } else if (currentUser && !isAdmin && currentUser.locationId !== 'TODAS') {
        const userMainLocationId = currentUser.locationId;
        if (userMainLocationId) {
             filteredCrops = filteredCrops.filter(crop => {
                const room = locations.find(l => l.id === crop.locationId);
                return room?.parentId === userMainLocationId;
            });
            filteredBatches = filteredBatches.filter(batch => {
                // Find the parent location of the batch's source room
                const sourceRoom = locations.find(l => l.id === batch.sourceLocationId);
                const batchParentLocationId = sourceRoom?.parentId || batch.sourceLocationId;
                return batchParentLocationId === userMainLocationId;
            });
        }
    }

    const groupedCrops = filteredCrops.reduce((acc, crop) => {
      const stage = getStageInfo(crop).stage;
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(crop);
      return acc;
    }, {} as { [key in CropStage]?: Crop[] });

    STAGES.forEach(stage => {
      if (groupedCrops[stage]) {
        groupedCrops[stage]?.sort((a, b) => a.locationId.localeCompare(b.locationId));
      }
    });

    return {
        groupedCrops,
        germinationBatches: filteredBatches.filter(b => b.status === PlantBatchStatus.GERMINATION_ROOTING),
        preVegBatches: filteredBatches.filter(b => b.status === PlantBatchStatus.PRE_VEGETATION)
    };
  }, [allCrops, plantBatches, currentUser, activeRole, locations, isAdmin]);


  const destinationRooms = useMemo(() => {
    if (!movingCrop) return [];
    const stageInfo = getStageInfo(movingCrop);
    const occupiedRoomIds = new Set(allCrops.filter(c => !c.isArchived).map(c => c.locationId));
    const parentId = locations.find(l => l.id === movingCrop.locationId)?.parentId;

    if (stageInfo.stage === CropStage.PRE_VEGETATION) {
      return locations.filter(l => l.parentId === parentId && !occupiedRoomIds.has(l.id) && (l.type === 'VEGETACION' || l.type === 'ciclo completo'));
    }
    if (stageInfo.stage === CropStage.VEGETATION) {
      return locations.filter(l => l.parentId === parentId && !occupiedRoomIds.has(l.id) && (l.type === 'FLORACION' || l.type === 'ciclo completo'));
    }
    return [];
  }, [movingCrop, locations, allCrops]);
  
  const harvestProjectionsCount = useMemo(() => {
     return allCrops.filter(c => !c.isArchived && c.flowerDate).length;
  }, [allCrops]);

  // Redirect logic for specific roles
  if (activeRole === UserRole.MAINTENANCE) {
      return <MaintenanceDashboard />;
  }

  return (
    <div className="space-y-4">
        {movingCrop && <MoveCropModal crop={movingCrop} destinationRooms={destinationRooms} onConfirm={handleMoveConfirm} onCancel={() => setMovingCrop(null)} />}
        {viewingSensorData && <SensorDetailModal data={viewingSensorData.data} logDate={viewingSensorData.date} onClose={() => setViewingSensorData(null)} />}
        {taskToComplete && <SelectCropForTaskModal task={taskToComplete} onClose={() => setTaskToComplete(null)} onConfirm={handleConfirmTaskCrop} />}

       <StageSection title="Calendario de Tareas de la Semana" count={1} isOpen={expandedSections.calendar} onToggle={() => handleToggleSection('calendar')}>
           <WeeklyTaskCalendar onCompleteTask={handleTaskCompletion} weeklyCompletedTasks={weeklyCompletedTasks} />
       </StageSection>
        
       {isAdmin && (
           <StageSection title="Proyección de Cosechas Disponibles" count={harvestProjectionsCount} isOpen={expandedSections.projection} onToggle={() => handleToggleSection('projection')}>
               <HarvestProjection />
           </StageSection>
       )}

      <StageSection title={`Lotes en Germinación/Enraizamiento`} count={cropsAndBatches.germinationBatches.length} isOpen={expandedSections.germination} onToggle={() => handleToggleSection('germination')}>
          {cropsAndBatches.germinationBatches.map(batch => <BatchRow key={batch.id} batch={batch} onMoveToPreVeg={(b) => savePlantBatch({...b, status: PlantBatchStatus.PRE_VEGETATION, availablePlantCount: b.rootedPlantCount || 0 })} isOpen={expandedRowId === batch.id} onToggle={() => handleToggleRow(batch.id)} />)}
      </StageSection>

      {STAGES.map(stage => (
        <StageSection key={stage} title={stage} count={cropsAndBatches.groupedCrops[stage]?.length || 0} isOpen={expandedSections[stage]} onToggle={() => handleToggleSection(stage)}>
            {cropsAndBatches.groupedCrops[stage]?.map(crop => (
                <CropRow key={crop.id} crop={crop} onAdvance={handleAdvanceStage} onLogEntry={handleLogEntryForCrop} isOpen={expandedRowId === crop.id} onToggle={() => handleToggleRow(crop.id)} />
            ))}
        </StageSection>
      ))}

    </div>
  );
};

export default GrowerAdminDashboard;