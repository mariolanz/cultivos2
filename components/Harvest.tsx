import React, { useState, useEffect, useMemo } from 'react';
import Card from './ui/Card';
import { useCrops, useLocations, usePlantBatches, useGenetics, useConfirmation } from '../context/AppProvider';
import { CropStage, HarvestData, Genetics, Crop } from '../types';
import { useNavigate } from 'react-router-dom';
import { getStageInfo } from '../services/nutritionService';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const HarvestSection: React.FC<{ title: string; onToggle: () => void; isOpen: boolean; children: React.ReactNode, isEnabled?: boolean }> = ({ title, onToggle, isOpen, children, isEnabled = true }) => (
    <div className={`border rounded-lg ${isEnabled ? 'bg-surface' : 'bg-gray-100 opacity-70'}`}>
        <header onClick={isEnabled ? onToggle : undefined} className={`flex justify-between items-center p-4 ${isEnabled ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed'}`}>
            <h2 className="text-xl font-bold text-text-secondary">{title}</h2>
            <svg className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </header>
        {isOpen && isEnabled && <div className="p-4 border-t border-border-color">{children}</div>}
    </div>
);


const Harvest: React.FC = () => {
    const { allCrops, saveCrop, archiveCrop, activeCrop, setActiveCropId } = useCrops();
    const { locations } = useLocations();
    const { plantBatches } = usePlantBatches();
    const { genetics } = useGenetics();
    const { showConfirmation } = useConfirmation();
    const navigate = useNavigate();

    const [selectedCropId, setSelectedCropId] = useState<string | null>(activeCrop?.id || null);

    const harvestableCrops = useMemo(() => {
        return allCrops.filter(crop => {
            if (crop.isArchived) return false;
            
            // A crop must have at least started flowering
            if (!crop.flowerDate) return false;

            const stageInfo = getStageInfo(crop);
            
            const isLateFlower = stageInfo.stage === CropStage.FLOWERING && stageInfo.weekInStage >= 9;
            const isHarvesting = stageInfo.stage === CropStage.DRYING_CURING;
            const isHarvested = stageInfo.stage === CropStage.HARVESTED;

            return isLateFlower || isHarvesting || isHarvested;
        });
    }, [allCrops]);

    useEffect(() => {
        if (!selectedCropId && harvestableCrops.length === 1) {
            setSelectedCropId(harvestableCrops[0].id);
        }
         // When activeCrop changes from dashboard, sync it
        if (activeCrop && harvestableCrops.some(c => c.id === activeCrop.id)) {
            setSelectedCropId(activeCrop.id);
        }
    }, [harvestableCrops, activeCrop, selectedCropId]);
    
    const selectedCrop = useMemo(() => allCrops.find(c => c.id === selectedCropId), [allCrops, selectedCropId]);

    type Weights = { wetWeight: string; dryBranchWeight: string; dryFlowerWeight: string; };
    const [weightsByGenetic, setWeightsByGenetic] = useState<Record<string, Weights>>({});
    const [curingNotes, setCuringNotes] = useState('');
    const [activeSection, setActiveSection] = useState('harvest');

    const cropGenetics = useMemo(() => {
        if (!selectedCrop) return [];
        const geneticIds = new Set<string>();
        selectedCrop.plantCounts.forEach(pc => {
            const batch = plantBatches.find(b => b.id === pc.batchId);
            if (batch && batch.geneticsId) {
                geneticIds.add(batch.geneticsId);
            } else {
                // Fallback: try to parse from batchId string
                const geneticCode = pc.batchId.split('-')[0];
                const genetic = genetics.find(g => g.code === geneticCode);
                if (genetic) {
                    geneticIds.add(genetic.id);
                }
            }
        });
        return Array.from(geneticIds).map(id => genetics.find(g => g.id === id)).filter((g): g is Genetics => !!g);
    }, [selectedCrop, plantBatches, genetics]);

    useEffect(() => {
        if (selectedCrop) {
            const initialWeights: Record<string, Weights> = {};
            cropGenetics.forEach(g => {
                const data = selectedCrop.harvestData?.geneticHarvests.find(gh => gh.geneticsId === g.id);
                initialWeights[g.id] = {
                    wetWeight: data?.wetWeight != null ? String(data.wetWeight) : '',
                    dryBranchWeight: data?.dryBranchWeight != null ? String(data.dryBranchWeight) : '',
                    dryFlowerWeight: data?.dryFlowerWeight != null ? String(data.dryFlowerWeight) : '',
                };
            });
            setWeightsByGenetic(initialWeights);
        } else {
            setWeightsByGenetic({}); // Clear form if no crop selected
        }
    }, [selectedCrop, cropGenetics]);

    const isDryingPhaseReady = useMemo(() => {
        if (!selectedCrop?.dryingCuringDate) return false;
        const dryingStartDate = new Date(selectedCrop.dryingCuringDate);
        const sevenDaysLater = new Date(dryingStartDate.getTime() + 7 * MS_PER_DAY);
        return new Date() >= sevenDaysLater;
    }, [selectedCrop]);
    
    const curingAssistant = useMemo(() => {
        if (!selectedCrop || !selectedCrop.dryingCuringDate) return null;
        
        const dryingDate = new Date(selectedCrop.dryingCuringDate);
        const now = new Date();
        const daysInCure = Math.floor((now.getTime() - dryingDate.getTime()) / (1000 * 3600 * 24));
        const lastBurp = selectedCrop.harvestData?.lastBurpDate ? new Date(selectedCrop.harvestData.lastBurpDate) : null;
        
        let recommendation = '';
        if (daysInCure <= 7) recommendation = 'Se recomienda hacer "burp" 2 veces al día.';
        else if (daysInCure <= 14) recommendation = 'Se recomienda hacer "burp" 1 vez al día.';
        else recommendation = 'Se recomienda hacer "burp" cada 2-3 días.';

        let nextBurp = 'N/A';
        if(lastBurp) {
            const nextBurpDate = new Date(lastBurp);
            if(daysInCure <= 7) nextBurpDate.setHours(lastBurp.getHours() + 12);
            else if (daysInCure <= 14) nextBurpDate.setDate(lastBurp.getDate() + 1);
            else nextBurpDate.setDate(lastBurp.getDate() + 2);
            nextBurp = nextBurpDate.toLocaleString();
        }

        return { recommendation, lastBurp: lastBurp?.toLocaleString() || 'Nunca', nextBurp };
    }, [selectedCrop]);

    const canFinalize = useMemo(() => {
        if (!selectedCrop || !selectedCrop.harvestData) return false;
        return selectedCrop.harvestData.geneticHarvests.some(gh => gh.trimmedFlowerWeight != null && gh.trimmedFlowerWeight > 0);
    }, [selectedCrop]);

    const handleWeightChange = (geneticsId: string, field: keyof Weights, value: string) => {
        setWeightsByGenetic(prev => ({
            ...prev,
            [geneticsId]: { ...(prev[geneticsId] || { wetWeight: '', dryBranchWeight: '', dryFlowerWeight: '' }), [field]: value }
        }));
    };

    const handleRegisterBurp = () => { 
        if (!selectedCrop) return;
        const now = new Date().toISOString();
        const updatedCrop = {
            ...selectedCrop,
            harvestData: {
                ...selectedCrop.harvestData,
                lastBurpDate: now,
                curingLog: [ ...(selectedCrop.harvestData?.curingLog || []), { date: now, notes: 'Burp realizado.' } ]
            } as HarvestData
        };
        saveCrop(updatedCrop);
    };
    
    const handleFinalizeAndArchive = () => {
        if (!selectedCrop) return;
        const cropName = locations.find(l => l.id === selectedCrop.locationId)?.name || selectedCrop.id;
        showConfirmation(`¿Estás seguro de que quieres finalizar y archivar el cultivo "${cropName}"? Esta acción marcará el cultivo como cosechado en la fecha actual y lo moverá al archivo.`, () => {
            archiveCrop(selectedCrop.id);
            setSelectedCropId(null);
            setActiveCropId(null);
            navigate('/archive');
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCrop) return;

        const newHarvestData: HarvestData = selectedCrop.harvestData ? JSON.parse(JSON.stringify(selectedCrop.harvestData)) : { geneticHarvests: [], totalWetWeight: 0, totalDryWeight: 0, totalTrimWeight: 0, curingLog: [] };
        newHarvestData.geneticHarvests = newHarvestData.geneticHarvests || [];

        cropGenetics.forEach(genetic => {
            if (!genetic || !genetic.id) return;
            const formWeights = weightsByGenetic[genetic.id] || { wetWeight: '', dryBranchWeight: '', dryFlowerWeight: '' };
            let geneticHarvest = newHarvestData.geneticHarvests.find(gh => gh.geneticsId === genetic.id);

            if (!geneticHarvest) {
                geneticHarvest = { geneticsId: genetic.id, wetWeight: 0 };
                newHarvestData.geneticHarvests.push(geneticHarvest);
            }
            const wetWeight = parseFloat(formWeights.wetWeight);
            const dryBranchWeight = parseFloat(formWeights.dryBranchWeight);
            const dryFlowerWeight = parseFloat(formWeights.dryFlowerWeight);
            geneticHarvest.wetWeight = !isNaN(wetWeight) ? wetWeight : (geneticHarvest.wetWeight || 0);
            geneticHarvest.dryBranchWeight = !isNaN(dryBranchWeight) ? dryBranchWeight : geneticHarvest.dryBranchWeight;
            geneticHarvest.dryFlowerWeight = !isNaN(dryFlowerWeight) ? dryFlowerWeight : geneticHarvest.dryFlowerWeight;
        });

        newHarvestData.totalWetWeight = newHarvestData.geneticHarvests.reduce((sum, gh) => sum + (gh.wetWeight || 0), 0);
        newHarvestData.totalDryWeight = newHarvestData.geneticHarvests.reduce((sum, gh) => sum + (gh.dryFlowerWeight || 0), 0);

        if (curingNotes.trim()) {
            newHarvestData.curingLog.push({ date: new Date().toISOString(), notes: curingNotes.trim() });
        }

        const updatedCrop: Crop = {
            ...selectedCrop,
            harvestData: newHarvestData,
            dryingCuringDate: selectedCrop.dryingCuringDate || (newHarvestData.totalWetWeight > 0 ? new Date().toISOString() : undefined),
        };

        saveCrop(updatedCrop);
        setCuringNotes('');
        alert("Datos de cosecha guardados.");
    };

    if (harvestableCrops.length === 0) {
        return <Card><p className="text-center text-text-secondary">No hay cultivos listos para cosechar (en Floración o etapas posteriores).</p></Card>;
    }

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-text-primary">Registro de Cosecha</h1>
                {harvestableCrops.length > 1 && (
                     <select 
                        value={selectedCropId || ''} 
                        onChange={e => { setSelectedCropId(e.target.value); setActiveCropId(e.target.value); }} 
                        className="w-full sm:w-64 px-3 py-2 bg-surface border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Seleccionar un cultivo...</option>
                        {harvestableCrops.map(crop => (
                            <option key={crop.id} value={crop.id}>
                                {locations.find(l => l.id === crop.locationId)?.name || crop.id}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {!selectedCrop ? (
                 <Card><p className="text-center text-text-secondary">Por favor, selecciona un cultivo de la lista para continuar.</p></Card>
            ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                     <HarvestSection title="Paso 1: Cosecha (Peso Húmedo)" isOpen={activeSection === 'harvest'} onToggle={() => setActiveSection(activeSection === 'harvest' ? '' : 'harvest')}>
                        <div className="space-y-4">
                            {cropGenetics.map(g => g && (
                                <div key={g.id} className="p-3 bg-gray-100 rounded-lg">
                                    <h3 className="font-bold text-text-primary mb-2">{g.name}</h3>
                                    <div>
                                        <label className="block text-sm text-text-secondary">Peso Húmedo (g)</label>
                                        <input type="number" value={weightsByGenetic[g.id]?.wetWeight || ''} onChange={e => handleWeightChange(g.id, 'wetWeight', e.target.value)} className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </HarvestSection>

                    <HarvestSection title="Paso 2: Secado (Pesos Secos)" isOpen={activeSection === 'drying'} onToggle={() => setActiveSection(activeSection === 'drying' ? '' : 'drying')} isEnabled={!!selectedCrop.dryingCuringDate}>
                        {!!selectedCrop.dryingCuringDate && !isDryingPhaseReady && <p className="text-center text-sm text-accent p-4">Se recomienda esperar al menos 7 días para registrar el peso seco.</p>}
                        <div className="space-y-4">
                            {cropGenetics.map(g => g && (
                                <div key={g.id} className="p-3 bg-gray-100 rounded-lg">
                                    <h3 className="font-bold text-text-primary mb-2">{g.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-text-secondary">Peso de Ramas Secas (g)</label>
                                            <input type="number" step="0.1" value={weightsByGenetic[g.id]?.dryBranchWeight || ''} onChange={e => handleWeightChange(g.id, 'dryBranchWeight', e.target.value)} className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-text-secondary">Peso de Flor Seca (en bolsa) (g)</label>
                                            <input type="number" step="0.1" value={weightsByGenetic[g.id]?.dryFlowerWeight || ''} onChange={e => handleWeightChange(g.id, 'dryFlowerWeight', e.target.value)} className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </HarvestSection>

                    <HarvestSection title="Paso 3: Trimeado (Resumen)" isOpen={activeSection === 'trimming'} onToggle={() => setActiveSection(activeSection === 'trimming' ? '' : 'trimming')}>
                        <p className="text-sm text-muted mb-4">Estos datos se actualizan desde el Módulo de Trimeado.</p>
                        <div className="space-y-4">
                            {cropGenetics.map(g => g && (
                                <div key={g.id} className="p-3 bg-gray-100 rounded-lg">
                                    <h3 className="font-bold text-text-primary mb-2">{g.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-text-secondary">Peso Flor Trimeada (g)</p>
                                            <p className="font-bold text-lg text-text-primary">{selectedCrop.harvestData?.geneticHarvests.find(gh => gh.geneticsId === g.id)?.trimmedFlowerWeight?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-text-secondary">Peso de Desperdicio (g)</p>
                                            <p className="font-bold text-lg text-text-primary">{selectedCrop.harvestData?.geneticHarvests.find(gh => gh.geneticsId === g.id)?.trimWasteWeight?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </HarvestSection>

                    <HarvestSection title="Paso 4: Curado (Asistente y Notas)" isOpen={activeSection === 'curing'} onToggle={() => setActiveSection(activeSection === 'curing' ? '' : 'curing')} isEnabled={!!selectedCrop.dryingCuringDate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-text-primary">Asistente Inteligente</h3>
                                {curingAssistant ? (
                                    <div className="p-3 bg-gray-100 rounded-lg text-sm space-y-2">
                                        <p><strong>Recomendación:</strong> {curingAssistant.recommendation}</p>
                                        <p><strong>Último Burp:</strong> {curingAssistant.lastBurp}</p>
                                        <p><strong>Siguiente Burp (est.):</strong> {curingAssistant.nextBurp}</p>
                                        <button type="button" onClick={handleRegisterBurp} className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md">Registrar Burp Ahora</button>
                                    </div>
                                ) : null }
                                <div>
                                    <label className="block text-sm text-text-secondary">Nueva Nota de Curado</label>
                                    <textarea value={curingNotes} onChange={e => setCuringNotes(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 bg-white border border-border-color rounded-md" placeholder="Añade notas de curado aquí (ej. 'Humedad en frasco al 65%')"></textarea>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-md font-semibold text-text-primary">Historial de Curado</h3>
                                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto bg-gray-50 p-2 rounded">
                                    {selectedCrop.harvestData?.curingLog && selectedCrop.harvestData.curingLog.length > 0 ? (
                                        selectedCrop.harvestData.curingLog.slice().reverse().map(log => (
                                            <div key={log.date} className="text-sm p-2 bg-gray-100 rounded">
                                                <span className="font-bold text-text-secondary">{new Date(log.date).toLocaleString()}: </span>
                                                <span className="text-text-primary">{log.notes}</span>
                                            </div>
                                        ))
                                    ) : <p className="text-muted">Aún no hay notas de curado.</p>}
                                </div>
                            </div>
                        </div>
                    </HarvestSection>

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 mt-4 border-t border-border-color">
                        <button 
                            type="button"
                            onClick={handleFinalizeAndArchive}
                            disabled={!canFinalize}
                            className="w-full sm:w-auto py-2 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Finalizar y Archivar Cultivo
                        </button>
                        <button type="submit" className="w-full sm:w-auto py-2 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Harvest;