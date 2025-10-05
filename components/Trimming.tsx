import React, { useState, useMemo } from 'react';
import { useAuth, useCrops, useTrimming, useLocations, useGenetics } from '../context/AppProvider';
import Card from './ui/Card';
import { TrimmingSession } from '../types';

const Trimming: React.FC = () => {
    const { currentUser } = useAuth();
    const { allCrops } = useCrops();
    const { locations } = useLocations();
    const { genetics } = useGenetics();
    const { saveTrimmingSession } = useTrimming();
    
    const initialFormState = { cropId: '', geneticsId: '', trimmedWeight: '', trimWasteWeight: '' };
    const [form, setForm] = useState(initialFormState);

    const availableCrops = useMemo(() => {
        return allCrops.filter(c => !c.isArchived && c.harvestData && c.harvestData.geneticHarvests.length > 0);
    }, [allCrops]);
    
    const availableGenetics = useMemo(() => {
        if (!form.cropId) return [];
        const crop = allCrops.find(c => c.id === form.cropId);
        if (!crop || !crop.harvestData) return [];
        return crop.harvestData.geneticHarvests
            .map(gh => genetics.find(g => g.id === gh.geneticsId))
            .filter((g): g is NonNullable<typeof g> => g !== undefined);
    }, [form.cropId, allCrops, genetics]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !form.cropId || !form.geneticsId || !form.trimmedWeight || !form.trimWasteWeight) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const newSession: TrimmingSession = {
            id: `trim-${Date.now()}`,
            userId: currentUser.id,
            userUsername: currentUser.username,
            cropId: form.cropId,
            geneticsId: form.geneticsId,
            date: new Date().toISOString(),
            trimmedWeight: parseFloat(form.trimmedWeight),
            trimWasteWeight: parseFloat(form.trimWasteWeight),
        };

        saveTrimmingSession(newSession);
        setForm(initialFormState);
        alert("Sesión de trimeado registrada con éxito.");
    };
    
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Módulo de Trimeado</h1>

            <Card>
                <h2 className="text-xl font-semibold text-primary mb-4">Registrar Trabajo de Trimeado</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-secondary">Cultivo Cosechado</label>
                            <select name="cropId" value={form.cropId} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded-md" required>
                                <option value="">Selecciona un cultivo...</option>
                                {availableCrops.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {locations.find(l => l.id === c.locationId)?.name || c.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm text-text-secondary">Genética Trimeada</label>
                            <select name="geneticsId" value={form.geneticsId} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded-md" required disabled={!form.cropId}>
                                <option value="">Selecciona una genética...</option>
                                {availableGenetics.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm text-text-secondary">Peso de Flor Trimeada (g)</label>
                            <input type="number" step="0.1" name="trimmedWeight" value={form.trimmedWeight} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary">Peso de "Trim" / Desperdicio (g)</label>
                            <input type="number" step="0.1" name="trimWasteWeight" value={form.trimWasteWeight} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-gray-100 border border-border-color rounded" required />
                        </div>
                     </div>
                     <div className="pt-2">
                         <button type="submit" className="w-full py-2 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">
                            Guardar Registro
                        </button>
                     </div>
                </form>
            </Card>
        </div>
    );
};

export default Trimming;