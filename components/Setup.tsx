import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { usePlantBatches, useLocations, useCrops, useAuth, useGenetics } from '../context/AppProvider';
import { PlantBatchStatus, Crop, CropStage, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

const BatchSetup: React.FC = () => {
    const { plantBatches, savePlantBatch } = usePlantBatches();
    const { locations } = useLocations();
    const { genetics } = useGenetics();
    const { allCrops, saveCrop, setActiveCropId } = useCrops();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [selectedPlants, setSelectedPlants] = useState<{ [batchId: string]: number }>({});
    const [locationId, setLocationId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    
    const availableBatches = plantBatches.filter(b => b.status === PlantBatchStatus.PRE_VEGETATION && b.availablePlantCount > 0);

    const handlePlantSelectionChange = (batchId: string, count: number) => {
        const batch = availableBatches.find(b => b.id === batchId);
        if (!batch) return;
        const newCount = Math.max(0, Math.min(count, batch.availablePlantCount));
        setSelectedPlants(prev => ({ ...prev, [batchId]: newCount }));
    };
    
    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);
    
    const unoccupiedRooms = useMemo(() => {
        const occupiedRoomIds = new Set(allCrops.filter(c => !c.isArchived).map(c => c.locationId));
        return locations.filter(l => 
            l.parentId && 
            !occupiedRoomIds.has(l.id) &&
            (l.type === 'VEGETACION' || l.type === 'ciclo completo')
        );
    }, [locations, allCrops]);

    const getRoomsForLocation = (parentId: string) => {
        return unoccupiedRooms.filter(r => r.parentId === parentId);
    };

    const totalPlantsSelected = useMemo(() => {
        return Object.values(selectedPlants).reduce((sum: number, count: unknown) => sum + (Number(count) || 0), 0);
    }, [selectedPlants]);
    
    const mainGeneticsId = useMemo(() => {
        const firstSelectedBatchId = Object.keys(selectedPlants).find(id => Number(selectedPlants[id]) > 0);
        if (!firstSelectedBatchId) return '';
        const batch = plantBatches.find(b => b.id === firstSelectedBatchId);
        return batch?.geneticsId || '';
    }, [selectedPlants, plantBatches]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const plantCounts = Object.entries(selectedPlants)
            .filter(([, count]) => Number(count) > 0)
            .map(([batchId, count]) => ({ batchId, count: Number(count) }));

        if (plantCounts.length === 0 || !locationId || !startDate || !currentUser || !mainGeneticsId) {
            alert("Por favor, selecciona al menos una planta y completa todos los detalles del cultivo.");
            return;
        }

        const isRoomOccupied = allCrops.some(c => c.locationId === locationId && !c.isArchived);
        if (isRoomOccupied) {
            alert("La habitación seleccionada ya está en uso por otro cultivo activo. Por favor, elige otra.");
            return;
        }

        const newCrop: Crop = {
            id: `crop-${Date.now()}`,
            geneticsId: mainGeneticsId,
            locationId: locationId,
            ownerId: currentUser.id,
            cloningDate: new Date(startDate).toISOString(),
            vegDate: new Date(startDate).toISOString(),
            plantCounts: plantCounts,
            logEntries: [],
            lightHours: { veg: 18, flower: 12 },
        };

        plantCounts.forEach(({ batchId, count }) => {
            const batch = plantBatches.find(b => b.id === batchId);
            if (batch) {
                const newAvailableCount = batch.availablePlantCount - count;
                const newStatus = newAvailableCount > 0 ? PlantBatchStatus.IN_USE : PlantBatchStatus.DEPLETED;
                savePlantBatch({ 
                    ...batch, 
                    availablePlantCount: newAvailableCount,
                    status: newStatus
                });
            }
        });

        saveCrop(newCrop);
        setActiveCropId(newCrop.id);
        navigate('/');
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
                <h2 className="text-xl font-semibold text-primary pb-2 border-b border-border-color mb-4">1. Seleccionar Plantas de Lotes Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableBatches.length > 0 ? availableBatches.map(batch => {
                        const genetic = genetics.find(g => g.id === batch.geneticsId);
                        return (
                            <div key={batch.id} className="p-4 rounded-lg bg-gray-100 border border-border-color">
                                <p className="font-bold text-text-primary">{batch.id}</p>
                                <p className="text-sm text-text-secondary">{genetic?.name}</p>
                                <p className="text-xs text-muted">Disponibles: {batch.availablePlantCount}</p>
                                <div className="mt-2">
                                    <label htmlFor={`plants-${batch.id}`} className="block text-sm font-medium text-text-secondary mb-1">Cantidad a usar:</label>
                                    <input
                                        id={`plants-${batch.id}`}
                                        type="number"
                                        min="0"
                                        max={batch.availablePlantCount}
                                        value={selectedPlants[batch.id] || ''}
                                        onChange={e => handlePlantSelectionChange(batch.id, parseInt(e.target.value, 10) || 0)}
                                        className="w-full px-3 py-2 bg-white border border-border-color rounded-md"
                                    />
                                </div>
                            </div>
                        );
                    }) : <p className="text-muted col-span-full">No hay lotes en "Pre-vegetación" con plantas disponibles. Avanza un lote desde "Gestión de Lotes".</p>}
                </div>
            </div>
            <div>
                <h2 className="text-xl font-semibold text-primary pb-2 border-b border-border-color mb-4">2. Detalles del Cultivo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-2">Ubicación (será el nombre del cultivo)</label>
                        <select id="location" value={locationId} onChange={e => setLocationId(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required>
                            <option value="">Selecciona un cuarto de cultivo</option>
                            {parentLocations.map(parent => (
                                <optgroup key={parent.id} label={parent.name}>
                                    {getRoomsForLocation(parent.id).map(room => (
                                        <option key={room.id} value={room.id}>{room.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                         <p className="text-xs text-muted mt-1">Solo se muestran cuartos desocupados de vegetación y ciclo completo.</p>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary mb-2">Fecha de Inicio (Paso a Vegetación)</label>
                        <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required />
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border-color">
                <div className="text-lg font-bold text-text-primary">
                    Total de Plantas Seleccionadas: <span className="text-primary">{totalPlantsSelected}</span>
                </div>
                <button type="submit" className="py-2 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors disabled:opacity-50" disabled={totalPlantsSelected === 0}>
                    Iniciar Cultivo
                </button>
            </div>
        </form>
    );
};

const ManualSetup: React.FC = () => {
    const { locations } = useLocations();
    const { genetics } = useGenetics();
    const { allCrops, saveCrop, setActiveCropId } = useCrops();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [cropDetails, setCropDetails] = useState({
        locationId: '',
        cloningDate: '',
        vegDate: '',
        flowerDate: '',
    });

    const [geneticsSelection, setGeneticsSelection] = useState([{ id: `gen-sel-${Date.now()}`, geneticId: '', count: '' }]);

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCropDetails(prev => ({...prev, [name]: value}));
    };
    
    const handleGeneticsChange = (index: number, field: 'geneticId' | 'count', value: string) => {
        const newSelection = [...geneticsSelection];
        newSelection[index][field] = value;
        setGeneticsSelection(newSelection);
    };

    const addGeneticRow = () => {
        setGeneticsSelection([...geneticsSelection, { id: `gen-sel-${Date.now()}`, geneticId: '', count: '' }]);
    };

    const removeGeneticRow = (index: number) => {
        const newSelection = geneticsSelection.filter((_, i) => i !== index);
        setGeneticsSelection(newSelection);
    };

    const parentLocations = useMemo(() => locations.filter(l => !l.parentId), [locations]);

    const unoccupiedRooms = useMemo(() => {
        const occupiedRoomIds = new Set(allCrops.filter(c => !c.isArchived).map(c => c.locationId));
        return locations.filter(l => l.parentId && !occupiedRoomIds.has(l.id));
    }, [locations, allCrops]);

    const getRoomsForLocation = (parentId: string) => {
        return unoccupiedRooms.filter(r => r.parentId === parentId);
    };

    const availableGenetics = useMemo(() => {
        const selectedIds = new Set(geneticsSelection.map(s => s.geneticId));
        return genetics.filter(g => !selectedIds.has(g.id));
    }, [genetics, geneticsSelection]);
    
    const totalPlants = useMemo(() => {
        return geneticsSelection.reduce((sum, sel) => sum + (parseInt(sel.count, 10) || 0), 0);
    }, [geneticsSelection]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const hasEmptyGenetics = geneticsSelection.some(g => !g.geneticId || !g.count || parseInt(g.count) <= 0);

        if (!cropDetails.locationId || !cropDetails.cloningDate || hasEmptyGenetics || !currentUser) {
            alert("Por favor, completa todos los campos requeridos, incluyendo al menos una genética con su cantidad y la fecha de clonación.");
            return;
        }
        if (cropDetails.vegDate && new Date(cropDetails.vegDate) < new Date(cropDetails.cloningDate)) {
            alert("La fecha de vegetación debe ser posterior a la fecha de clonación.");
            return;
        }
        if (cropDetails.flowerDate && cropDetails.vegDate && new Date(cropDetails.flowerDate) < new Date(cropDetails.vegDate)) {
             alert("La fecha de floración debe ser posterior a la fecha de vegetación.");
            return;
        }

        const isRoomOccupied = allCrops.some(c => c.locationId === cropDetails.locationId && !c.isArchived);
        if (isRoomOccupied) {
            alert("La habitación seleccionada ya está en uso por otro cultivo activo. Por favor, elige otra.");
            return;
        }

        const plantCounts = geneticsSelection.map((sel, index) => {
            const genetic = genetics.find(g => g.id === sel.geneticId);
            const batchId = `manual-${genetic?.code || 'GEN'}-${Date.now() + index}`;
            return {
                batchId,
                count: parseInt(sel.count, 10)
            };
        });

        const newCrop: Crop = {
            id: `crop-${Date.now()}`,
            geneticsId: geneticsSelection[0].geneticId, // Use first genetic as primary ID
            locationId: cropDetails.locationId,
            ownerId: currentUser.id,
            cloningDate: new Date(cropDetails.cloningDate).toISOString(),
            vegDate: cropDetails.vegDate ? new Date(cropDetails.vegDate).toISOString() : undefined,
            flowerDate: cropDetails.flowerDate ? new Date(cropDetails.flowerDate).toISOString() : undefined,
            plantCounts: plantCounts,
            logEntries: [],
            lightHours: { veg: 18, flower: 12 },
        };

        saveCrop(newCrop);
        setActiveCropId(newCrop.id);
        navigate('/');
    };

    return (
         <form className="space-y-6" onSubmit={handleManualSubmit}>
            <div >
                <label className="block text-sm font-medium text-text-secondary mb-2">Ubicación (será el nombre del cultivo)</label>
                <select name="locationId" value={cropDetails.locationId} onChange={handleDetailChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required>
                    <option value="">Seleccionar cuarto...</option>
                    {parentLocations.map(parent => (
                        <optgroup key={parent.id} label={parent.name}>
                            {getRoomsForLocation(parent.id).map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <p className="text-xs text-muted mt-1">Solo se muestran cuartos desocupados.</p>
            </div>

             <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-primary mb-4">Genéticas y Cantidad de Plantas</h3>
                <div className="space-y-3">
                    {geneticsSelection.map((sel, index) => (
                        <div key={sel.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center p-2 bg-gray-100 rounded-md">
                            <select 
                                value={sel.geneticId} 
                                onChange={e => handleGeneticsChange(index, 'geneticId', e.target.value)} 
                                className="w-full px-3 py-2 bg-white border border-border-color rounded-md" 
                                required
                            >
                                <option value="">Seleccionar genética...</option>
                                {sel.geneticId && <option value={sel.geneticId}>{genetics.find(g => g.id === sel.geneticId)?.name}</option>}
                                {availableGenetics.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <input 
                                type="number" 
                                placeholder="Nº Plantas"
                                value={sel.count} 
                                onChange={e => handleGeneticsChange(index, 'count', e.target.value)} 
                                className="w-full sm:w-32 px-3 py-2 bg-white border border-border-color rounded-md" 
                                required 
                            />
                            <button 
                                type="button"
                                onClick={() => removeGeneticRow(index)} 
                                disabled={geneticsSelection.length === 1}
                                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                Quitar
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addGeneticRow} className="mt-4 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary font-bold rounded-md text-sm">
                    + Añadir Genética
                </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-primary mb-4">Fechas de Inicio de Etapas</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Fecha Clonación/Siembra *</label>
                        <input name="cloningDate" type="date" value={cropDetails.cloningDate} onChange={handleDetailChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Paso a Vegetación (opcional)</label>
                        <input name="vegDate" type="date" value={cropDetails.vegDate} onChange={handleDetailChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Paso a Floración (opcional)</label>
                        <input name="flowerDate" type="date" value={cropDetails.flowerDate} onChange={handleDetailChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" />
                    </div>
                 </div>
            </div>
             <div className="flex justify-between items-center pt-4 border-t border-border-color">
                 <div className="text-lg font-bold text-text-primary">
                    Total de Plantas: <span className="text-primary">{totalPlants}</span>
                </div>
                <button type="submit" className="py-2 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors">
                    Crear Cultivo
                </button>
            </div>
        </form>
    );
};

const Setup: React.FC = () => {
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);
    const [setupMode, setSetupMode] = useState<'batch' | 'manual'>('batch');

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Configurar Nuevo Cultivo</h1>
            <Card>
                 {isAdmin ? (
                    <div className="mb-6 border-b border-border-color">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setSetupMode('batch')}
                                className={`${ setupMode === 'batch' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                            >
                                Desde Lote (Para cultivos nuevos)
                            </button>
                            <button
                                onClick={() => setSetupMode('manual')}
                                className={`${ setupMode === 'manual' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-color'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                            >
                                Crear Manualmente (Para cultivos existentes)
                            </button>
                        </nav>
                    </div>
                 ) : null}

                {setupMode === 'batch' && <BatchSetup />}
                {isAdmin && setupMode === 'manual' && <ManualSetup />}
            </Card>
        </div>
    );
};

export default Setup;
