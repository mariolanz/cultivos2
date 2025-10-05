
import React from 'react';
import Card from './ui/Card';
import { useMaintenanceLogs, useLocations } from '../context/AppProvider';

const MaintenanceReports: React.FC = () => {
    const { maintenanceLogs } = useMaintenanceLogs();
    const { locations } = useLocations();

    if (maintenanceLogs.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6 text-text-primary">Reportes de Mantenimiento</h1>
                <Card>
                    <p className="text-center text-muted">No hay registros de mantenimiento para mostrar.</p>
                </Card>
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Reportes de Mantenimiento</h1>
            <Card>
                <h2 className="text-xl font-semibold text-primary mb-4">Historial de Tareas Completadas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Fecha</th>
                                <th scope="col" className="px-6 py-3">Tarea</th>
                                <th scope="col" className="px-6 py-3">Realizada Por</th>
                                <th scope="col" className="px-6 py-3">Ubicación</th>
                                <th scope="col" className="px-6 py-3">Notas</th>
                                <th scope="col" className="px-6 py-3">Foto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maintenanceLogs.slice().reverse().map(log => {
                                const location = locations.find(l => l.id === log.locationId);
                                return (
                                    <tr key={log.id} className="bg-white border-b border-border-color hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(log.completedAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-medium text-text-primary">{log.taskTitle}</td>
                                        <td className="px-6 py-4">{log.userUsername}</td>
                                        <td className="px-6 py-4">{location?.name || log.locationId}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={log.notes}>{log.notes}</td>
                                        <td className="px-6 py-4">
                                            {log.photoEvidence ? (
                                                <a href={`data:image/jpeg;base64,${log.photoEvidence}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver Foto</a>
                                            ) : 'No'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default MaintenanceReports;
