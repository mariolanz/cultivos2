import React, { useState, useMemo } from 'react';
import { useCrops, useGenetics, usePlantBatches, useLocations } from '../context/AppProvider';
import { ROOM_LAMP_CONFIG } from '../constants';
import Card from './ui/Card';

const POUND_TO_GRAMS = 453.592;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const WEEKS_OF_FLOWER = 9;
const WEEKS_OF_CURE = 2;

interface Projection {
    cropId: string;
    cropName: string;
    availabilityDate: Date;
    isEstimate: boolean;
    geneticsBreakdown: {
        name: string;
        count: number;
        percentage: number;
    }[];
    estimatedYieldLbs: number;
    estimatedYieldGrams: number;
}

interface MonthlyProjection {
    month: string;
    totalLbs: number;
    totalGrams: number;
    harvestCount: number;
    geneticsBreakdown: {
        [geneticName: string]: {
            grams: number;
        }
    };
    geneticsPercentage?: {
        name: string;
        percentage: number;
    }[];
}

const HarvestProjection: React.FC = () => {
    const { allCrops } = useCrops();
    const { genetics } = useGenetics();
    const { plantBatches } = usePlantBatches();
    const { locations } = useLocations();
    const [lbsPerLamp, setLbsPerLamp] = useState(1.5);

    const projections = React.useMemo(() => {
        const today = new Date();
        const futureLimit = new Date();
        futureLimit.setMonth(futureLimit.getMonth() + 4); // Show projections for the next 4 months

        const calculatedProjections: Projection[] = [];

        allCrops.filter(c => !c.isArchived).forEach(crop => {
            let availabilityDate: Date | null = null;
            let isEstimate = false;

            if (crop.harvestDate) {
                availabilityDate = new Date(new Date(crop.harvestDate).getTime() + (14 * MS_PER_DAY));
            } else if (crop.dryingCuringDate) {
                availabilityDate = new Date(new Date(crop.dryingCuringDate).getTime() + (14 * MS_PER_DAY));
            } else if (crop.flowerDate) {
                const flowerDate = new Date(crop.flowerDate);
                const estimatedHarvestDate = new Date(flowerDate.getTime() + (WEEKS_OF_FLOWER * 7 * MS_PER_DAY));
                availabilityDate = new Date(estimatedHarvestDate.getTime() + (WEEKS_OF_CURE * 7 * MS_PER_DAY));
                isEstimate = true;
            }

            if (availabilityDate && availabilityDate > today && availabilityDate < futureLimit) {
                const totalPlants = crop.plantCounts.reduce((sum, pc) => sum + pc.count, 0);
                if (totalPlants === 0) return;

                const countsByGenetic: Record<string, number> = {};
                crop.plantCounts.forEach(pc => {
                    let geneticId: string | undefined;
                    const batch = plantBatches.find(b => b.id === pc.batchId);
                    if (batch) {
                        geneticId = batch.geneticsId;
                    } else {
                        const code = pc.batchId.split('-')[0];
                        const genetic = genetics.find(g => g.code === code);
                        if (genetic) geneticId = genetic.id;
                    }
                    if (geneticId) countsByGenetic[geneticId] = (countsByGenetic[geneticId] || 0) + pc.count;
                });

                const geneticsBreakdown = Object.entries(countsByGenetic).map(([geneticsId, count]) => {
                    const geneticInfo = genetics.find(g => g.id === geneticsId);
                    return {
                        name: geneticInfo?.name || 'Desconocido',
                        count,
                        percentage: (count / totalPlants) * 100,
                    };
                });
                
                const lampCount = ROOM_LAMP_CONFIG[crop.locationId] || 0;
                const estimatedYieldLbs = lampCount * lbsPerLamp;
                const estimatedYieldGrams = estimatedYieldLbs * POUND_TO_GRAMS;
                
                calculatedProjections.push({
                    cropId: crop.id,
                    cropName: locations.find(l => l.id === crop.locationId)?.name || crop.id,
                    availabilityDate, isEstimate, geneticsBreakdown, estimatedYieldLbs, estimatedYieldGrams,
                });
            }
        });

        return calculatedProjections.sort((a, b) => a.availabilityDate.getTime() - b.availabilityDate.getTime());
    }, [allCrops, plantBatches, genetics, locations, lbsPerLamp]);
    
    const monthlyProjections = useMemo(() => {
        const byMonth: Record<string, MonthlyProjection> = {};

        projections.forEach(proj => {
            const monthKey = proj.availabilityDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            if (!byMonth[monthKey]) {
                byMonth[monthKey] = {
                    month: monthKey.charAt(0).toUpperCase() + monthKey.slice(1),
                    totalLbs: 0, totalGrams: 0, harvestCount: 0, geneticsBreakdown: {}
                };
            }

            const monthData = byMonth[monthKey];
            monthData.harvestCount += 1;
            monthData.totalLbs += proj.estimatedYieldLbs;
            monthData.totalGrams += proj.estimatedYieldGrams;

            proj.geneticsBreakdown.forEach(gen => {
                const geneticGrams = proj.estimatedYieldGrams * (gen.percentage / 100);
                if (!monthData.geneticsBreakdown[gen.name]) {
                    monthData.geneticsBreakdown[gen.name] = { grams: 0 };
                }
                monthData.geneticsBreakdown[gen.name].grams += geneticGrams;
            });
        });

        Object.values(byMonth).forEach(monthData => {
            const totalGramsInMonth = monthData.totalGrams;
            if (totalGramsInMonth > 0) {
                monthData.geneticsPercentage = Object.entries(monthData.geneticsBreakdown)
                    .map(([name, data]) => ({
                        name,
                        percentage: (data.grams / totalGramsInMonth) * 100,
                    }))
                    .sort((a, b) => b.percentage - a.percentage);
            } else {
                monthData.geneticsPercentage = [];
            }
        });
        
        return Object.values(byMonth);
    }, [projections]);


    if (projections.length === 0) {
        return <p className="text-muted text-center">No hay cosechas futuras para proyectar en los próximos 4 meses.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="p-3 bg-gray-100 rounded-lg">
                <label htmlFor="lbsPerLamp" className="block text-sm font-medium text-text-secondary mb-2">Proyección de Rendimiento (Libras por Lámpara)</label>
                <input
                    id="lbsPerLamp"
                    type="number" step="0.1" value={lbsPerLamp}
                    onChange={e => setLbsPerLamp(parseFloat(e.target.value) || 0)}
                    className="w-full sm:w-48 px-3 py-2 bg-white border border-border-color rounded-md"
                />
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-text-primary mb-4">Resumen Mensual de Cosechas</h3>
                 {monthlyProjections.map(monthProj => (
                    <Card key={monthProj.month} className="mb-4">
                        <h4 className="text-lg font-semibold text-primary">{monthProj.month}</h4>
                        <div className="grid grid-cols-2 gap-4 my-4 text-center">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-text-secondary"># de Cosechas</p>
                                <p className="text-3xl font-bold text-text-primary">{monthProj.harvestCount}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-text-secondary">Libras Totales (est.)</p>
                                <p className="text-3xl font-bold text-text-primary">{monthProj.totalLbs.toFixed(2)} lbs</p>
                            </div>
                        </div>
                        <div>
                            <h5 className="text-md font-semibold text-text-secondary mb-2">Desglose de Genéticas (Estimado)</h5>
                            <div className="space-y-2">
                                {monthProj.geneticsPercentage?.map(gen => (
                                    <div key={gen.name}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-text-primary font-medium">{gen.name}</span>
                                            <span className="text-text-secondary font-semibold">{gen.percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${gen.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <details className="bg-surface p-4 rounded-lg border border-border-color">
                <summary className="font-bold text-lg text-text-primary cursor-pointer">Ver Proyecciones Individuales</summary>
                <div className="mt-4 space-y-4">
                    {projections.map(proj => (
                        <div key={proj.cropId} className="bg-gray-50 p-4 rounded-lg border border-border-color">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-md text-text-primary">{proj.cropName}</h3>
                                <div className="text-right">
                                    <p className={`font-semibold text-primary`}>
                                        {proj.availabilityDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                    {proj.isEstimate && <p className="text-xs text-accent">(Estimado)</p>}
                                </div>
                            </div>
                            <div className="mt-3 border-t border-border-color pt-3">
                                <div className="mb-3 text-center bg-white p-3 rounded-lg">
                                    <p className="text-text-secondary text-sm">Producción Mínima Estimada</p>
                                    <p className="text-2xl font-bold text-primary">{proj.estimatedYieldLbs.toFixed(2)} lbs</p>
                                    <p className="text-xs text-muted">({proj.estimatedYieldGrams.toFixed(0)} gramos)</p>
                                </div>
                                <h4 className="text-sm font-semibold text-text-secondary mb-2">Desglose de Genéticas:</h4>
                                <ul className="space-y-1 text-sm">
                                    {proj.geneticsBreakdown.map(gen => (
                                        <li key={gen.name} className="flex justify-between items-center">
                                            <span className="text-text-secondary">{gen.name}</span>
                                            <span className="font-mono text-text-primary bg-gray-200 px-2 py-0.5 rounded-md text-xs">{gen.percentage.toFixed(1)}% ({gen.count})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </details>
        </div>
    );
};

export default HarvestProjection;