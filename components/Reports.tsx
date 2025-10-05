

import React, { useState, useMemo, useEffect } from 'react';
import { useCrops, useExpenses, useLocations, usePlantBatches, useGenetics, useAuth } from '../context/AppProvider';
import Card from './ui/Card';
import Spinner from './ui/Spinner';
import { HarvestPrediction, Crop, UserRole, SensorDataPoint } from '../types';
import { predictHarvestYield } from '../services/geminiService';
import { getParentLocationId, getStageInfo, isOutOfRange } from '../services/nutritionService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

const SensorDetailModal: React.FC<{
    data: SensorDataPoint[];
    onClose: () => void;
    logDate: string;
}> = ({ data, onClose, logDate }) => {
    const formattedData = data.map(d => ({
        ...d,
        time: new Date(d.timestamp).toLocaleString('es-ES', { day:'numeric', month:'short', hour: '2-digit', minute: '2-digit' }),
    }));
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl relative h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-2xl">&times;</button>
                <h3 className="text-lg font-bold mb-4">Detalle de Sensores - {new Date(logDate).toLocaleDateString()}</h3>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
                            <XAxis dataKey="time" stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
                            <YAxis yAxisId="left" stroke="#F56565" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#F56565' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#4299E1" label={{ value: '%', angle: -90, position: 'insideRight', fill: '#4299E1' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperatura" stroke="#F56565" dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humedad" stroke="#4299E1" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    )
};


const CropStatusCard: React.FC<{ crop: Crop }> = ({ crop }) => {
    const { plantBatches } = usePlantBatches();
    const { genetics } = useGenetics();
    
    const stageInfo = getStageInfo(crop);
    
    const batchDetails = useMemo(() => {
        return crop.plantCounts.map(pc => {
            const batch = plantBatches.find(b => b.id === pc.batchId);
            return {
                id: pc.batchId,
                count: pc.count,
                geneticName: genetics.find(g => g.id === batch?.geneticsId)?.name || 'Desconocida'
            };
        });
    }, [crop, plantBatches, genetics]);

    const totalPlants = crop.plantCounts.reduce((sum, pc) => sum + pc.count, 0);

    return (
        <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">Estado Actual del Cultivo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-text-secondary">Etapa</p>
                    <p className="text-2xl font-bold text-text-primary">{stageInfo.stage}</p>
                </div>
                 <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-text-secondary">Semana / Día</p>
                    <p className="text-2xl font-bold text-text-primary">{stageInfo.weekInStage} / {stageInfo.dayOfWeekInStage}</p>
                </div>
                 <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-text-secondary">Días Totales</p>
                    <p className="text-2xl font-bold text-text-primary">{stageInfo.totalDays}</p>
                </div>
                 <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-text-secondary">Nº de Plantas</p>
                    <p className="text-2xl font-bold text-text-primary">{totalPlants}</p>
                </div>
            </div>
             <div className="mt-4">
                <h3 className="text-md font-semibold text-text-secondary">Lotes en Cultivo</h3>
                <ul className="text-sm text-text-secondary list-disc list-inside mt-1">
                    {batchDetails.map(bd => (
                         <li key={bd.id}>{bd.id} ({bd.geneticName}): {bd.count} plantas</li>
                    ))}
                </ul>
            </div>
        </Card>
    );
};

