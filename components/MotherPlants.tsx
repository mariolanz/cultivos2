
import React, { useState, useMemo, useRef } from 'react';
import Card from './ui/Card';
import { useMotherPlants, useGenetics, useLocations, useConfirmation, useAuth } from '../context/AppProvider';
import { MotherPlant, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

const MotherPlants: React.FC = () => {
    const { motherPlants, saveMotherPlant, archiveMotherPlant, restoreMotherPlant, deleteMotherPlant, setActiveMotherPlantId } = useMotherPlants();
    const { genetics } = useGenetics();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const formRef = useRef<HTMLDivElement>(null);

    const [showArchived, setShowArchived] = useState(false);

    const initialFormState = {
        name: '', geneticsId: '', locationId: '',
        sowingDate: new Date().toISOString().split('T')[0]
    };
    const [formState, setFormState] = useState(initialFormState);
    const [editingPlant, setEditingPlant] = useState<MotherPlant | null>(null);

    const motherRooms = useMemo(() => locations.filter(l => l.name.toLowerCase().includes('madre')), [locations]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name || !formState.geneticsId || !formState.locationId) {
            alert("Completa todos los campos.");
            return;
        }

        const plant: MotherPlant = {
            id: editingPlant?.id || `mp-${Date.now()}`,
            name: formState.name,
            geneticsId: formState.geneticsId,
            locationId: formState.locationId,
            sowingDate: new Date(formState.sowingDate).toISOString(),
            cloneCount: editingPlant?.cloneCount || 0,
            logEntries: editingPlant?.logEntries || []
        };
        saveMotherPlant(plant);
        handleCancelEdit();
    };

    const handleEdit = (plant: MotherPlant) => {
        setEditingPlant(plant);
        setFormState({
            name: plant.name,
            geneticsId: plant.geneticsId,
            locationId: plant.locationId,
            sowingDate: new Date(plant.sowingDate).toISOString().split('T')[0]
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingPlant(null);
        setFormState(initialFormState);
    };
    
    const handleDelete = (plant: MotherPlant) => {
        showConfirmation(`¿Seguro que quieres eliminar PERMANENTEMENTE la planta madre "${plant.name}"? Esta acción es irreversible.`, () => deleteMotherPlant(plant.id));
    };

    const handleArchive = (plant: MotherPlant) => {
        showConfirmation(`¿Seguro que quieres archivar la planta madre "${plant.name}"? No aparecerá como fuente de clones.`, () => archiveMotherPlant(plant.id));
    };

    const handleRestore = (plantId: string) => {
        restoreMotherPlant(plantId);
    };

    const handleLogEntry = (plantId: string) => {
        setActiveMotherPlantId(plantId);
        navigate('/log');
    };
    
    const visiblePlants = useMemo(() => {
        const filteredByArchiveStatus = motherPlants.filter(p => !!p.isArchived === showArchived);

        if (!currentUser || currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return filteredByArchiveStatus;
        }
        if (!currentUser.locationId) return [];

        const userMainLocationId = currentUser.locationId;

        return filteredByArchiveStatus.filter(plant => {
            const room = locations.find(l => l.id === plant.locationId);
            return room?.parentId === userMainLocationId;
        });
    }, [motherPlants, showArchived, currentUser, locations]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Gestión de Plantas Madre</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1" ref={formRef}>
                    <Card>
                        <h2 className="text-xl font-semibold text-primary mb-4">{editingPlant ? 'Editar Planta Madre' : 'Añadir Planta Madre'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="text-sm">Nombre</label><input type="text" value={formState.name} onChange={e=>setFormState(p=>({...p, name: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded" placeholder="Ej: OG Kush Madre #1" required/></div>
                            <div><label className="text-sm">Genética</label><select value={formState.geneticsId} onChange={e=>setFormState(p=>({...p, geneticsId: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded" required><option value="">Seleccionar...</option>{genetics.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                            <div><label className="text-sm">Ubicación</label><select value={formState.locationId} onChange={e=>setFormState(p=>({...p, locationId: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded" required><option value="">Seleccionar...</option>{motherRooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                            <div><label className="text-sm">Fecha de Siembra</label><input type="date" value={formState.sowingDate} onChange={e=>setFormState(p=>({...p, sowingDate: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded" required/></div>
                            <div className="flex gap-2 pt-2">
                                {editingPlant && <button type="button" onClick={handleCancelEdit} className="w-full py-2 px-4 bg-gray-200 rounded">Cancelar</button>}
                                <button type="submit" className="w-full py-2 px-4 bg-primary text-white rounded font-bold">{editingPlant ? 'Guardar' : 'Crear'}</button>
                            </div>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-primary">{showArchived ? 'Plantas Archivadas' : 'Plantas Madre Activas'}</h2>
                            <button onClick={() => setShowArchived(!showArchived)} className="text-sm text-primary hover:underline">
                                {showArchived ? 'Ver Activas' : 'Ver Archivadas'}
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
                            {visiblePlants.map(plant => {
                                const genetic = genetics.find(g => g.id === plant.geneticsId);
                                const location = locations.find(l => l.id === plant.locationId);
                                const age = Math.floor((new Date().getTime() - new Date(plant.sowingDate).getTime()) / (1000*60*60*24));
                                return (
                                    <div key={plant.id} className="p-3 bg-gray-50 rounded-lg border border-border-color">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-text-primary">{plant.name}</p>
                                                <p className="text-sm text-text-secondary">{genetic?.name}</p>
                                                <p className="text-xs text-muted">{location?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-text-primary">{age} días</p>
                                                <p className="text-xs text-text-secondary">{plant.cloneCount} clones</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border-color">
                                            {!plant.isArchived ? (
                                                <>
                                                    <button onClick={() => handleLogEntry(plant.id)} className="text-xs font-bold py-1 px-2 rounded bg-gray-200 hover:bg-gray-300">Bitácora</button>
                                                    <button onClick={() => handleEdit(plant)} className="text-xs text-primary hover:underline">Editar</button>
                                                    <button onClick={() => handleArchive(plant)} className="text-xs text-yellow-600 hover:underline">Archivar</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleDelete(plant)} className="text-xs text-red-500 hover:underline">Eliminar Perm.</button>
                                                    <button onClick={() => handleRestore(plant.id)} className="text-xs font-bold py-1 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white">Restaurar</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                             {visiblePlants.length === 0 && (
                                <p className="text-center text-muted py-8">No hay plantas madre en esta vista.</p>
                             )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MotherPlants;
