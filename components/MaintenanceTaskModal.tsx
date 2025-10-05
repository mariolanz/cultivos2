import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { Task, InventoryItem, Equipment } from '../types';
import CameraModal from './ui/CameraModal';
import { useInventory, useEquipment } from '../context/AppProvider';

interface MaintenanceTaskModalProps {
    task: Task;
    onClose: () => void;
    onSave: (task: Task, notes: string, photo: string, partsUsed: { inventoryItemId: string; quantity: number }[], equipmentId?: string) => void;
}

const MaintenanceTaskModal: React.FC<MaintenanceTaskModalProps> = ({ task, onClose, onSave }) => {
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState<string | null>(null); // base64 string
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
    const { inventory } = useInventory();
    const { equipment } = useEquipment();
    
    const handleCapture = (dataUrl: string) => {
        const base64String = dataUrl.split(',')[1];
        setPhoto(base64String);
        setIsCameraOpen(false);
    };
    
    const handleSave = () => {
        if (!photo) {
            alert("Es obligatorio tomar una foto como evidencia.");
            return;
        }
        onSave(task, notes, photo, task.requiredParts || [], selectedEquipmentId || undefined);
    };
    
    const getPartName = (inventoryItemId: string) => {
        const item = inventory.find(i => i.id.startsWith(inventoryItemId));
        return item?.name || inventoryItemId;
    };

    const relevantEquipment = useMemo(() => {
        return equipment.filter(e => e.locationId === task.locationId && e.category === task.category);
    }, [equipment, task]);

    return (
        <>
            <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg relative max-h-[90vh] flex flex-col">
                     <button onClick={onClose} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-2xl" aria-label="Cerrar">&times;</button>
                     <h3 className="text-lg font-bold mb-4 text-primary">Registrar Tarea de Mantenimiento</h3>
                     <div className="space-y-4 overflow-y-auto pr-2">
                        <div>
                            <p className="text-sm text-text-secondary">Tarea</p>
                            <p className="font-semibold text-text-primary">{task.title}</p>
                        </div>
                        
                        {task.sop && (
                             <div className="p-3 bg-gray-100 rounded-lg border border-border-color">
                                <h4 className="font-semibold text-primary mb-2">{task.sop.title}</h4>
                                <ul className="list-decimal list-inside text-sm text-text-primary space-y-1">
                                    {task.sop.steps.map((step, index) => <li key={index}>{step}</li>)}
                                </ul>
                            </div>
                        )}

                        {(task.requiredTools || task.requiredParts) && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-text-secondary mb-2">Checklist de Preparación</h4>
                                {task.requiredTools && task.requiredTools.length > 0 && (
                                    <div>
                                        <p className="text-sm text-text-secondary">Herramientas Necesarias:</p>
                                        <ul className="list-disc list-inside text-sm text-text-primary">
                                            {task.requiredTools.map(tool => <li key={tool}>{tool}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {task.requiredParts && task.requiredParts.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-text-secondary">Insumos/Refacciones:</p>
                                        <ul className="list-disc list-inside text-sm text-text-primary">
                                            {task.requiredParts.map(part => <li key={part.inventoryItemId}>{getPartName(part.inventoryItemId)} (Cant: {part.quantity})</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {relevantEquipment.length > 0 && (
                             <div>
                                <label htmlFor="equipment" className="block text-sm font-medium text-text-secondary mb-2">Equipo Asociado (Opcional)</label>
                                <select id="equipment" value={selectedEquipmentId} onChange={e => setSelectedEquipmentId(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md">
                                    <option value="">Seleccionar equipo...</option>
                                    {relevantEquipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div>
                             <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-2">Notas de Mantenimiento</label>
                            <textarea
                                id="notes"
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Describe el trabajo realizado..."
                                className="w-full px-3 py-2 bg-white border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Evidencia Fotográfica (Obligatoria)</label>
                            <button type="button" onClick={() => setIsCameraOpen(true)} className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary font-bold rounded-md transition-colors">
                                Tomar Foto
                            </button>
                             {photo && (
                                <div className="mt-4 relative">
                                    <img src={`data:image/jpeg;base64,${photo}`} alt="Evidencia de mantenimiento" className="rounded-lg max-h-40 w-auto mx-auto" />
                                     <button type="button" onClick={() => setPhoto(null)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">&times;</button>
                                </div>
                             )}
                        </div>
                         <div className="flex justify-end gap-4 pt-4 flex-shrink-0">
                            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleSave} disabled={!photo} className="px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white disabled:opacity-50">Guardar Registro</button>
                        </div>
                     </div>
                </Card>
            </div>
        </>
    );
};

export default MaintenanceTaskModal;