const ToggleButton: React.FC<{ label: string; color: string; isActive: boolean; onClick: () => void }> = ({ label, color, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${isActive ? `${color} text-white` : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
    >
        {label}
    </button>
);

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);


const Reports: React.FC = () => {
  const { allCrops, activeCrop } = useCrops();
  const { expenses } = useExpenses();
  const { locations } = useLocations();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<HarvestPrediction | null>(null);
  const [error, setError] = useState('');
  
  const [selectedCropId, setSelectedCropId] = useState<string | null>(activeCrop?.id || null);
  const [viewingSensorData, setViewingSensorData] = useState<{ data: SensorDataPoint[], date: string } | null>(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  
  const reportCrop = useMemo(() => allCrops.find(c => c.id === selectedCropId), [allCrops, selectedCropId]);

  const isAdmin = useMemo(() => currentUser?.roles.includes(UserRole.ADMIN), [currentUser]);

  const visibleCropsForDropdown = useMemo(() => {
    const nonArchived = allCrops.filter(c => !c.isArchived);
    let visibleList: Crop[] = [];

    if (currentUser?.roles.includes(UserRole.ADMIN) || currentUser?.locationId === 'TODAS') {
        visibleList = nonArchived;
    } else {
        const userMainLocationId = currentUser?.locationId;
        if (userMainLocationId) {
            visibleList = nonArchived.filter(crop => {
                const room = locations.find(l => l.id === crop.locationId);
                return room?.parentId === userMainLocationId || room?.id === userMainLocationId;
            });
        }
    }
    // If the currently selected crop is archived, add it to the list so it appears in the dropdown.
    if (reportCrop && reportCrop.isArchived && !visibleList.some(c => c.id === reportCrop.id)) {
        visibleList.unshift(reportCrop);
    }
    return visibleList;
  }, [allCrops, currentUser, locations, reportCrop]);

  useEffect(() => {
    // If an active crop is passed from another page (like archive), set it.
    if (activeCrop) {
        setSelectedCropId(activeCrop.id);
    }
  }, [activeCrop]);

  const [visibleLines, setVisibleLines] = useState({
    temp: true,
    leafTemp: true,
    humidity: true,
    vpd: true,
  });

  const handleToggleLine = (line: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  const cropName = useMemo(() => {
    if (!reportCrop) return '';
    const location = locations.find(l => l.id === reportCrop.locationId);
    return location?.name || reportCrop.id;
  }, [reportCrop, locations]);


  const handlePredict = async () => {
      if (!reportCrop) return;
      setIsLoading(true);
      setError('');
      setPrediction(null);
      try {
          const result = await predictHarvestYield(reportCrop);
          setPrediction(result);
      } catch (err) {
          setError('No se pudo obtener la predicción.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleExportCSV = () => {
      if (!reportCrop || reportCrop.logEntries.length === 0) return;

      const headers = "Fecha,Temp,Temp_Hoja,Humedad,VPD,CO2,pH_Entrada,PPM_Entrada,Volumen,Costo_Riego,pH_Salida,PPM_Salida,Salud_Planta,Notas\n";
      const rows = reportCrop.logEntries.map(log => {
          const date = new Date(log.date).toLocaleString();
          const notes = `"${log.notes?.replace(/"/g, '""') || ''}"`;
          return [
              date,
              log.environmental?.temp ?? '', log.environmental?.leafTemp ?? '', log.environmental?.humidity ?? '', log.environmental?.vpd ?? '', log.environmental?.co2 ?? '',
              log.irrigation?.ph ?? '', log.irrigation?.ppm ?? '', log.irrigation?.volume ?? '', log.irrigation?.cost?.toFixed(2) ?? '0.00', log.irrigation?.phOut ?? '', log.irrigation?.ppmOut ?? '',
              log.plantHealth?.join('; ') || '',
              notes
          ].join(',');
      }).join('\n');
      
      const csvContent = headers + rows;
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${cropName}_log.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const costAnalysis = useMemo(() => {
    if (!reportCrop) return null;

    const nutrientCost = reportCrop.logEntries.reduce((acc, log) => acc + (log.irrigation?.cost || 0), 0);
    
    const parentLocationId = getParentLocationId(reportCrop.locationId, locations);
    const generalExpenses = expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            const startDate = new Date(reportCrop.cloningDate);
            const endDate = reportCrop.harvestDate ? new Date(reportCrop.harvestDate) : new Date();
            return e.locationId === parentLocationId && expenseDate >= startDate && expenseDate <= endDate;
        })
        .reduce((acc, e) => acc + e.amount, 0);

    const totalCost = nutrientCost + generalExpenses;
    const dryWeight = reportCrop.harvestData?.totalDryWeight || 0;
    const costPerGram = dryWeight > 0 ? totalCost / dryWeight : 0;

    return { nutrientCost, generalExpenses, totalCost, costPerGram, dryWeight };

  }, [reportCrop, expenses, locations]);


  const { environmentalChartData, irrigationChartData } = useMemo(() => {
    if (!reportCrop) return { environmentalChartData: [], irrigationChartData: [] };

    const allEnvPoints: { dateObj: Date, Temperatura?: number, Temp_Hoja?: number, Humedad?: number, VPD?: number }[] = [];
    const allIrrigationPoints: { dateObj: Date, pH_In?: number, pH_Out?: number, PPM_In?: number, PPM_Out?: number }[] = [];
    
    reportCrop.logEntries.forEach(log => {
        if (log.sensorData && log.sensorData.length > 0) {
            log.sensorData.forEach(point => {
                allEnvPoints.push({
                    dateObj: new Date(point.timestamp),
                    Temperatura: point.temperature,
                    Humedad: point.humidity,
                });
            });
        }
        
        if (log.environmental) {
             allEnvPoints.push({
                dateObj: new Date(log.date),
                Temperatura: log.environmental.temp,
                Temp_Hoja: log.environmental.leafTemp,
                Humedad: log.environmental.humidity,
                VPD: log.environmental.vpd,
            });
        }

        if (log.irrigation) {
            allIrrigationPoints.push({
                dateObj: new Date(log.date),
                pH_In: log.irrigation.ph,
                pH_Out: log.irrigation.phOut,
                PPM_In: log.irrigation.ppm,
                PPM_Out: log.irrigation.ppmOut,
            });
        }
    });

    allEnvPoints.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    allIrrigationPoints.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    const formatAndClean = (points: { dateObj: Date }[]) => {
        return points.map(({dateObj, ...rest}) => ({
            ...rest,
            date: dateObj.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        }));
    }

    return { 
        environmentalChartData: formatAndClean(allEnvPoints),
        irrigationChartData: formatAndClean(allIrrigationPoints)
    };
  }, [reportCrop]);

  return (
    <div className="space-y-8">
       {viewingSensorData && (
          <SensorDetailModal
              data={viewingSensorData.data}
              logDate={viewingSensorData.date}
              onClose={() => setViewingSensorData(null)}
          />
      )}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary truncate">Reportes {cropName && `para ${cropName}`}</h1>
        <div className="flex items-center gap-4">
          <select 
            value={selectedCropId || ''} 
            onChange={e => setSelectedCropId(e.target.value)} 
            className="w-full sm:w-64 px-3 py-2 bg-surface border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
              <option value="">Seleccionar un cultivo...</option>
              {visibleCropsForDropdown.map(crop => (
                  <option key={crop.id} value={crop.id}>
                      {crop.isArchived && '(Archivado) '}
                      {locations.find(l => l.id === crop.locationId)?.name || crop.id}
                  </option>
              ))}
          </select>
          <button
              onClick={handleExportCSV}
              disabled={!reportCrop || reportCrop.logEntries.length === 0}
              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary font-bold rounded-md transition-colors disabled:bg-gray-100 disabled:text-text-secondary disabled:cursor-not-allowed"
          >
              Exportar a CSV
          </button>
        </div>
      </div>
      
      {!reportCrop ? (
         <Card><p className="text-center text-text-secondary">Por favor, selecciona un cultivo de la lista para ver los reportes.</p></Card>
      ) : (
      <>
        <CropStatusCard crop={reportCrop} />
        
        {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-semibold mb-4 text-primary">Análisis de Costos</h2>
                    {costAnalysis ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Costo de Nutrientes:</span>
                                <span className="font-bold text-text-primary">${costAnalysis.nutrientCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Gastos Generales (Luz, Renta, etc.):</span>
                                <span className="font-bold text-text-primary">${costAnalysis.generalExpenses.toFixed(2)}</span>
                            </div>
                            <hr className="border-border-color" />
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-text-secondary">Costo Total del Cultivo:</span>
                                <span className="font-bold text-primary">${costAnalysis.totalCost.toFixed(2)}</span>
                            </div>
                            <hr className="border-border-color" />
                            {costAnalysis.dryWeight > 0 ? (
                                <div className="text-center bg-gray-50 p-4 rounded-lg">
                                    <p className="text-text-secondary text-sm">Costo por Gramo Producido</p>
                                    <p className="text-3xl font-bold text-primary">${costAnalysis.costPerGram.toFixed(3)}</p>
                                    <p className="text-xs text-muted">(Basado en {costAnalysis.dryWeight}g de peso seco)</p>
                                </div>
                            ) : (
                                <p className="text-center text-muted p-4">Registra el peso seco en la sección de "Cosecha" para calcular el costo por gramo.</p>
                            )}
                        </div>
                    ) : <p className="text-muted">Calculando costos...</p>}
                </Card>
                <Card>
                    <h2 className="text-xl font-semibold mb-4 text-primary">Predicción de Cosecha con IA</h2>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handlePredict}
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors disabled:bg-gray-300"
                        >
                            {isLoading ? 'Prediciendo...' : 'Predecir Cosecha'}
                        </button>
                        <div className="flex-1">
                            {isLoading && <Spinner />}
                            {error && <p className="text-red-500">{error}</p>}
                            {prediction && (
                                <div className="space-y-2 bg-gray-100 p-4 rounded-md">
                                    <p><strong className="text-text-primary">Rango de Cosecha:</strong> {prediction.yield_range}</p>
                                    <p><strong className="text-text-primary">Razonamiento:</strong> {prediction.reasoning}</p>
                                    <p><strong className="text-text-primary">Confianza:</strong> {prediction.confidence_level}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        )}
        
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-primary">Condiciones Ambientales</h2>
          <div className="flex justify-center flex-wrap gap-2 mb-4">
              <ToggleButton label="Temp. Ambiente" color="bg-red-500" isActive={visibleLines.temp} onClick={() => handleToggleLine('temp')} />
              <ToggleButton label="Temp. Hoja" color="bg-orange-500" isActive={visibleLines.leafTemp} onClick={() => handleToggleLine('leafTemp')} />
              <ToggleButton label="Humedad" color="bg-blue-500" isActive={visibleLines.humidity} onClick={() => handleToggleLine('humidity')} />
              <ToggleButton label="VPD" color="bg-yellow-500" isActive={visibleLines.vpd} onClick={() => handleToggleLine('vpd')} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={environmentalChartData} margin={{ top: 5, right: 60, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" angle={-20} textAnchor="end" height={50} interval="preserveStartEnd" />
              <YAxis yAxisId="temp" stroke="#F56565" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#F56565' }} />
              <YAxis yAxisId="hum" orientation="right" stroke="#4299E1" label={{ value: '%', angle: -90, position: 'insideRight', fill: '#4299E1' }} />
              <YAxis yAxisId="vpd" orientation="right" stroke="#ECC94B" label={{ value: 'kPa', angle: -90, position: 'insideRight', fill: '#ECC94B' }} domain={[0, 'auto']} style={{ transform: 'translateX(50px)' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
              <Legend />
              {visibleLines.temp && <Line yAxisId="temp" type="monotone" dataKey="Temperatura" stroke="#F56565" name="Temp. Ambiente" dot={false} connectNulls />}
              {visibleLines.leafTemp && <Line yAxisId="temp" type="monotone" dataKey="Temp_Hoja" stroke="#ED8936" name="Temp. Hoja" dot={false} connectNulls />}
              {visibleLines.humidity && <Line yAxisId="hum" type="monotone" dataKey="Humedad" stroke="#4299E1" dot={false} connectNulls />}
              {visibleLines.vpd && <Line yAxisId="vpd" type="monotone" dataKey="VPD" stroke="#ECC94B" name="VPD (kPa)" dot={false} connectNulls />}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-primary">Análisis de PPM</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={irrigationChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Bar dataKey="PPM_In" fill="#667EEA" name="PPM Entrada" />
                    <Bar dataKey="PPM_Out" fill="#ED64A6" name="PPM Salida" />
                </BarChart>
            </ResponsiveContainer>
          </Card>
           <Card>
            <h2 className="text-xl font-semibold mb-4 text-primary">Análisis de pH</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={irrigationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis domain={[5, 8]} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line type="monotone" dataKey="pH_In" stroke="#ED8936" name="pH Entrada" dot={false} />
                <Line type="monotone" dataKey="pH_Out" stroke="#4FD1C5" name="pH Salida" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="bg-surface rounded-lg border border-border-color">
            <header onClick={() => setIsHistoryExpanded(!isHistoryExpanded)} className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
                <h2 className="text-xl font-bold text-text-secondary">Historial de Registros Detallado</h2>
                <ChevronIcon isOpen={isHistoryExpanded} />
            </header>
            {isHistoryExpanded && (
                <div className="px-4 pb-4">
                    <Card>
                        {reportCrop.logEntries.length > 0 ? (
                            <div className="overflow-x-auto max-h-[60vh]">
                                <table className="w-full text-sm text-left text-text-secondary">
                                   <thead className="text-xs text-text-primary uppercase bg-gray-50 sticky top-0 z-10">
                                       <tr>
                                           <th scope="col" className="px-4 py-3">Fecha</th>
                                           <th scope="col" className="px-4 py-3">Ambiente</th>
                                           <th scope="col" className="px-4 py-3">Riego In</th>
                                           <th scope="col" className="px-4 py-3">Riego Out</th>
                                           <th scope="col" className="px-4 py-3">Eventos y Notas</th>
                                           <th scope="col" className="px-4 py-3">Sensores</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {reportCrop.logEntries.slice().reverse().map(log => (
                                           <tr key={log.id} className="bg-surface border-b border-border-color hover:bg-gray-50">
                                               <td className="px-4 py-4 whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                                               <td className="px-4 py-4 text-sm">
                                                  {log.environmental && (
                                                      <>
                                                          <p><strong>T:</strong> {log.environmental.temp}°C</p>
                                                          <p><strong>H:</strong> {log.environmental.humidity}%</p>
                                                      </>
                                                  )}
                                               </td>
                                               <td className="px-4 py-4 text-sm">
                                                  {log.irrigation && (
                                                      <>
                                                          <p><strong>pH:</strong> <span className={isOutOfRange(log.irrigation.ph, [5.7, 6.4], 0) ? 'text-yellow-500 font-bold' : ''}>{log.irrigation.ph}</span></p>
                                                          <p><strong>PPM:</strong> {log.irrigation.ppm}</p>
                                                      </>
                                                  )}
                                               </td>
                                               <td className="px-4 py-4 text-sm">
                                                   {log.irrigation && (
                                                      <>
                                                          <p><strong>pH:</strong> <span className={(log.irrigation.phOut && isOutOfRange(log.irrigation.phOut, [5.7, 6.4], 0)) ? 'text-yellow-500 font-bold' : ''}>{log.irrigation.phOut ?? 'N/A'}</span></p>
                                                          <p><strong>PPM:</strong> <span className={(log.irrigation.ppmOut && log.irrigation.ppm && log.irrigation.ppm > 300 && log.irrigation.ppmOut > (log.irrigation.ppm * 1.30)) ? 'text-yellow-500 font-bold' : ''}>{log.irrigation.ppmOut ?? 'N/A'}</span></p>
                                                      </>
                                                  )}
                                               </td>
                                               <td className="px-4 py-4 max-w-xs text-sm">
                                                  {log.notes && <p className="whitespace-pre-wrap mb-1" title={log.notes}>{log.notes}</p>}
                                                  
                                                  {log.plantHealth && log.plantHealth.length > 0 && (
                                                      <div className="my-1">
                                                          <strong className="text-yellow-500">Salud:</strong>
                                                          <ul className="list-disc list-inside pl-1">
                                                              {log.plantHealth.map((h, i) => <li key={i} className={h.toLowerCase().includes('oídio') ? 'text-yellow-500 font-bold' : ''}>{h}</li>)}
                                                          </ul>
                                                      </div>
                                                  )}

                                                  {log.foliarSpray && log.foliarSpray.length > 0 && (
                                                      <div className="my-1">
                                                          <strong>Foliar:</strong>
                                                          <ul className="list-disc list-inside pl-1">
                                                              {log.foliarSpray.map((s, i) => <li key={i}>{s.name}</li>)}
                                                          </ul>
                                                      </div>
                                                  )}
                                                  
                                                  {log.supplements && log.supplements.length > 0 && (
                                                       <div className="my-1">
                                                          <strong>Suplementos:</strong>
                                                          <ul className="list-disc list-inside pl-1">
                                                              {log.supplements.map((s, i) => <li key={i}>{s.name}</li>)}
                                                          </ul>
                                                      </div>
                                                  )}

                                                  {log.completedTasks && log.completedTasks.map(t => (
                                                      <span key={t.taskId} className="block bg-gray-200 text-text-primary px-2 py-1 rounded-full mt-1">✔ {t.taskTitle} ({t.completedBy})</span>
                                                  ))}
                                               </td>
                                               <td className="px-4 py-4">
                                                    {log.sensorData && log.sensorData.length > 0 && (
                                                        <button onClick={(e) => { e.stopPropagation(); setViewingSensorData({ data: log.sensorData!, date: log.date }); }} className="text-xs py-1 px-2 rounded bg-primary/80 hover:bg-primary text-white">Ver Gráfica</button>
                                                    )}
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-text-secondary py-4">Aún no hay entradas de registro para este cultivo.</p>
                        )}
                    </Card>
                </div>
            )}
        </div>
      </>
      )}

    </div>
  );
};

export default Reports;