
import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { Task, UserRole } from '../types';
import { useCrops, useAuth, useLocations } from '../context/AppProvider';

interface SelectCropForTaskModalProps {
    task: Task;
    onClose: () => void;
    onConfirm: (cropId: string) => void;
}

const SelectCropForTaskModal: React.FC<SelectCropForTaskModalProps> = ({ task, onClose, onConfirm }) => {
    const [selectedCropId, setSelectedCropId] = useState('');
    const { allCrops } = useCrops();
    const { currentUser } = useAuth();
    const { locations } = useLocations();

    const availableCrops = useMemo(() => {
        const nonArchived = allCrops.filter(c => !c.isArchived);
        if (!currentUser) return [];

        if (currentUser.roles.includes(UserRole.ADMIN) || currentUser.locationId === 'TODAS') {
            return nonArchived;
        }
        
        const userMainLocationId = currentUser.locationId;
        return nonArchived.filter(crop => {
            const room = locations.find(l => l.id === crop.locationId);
            return room?.parentId === userMainLocationId;
        });
    }, [allCrops, currentUser, locations]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCropId) {
            onConfirm(selectedCropId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-lg font-bold mb-2 text-text-primary">Completar Tarea</h3>
                    <p className="text-text-secondary mb-4">¿En qué cultivo realizaste la tarea <span className="font-semibold">"{task.title}"</span>?</p>
                    <select
                        value={selectedCropId}
                        onChange={(e) => setSelectedCropId(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md mb-6"
                        required
                    >
                        <option value="">Selecciona un cultivo...</option>
                        {availableCrops.map(crop => (
                            <option key={crop.id} value={crop.id}>
                                {locations.find(l => l.id === crop.locationId)?.name || crop.id}
                            </option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-text-primary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={!selectedCropId} className="px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white disabled:opacity-50">
                            Confirmar
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default SelectCropForTaskModal;
