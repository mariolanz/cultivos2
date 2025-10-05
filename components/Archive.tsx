import React, { useMemo } from 'react';
import { useCrops, useGenetics, useConfirmation, useLocations } from '../context/AppProvider';
import Card from './ui/Card';
import { HarvestData } from '../types';
import { useNavigate } from 'react-router-dom';

const Archive: React.FC = () => {
    const { allCrops, restoreCrop, deleteCrop, setActiveCropId } = useCrops();
    const { genetics } = useGenetics();
    const { locations } = useLocations();
    const { showConfirmation } = useConfirmation();
    const navigate = useNavigate();

    const archivedCrops = allCrops.filter(crop => crop.isArchived);

    const getCropName = (crop: typeof archivedCrops[0]) => {
        return locations.find(l => l.id === crop.locationId)?.name || crop.id;
    }

    const handleRestore = (cropId: string, cropName: string) => {
        showConfirmation(`¿Estás seguro de que quieres restaurar el cultivo "${cropName}"? Volverá al panel principal.`, () => {
            restoreCrop(cropId);
        });
    };
    
    const handleDelete = (cropId: string, cropName: string) => {
         showConfirmation(`¿Estás seguro de que quieres eliminar PERMANENTEMENTE el cultivo archivado "${cropName}"? Esta acción no se puede deshacer.`, () => {
            deleteCrop(cropId);
        });
    }

    const handleViewHistory = (cropId: string) => {
        setActiveCropId(cropId);
        navigate('/reports');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Cultivos Archivados</h1>
            {archivedCrops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedCrops.sort((a,b) => new Date(b.harvestDate || 0).getTime() - new Date(a.harvestDate || 0).getTime()).map(crop => {
                        const genetic = genetics.find(g => g.id === crop.geneticsId);
                        const cropName = getCropName(crop);
                        return (
                            <Card key={crop.id}>
                                <h3 className="text-lg font-bold text-text-primary">{cropName}</h3>
                                <p className="text-sm text-text-secondary">{genetic?.name || 'N/A'}</p>
                                <div className="mt-2 text-xs text-muted space-y-1">
                                    <p>Cosechado el: {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</p>
                                    <p>Peso Seco: {(crop.harvestData as HarvestData | undefined)?.totalDryWeight || 0} g</p>
                                </div>
                                <div className="mt-4 flex justify-end items-center gap-4">
                                    <button onClick={() => handleViewHistory(crop.id)} className="text-xs text-blue-500 hover:text-blue-600 mr-auto">Ver Historial</button>
                                    <button onClick={() => handleDelete(crop.id, cropName)} className="text-xs text-red-500 hover:text-red-600">Eliminar</button>
                                    <button onClick={() => handleRestore(crop.id, cropName)} className="text-xs px-3 py-1 rounded bg-primary hover:bg-primary-dark text-white">Restaurar</button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <p className="text-center text-muted">No hay cultivos archivados.</p>
                </Card>
            )}
        </div>
    );
};

export default Archive;