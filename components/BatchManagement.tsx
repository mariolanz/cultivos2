
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from './ui/Card';
import { usePlantBatches, useGenetics, useConfirmation, useAuth, useLocations, useCrops, useMotherPlants } from '../context/AppProvider';
import { PlantBatch, PlantBatchStatus, UserRole } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

const getInitials = (username: string = '') => username.substring(0, 2).toUpperCase();

const BatchManagement: React.FC = () => {
    const { plantBatches, savePlantBatch, deletePlantBatch, setActiveBatchId } = usePlantBatches();
    const { setActiveCropId } = useCrops();
    const { motherPlants } = useMotherPlants();
    const { genetics } = useGenetics();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();
    const { currentUser } = useAuth();
    const { state } = useLocation();
    const navigate = useNavigate();
    const formRef = useRef<HTMLDivElement>(null);

    const [showDepleted, setShowDepleted] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const initialFormState = {
        geneticsId: '', initialPlantCount: '', rootedPlantCount: '',
        type: 'clone' as 'clone' | 'seed',
        creationDate: new Date().toISOString().split('T')[0],
        sourceLocationId: ''
    };

    const [formState, setFormState] = useState(initialFormState);
    const [editingBatch, setEditingBatch] = useState<PlantBatch | null>(null);

    const generatedId = useMemo(() => {
        if (!formState.geneticsId || !formState.creationDate || !currentUser) {
            return 'Completa los campos para generar ID';
        }
        const selectedGenetic = genetics.find(g => g.id === formState.geneticsId);
        if (!selectedGenetic) return 'Genética inválida';

        const [year, month, day] = formState.creationDate.split('-').map(Number);
        if(!year || !month || !day) return 'Fecha inválida';

        const date = new Date(year, month - 1, day);
        const dateCode = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

        return `${selectedGenetic.code}-${dateCode}-${formState.type === 'clone' ? 'C' : 'S'}-${getInitials(currentUser.username)}`;
    }, [formState.geneticsId, formState.creationDate, formState.type, currentUser, genetics]);

    const sourceRooms = useMemo(() => {
        return locations.filter(l => l.type === 'VEGETACION' || l.type === 'ciclo completo');
    }, [locations]);

    const handleEditClick = (batch: PlantBatch) => {
        setEditingBatch(batch);
        setIsFormVisible(true);
        setFormState({
            geneticsId: batch.geneticsId,
            initialPlantCount: batch.initialPlantCount.toString(),
            rootedPlantCount: batch.rootedPlantCount?.toString() || '',
            type: batch.type,
            creationDate: new Date(batch.creationDate).toISOString().split('T')[0],
            sourceLocationId: batch.sourceLocationId
        });
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    
    const handleLogEntry = (batchId: string) => {
        setActiveCropId(null);
        setActiveBatchId(batchId);
        navigate('/log');
    };

    useEffect(() => {
        if (state?.editingBatchId) {
            const batchToEdit = plantBatches.find(b => b.id === state.editingBatchId);
            if (batchToEdit) handleEditClick(batchToEdit);
        }
    }, [state, plantBatches]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCancelEdit = () => {
        setEditingBatch(null);
        setFormState(initialFormState);
        setIsFormVisible(false);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.geneticsId || !formState.initialPlantCount || (formState.type === 'clone' && !formState.sourceLocationId) || !currentUser) {
            alert("Por favor, completa la genética, el número de plantas y la fuente para los clones.");
            return;
        }
        
        const selectedGenetic = genetics.find(g => g.id === formState.geneticsId);
        if(!selectedGenetic) return;
        
        const date = new Date(formState.creationDate);
        
        const batchId = editingBatch?.id || generatedId;
        const batchName = `${selectedGenetic.name} ${formState.type === 'clone' ? 'Clones' : 'Semillas'} ${formState.creationDate}`;
        
        const initialCount = parseInt(formState.initialPlantCount, 10);
        const rootedCount = formState.rootedPlantCount ? parseInt(formState.rootedPlantCount, 10) : undefined;
        
        const sourceIsMotherPlant = motherPlants.some(p => p.id === formState.sourceLocationId);

        const newBatch: PlantBatch = {
            id: batchId, name: batchName,
            geneticsId: formState.geneticsId, creationDate: date.toISOString(),
            initialPlantCount: initialCount, rootedPlantCount: rootedCount,
            availablePlantCount: editingBatch?.availablePlantCount ?? 0,
            sourceLocationId: formState.sourceLocationId,
            type: formState.type, status: editingBatch?.status || PlantBatchStatus.GERMINATION_ROOTING,
            creatorId: editingBatch?.creatorId || currentUser.id, logEntries: editingBatch?.logEntries || [],
        };
        
        savePlantBatch(newBatch, sourceIsMotherPlant ? formState.sourceLocationId : undefined);
        handleCancelEdit();
    };
    
    const handleDelete = (batch: PlantBatch) => {
        showConfirmation(`¿Seguro que quieres eliminar el lote "${batch.name}"?`, () => {
            const success = deletePlantBatch(batch.id);
            if(success && editingBatch?.id === batch.id){
                handleCancelEdit();
            }
        });
    }

    const handleMoveToPreVeg = (batch: PlantBatch) => {
        if (!batch.rootedPlantCount || batch.rootedPlantCount <= 0) {
            alert("Primero debes registrar el número de plantas enraizadas.");
            return;
        }
        showConfirmation(`¿Mover este lote a Pre-Vegetación con ${batch.rootedPlantCount} plantas disponibles?`, () => {
            savePlantBatch({
                ...batch, status: PlantBatchStatus.PRE_VEGETATION,
                availablePlantCount: batch.rootedPlantCount || 0
            });
        });
    };

    const visibleBatches = useMemo(() => {
        let filteredBatches = plantBatches;

        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            // Admin sees all
        } else if (currentUser.locationId) {
            filteredBatches = plantBatches.filter(batch => 
                batch.sourceLocationId === currentUser.locationId || batch.creatorId === currentUser.id
            );
        } else {
             filteredBatches = [];
        }

        if (!showDepleted) {
            return filteredBatches.filter(b => b.status !== PlantBatchStatus.DEPLETED);
        }

        return filteredBatches;
    }, [plantBatches, currentUser, showDepleted]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Gestión de Lotes de Plantas</h1>
            <div className="space-y-8">
                <div ref={formRef}>
                     <Card>
                        {!isFormVisible ? (
                             <button onClick={() => setIsFormVisible(true)} className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">
                                + Crear Nuevo Lote
                            </button>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-primary mb-4">{editingBatch ? `Editar Lote: ${editingBatch.name}` : 'Crear Nuevo Lote'}</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2">Genética</label>
                                            <select name="geneticsId" value={formState.geneticsId} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required disabled={!!editingBatch}>
                                                <option value="">Seleccionar genética...</option>
                                                {genetics.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2">Tipo</label>
                                            <select name="type" value={formState.type} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" disabled={!!editingBatch}>
                                                <option value="clone">Clon</option>
                                                <option value="seed">Semilla</option>
                                            </select>
                                        </div>
                                        {formState.type === 'clone' && (
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">Fuente de Clones</label>
                                                <select name="sourceLocationId" value={formState.sourceLocationId} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required={formState.type === 'clone'} disabled={!!editingBatch}>
                                                    <option value="">Seleccionar fuente...</option>
                                                    <optgroup label="Plantas Madre">
                                                        {motherPlants.filter(p=>!p.isArchived).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </optgroup>
                                                    <optgroup label="Cuartos">
                                                        {sourceRooms.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                    </optgroup>
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2">Nº de Semillas/Clones Iniciales</label>
                                            <input type="number" name="initialPlantCount" value={formState.initialPlantCount} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required disabled={!!editingBatch} />
                                        </div>
                                        {editingBatch && (
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2">Nº de Plantas Enraizadas</label>
                                            <input type="number" name="rootedPlantCount" value={formState.rootedPlantCount} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" placeholder="Añadir al terminar germinación" />
                                        </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2">Fecha de Creación</label>
                                            <input type="date" name="creationDate" value={formState.creationDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required disabled={!!editingBatch} />
                                        </div>
                                    </div>
                                    
                                    {!editingBatch && (
                                    <div className="pt-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-2">ID de Lote Generado</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={generatedId} 
                                                readOnly 
                                                className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md text-text-secondary font-mono" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => navigator.clipboard.writeText(generatedId)}
                                                title="Copiar ID"
                                                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md text-text-secondary"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <button type="button" onClick={handleCancelEdit} className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary font-bold rounded-md">Cancelar</button>
                                        <button type="submit" className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">{editingBatch ? 'Guardar Cambios' : 'Crear Lote'}</button>
                                    </div>
                                </form>
                            </>
                        )}
                    </Card>
                </div>
                <div>
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-primary">Lotes Existentes</h2>
                            <label className="flex items-center text-sm text-text-secondary">
                                <input type="checkbox" checked={showDepleted} onChange={e => setShowDepleted(e.target.checked)} className="form-checkbox h-4 w-4 bg-gray-100 border-gray-300 text-primary focus:ring-primary rounded" />
                                <span className="ml-2">Mostrar lotes agotados</span>
                            </label>
                        </div>
                        <div className="overflow-x-auto max-h-[70vh]">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs text-text-secondary uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nombre / Genética</th>
                                        <th scope="col" className="px-6 py-3">Plantas (Ini/Enr/Disp)</th>
                                        <th scope="col" className="px-6 py-3">Estado</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleBatches.map(batch => {
                                        const genetic = genetics.find(g => g.id === batch.geneticsId);
                                        return (
                                        <tr key={batch.id} className="bg-white border-b border-border-color hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-text-primary">
                                                {batch.name}
                                                <span className="block text-xs text-text-secondary">{genetic?.name}</span>
                                            </td>
                                            <td className="px-6 py-4">{`${batch.initialPlantCount} / ${batch.rootedPlantCount ?? 'N/A'} / ${batch.availablePlantCount}`}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">{batch.status}</span></td>
                                            <td className="px-6 py-4 flex flex-col gap-2 items-start">
                                                <div className="flex gap-2 flex-wrap">
                                                    <button onClick={() => handleEditClick(batch)} className="text-primary hover:underline text-xs">Editar</button>
                                                    <button onClick={() => handleDelete(batch)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                                                </div>
                                                {batch.status === PlantBatchStatus.GERMINATION_ROOTING && (
                                                    <button onClick={() => handleLogEntry(batch.id)} className="text-xs font-bold py-1 px-2 rounded bg-gray-200 hover:bg-gray-300 text-text-primary">Registrar Cuidados</button>
                                                )}
                                                {batch.status === PlantBatchStatus.GERMINATION_ROOTING && batch.rootedPlantCount && batch.rootedPlantCount > 0 && (
                                                    <button onClick={() => handleMoveToPreVeg(batch)} className="text-xs font-bold py-1 px-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Mover a Pre-Veg</button>
                                                )}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BatchManagement;
