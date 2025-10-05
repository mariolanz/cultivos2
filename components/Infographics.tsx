import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { usePno, useInfographics, useAuth, useConfirmation } from '../context/AppProvider';
import { PnoProcedure, Infographic, UserRole } from '../types';
import Card from './ui/Card';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

const parseHtml = (html: string) => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const styleMatch = html.match(/<style[^>]*>([\s\S]*)<\/style>/i);
    return {
        body: bodyMatch ? bodyMatch[1] : 'No se pudo extraer el contenido del <body>. Asegúrate de que el HTML pegado tenga una etiqueta <body>.',
        style: styleMatch ? styleMatch[1] : ''
    };
};


const InfographicModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (infographic: Infographic) => void;
    infographicToEdit: Infographic | null;
}> = ({ isOpen, onClose, onSave, infographicToEdit }) => {
    const [title, setTitle] = useState('');
    const [pnoId, setPnoId] = useState('');
    const [htmlCode, setHtmlCode] = useState('');
    const { pnoProcedures } = usePno();

    useEffect(() => {
        if (infographicToEdit) {
            setTitle(infographicToEdit.title);
            setPnoId(infographicToEdit.pnoId || '');
            // For editing, we don't repopulate the textarea to avoid showing a huge block of code.
            // The user must paste new code if they want to change it.
            setHtmlCode('');
        } else {
            setTitle('');
            setPnoId('');
            setHtmlCode('');
        }
    }, [infographicToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let parsedContent = infographicToEdit?.htmlContent;

        if (htmlCode.trim()) { // Only parse if new HTML is provided
             parsedContent = parseHtml(htmlCode);
        }

        if (!parsedContent) {
            alert("Por favor, pega el código HTML de la infografía.");
            return;
        }

        const newInfographic: Infographic = {
            id: infographicToEdit?.id || `info-${Date.now()}`,
            title,
            pnoId: pnoId || undefined,
            htmlContent: parsedContent
        };
        onSave(newInfographic);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary" aria-label="Cerrar">&times;</button>
                <h3 className="text-lg font-bold mb-4 text-text-primary">{infographicToEdit ? 'Editar' : 'Añadir'} Infografía</h3>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Título</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Vincular a PNO (Opcional)</label>
                        <select value={pnoId} onChange={e => setPnoId(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md">
                            <option value="">Ninguno</option>
                            {pnoProcedures.map(pno => <option key={pno.id} value={pno.id}>{pno.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Pegar Código HTML Completo</label>
                        <textarea
                            value={htmlCode}
                            onChange={e => setHtmlCode(e.target.value)}
                            rows={10}
                            className="w-full p-2 bg-gray-100 border border-border-color rounded-md font-mono text-xs"
                            placeholder="Pega el código HTML completo aquí. El sistema extraerá automáticamente los estilos (<style>) y el contenido (<body>)."
                            required={!infographicToEdit}
                        />
                        {infographicToEdit && <p className="text-xs text-muted mt-1">Deja en blanco para no cambiar el contenido visual existente.</p>}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-border-color">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary rounded-md">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md">Guardar Infografía</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const EliteGrowInfographic: React.FC = () => {
    // ... (existing chart logic remains the same)
    const environmentalChartRef = useRef<HTMLCanvasElement>(null);
    const vegNutritionChartRef = useRef<HTMLCanvasElement>(null);
    const flowerNutritionChartRef = useRef<HTMLCanvasElement>(null);
    const vwcTriggerChartRef = useRef<HTMLCanvasElement>(null);
    const { pnoProcedures } = usePno();
    const navigate = useNavigate();
    const elitePno = pnoProcedures.find(p => p.id === 'pno-cultivo-elite');

    useEffect(() => {
        const chartInstances: Chart[] = [];
        
        const tooltipTitleCallback = (tooltipItems: TooltipItem<'line' | 'bar'>[]) => {
            const item = tooltipItems[0];
            if (!item || !item.chart.data.labels) return '';
            let label = item.chart.data.labels[item.dataIndex];
            if (Array.isArray(label)) {
              return label.join(' ');
            } else {
              return String(label);
            }
        };

        const processLabels = (labels: string[]) => {
            return labels.map(label => {
                if (typeof label === 'string' && label.length > 16) {
                    const words = label.split(' ');
                    const newLabel: string[] = [];
                    let line = '';
                    words.forEach(word => {
                        if ((line + word).length > 16) {
                            newLabel.push(line.trim());
                            line = '';
                        }
                        line += word + ' ';
                    });
                    newLabel.push(line.trim());
                    return newLabel;
                }
                return label;
            });
        };

        const CHART_PALETTE = {
            blue: '#003f5c', purple: '#7a5195', pink: '#ef5675', orange: '#ff764a',
            yellow: '#ffa600', lightBlue: '#374c80', magenta: '#bc5090',
        };
        
        if (environmentalChartRef.current) {
            const ctx = environmentalChartRef.current.getContext('2d');
            if (ctx) {
                chartInstances.push(new Chart(ctx, {
                    type: 'line', data: { labels: processLabels(['Clon 1-3', 'Pre-veg 1-4', 'Veg 1-4', 'Flor 1-6', 'Madur. 7-8', 'Lavado 9']), datasets: [ { label: 'PPFD (µmol·m⁻²·s⁻¹)', data: [225, 400, 600, 1150, 900, 700], borderColor: CHART_PALETTE.yellow, yAxisID: 'yPPFD', tension: 0.1, }, { label: 'CO₂ (ppm)', data: [400, 750, 900, 1300, 900, 400], borderColor: CHART_PALETTE.pink, yAxisID: 'yPPFD', tension: 0.1, }, { label: 'Temp. Día (°C)', data: [24, 26, 28, 28, 24, 22], borderColor: CHART_PALETTE.orange, yAxisID: 'yTemp', tension: 0.1, }, { label: 'VPD (kPa)', data: [0.5, 0.9, 1.15, 1.35, 1.45, 1.3], borderColor: CHART_PALETTE.purple, yAxisID: 'yVPD', tension: 0.1, borderDash: [5, 5] } ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { callbacks: { title: tooltipTitleCallback as any } } }, scales: { x: { grid: { display: false } }, yPPFD: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'PPFD / CO₂' }, max: 1500, min: 0 }, yTemp: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Temperatura (°C)' }, grid: { drawOnChartArea: false }, max: 30, min: 15 }, yVPD: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'VPD (kPa)' }, grid: { drawOnChartArea: false }, max: 2.0, min: 0 } } }
                }));
            }
        }
        
        if (vegNutritionChartRef.current) {
            const ctx = vegNutritionChartRef.current.getContext('2d');
            if (ctx) {
                chartInstances.push(new Chart(ctx, {
                    type: 'bar', data: { labels: ['N', 'P', 'K', 'Ca', 'Mg'], datasets: [{ label: 'mg/L', data: [180, 30, 100, 112, 45], backgroundColor: [ CHART_PALETTE.blue, CHART_PALETTE.purple, CHART_PALETTE.pink, CHART_PALETTE.orange, CHART_PALETTE.yellow ] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: tooltipTitleCallback as any } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'mg/L (ppm)' } }, x: { grid: { display: false } } } }
                }));
            }
        }
        
        if (flowerNutritionChartRef.current) {
            const ctx = flowerNutritionChartRef.current.getContext('2d');
            if (ctx) {
                chartInstances.push(new Chart(ctx, {
                    type: 'bar', data: { labels: ['N', 'P', 'K', 'Ca', 'Mg'], datasets: [{ label: 'mg/L', data: [190, 59, 130, 150, 55], backgroundColor: [ CHART_PALETTE.blue, CHART_PALETTE.purple, CHART_PALETTE.pink, CHART_PALETTE.orange, CHART_PALETTE.yellow ] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: tooltipTitleCallback as any } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'mg/L (ppm)' } }, x: { grid: { display: false } } } }
                }));
            }
        }
        
        if (vwcTriggerChartRef.current) {
            const ctx = vwcTriggerChartRef.current.getContext('2d');
            if(ctx) {
                chartInstances.push(new Chart(ctx, {
                    type: 'bar', data: { labels: processLabels(['Clonación', 'Pre-Vegetación', 'Vegetación', 'Floración']), datasets: [{ label: 'Gatillo de Riego (% VWC)', data: [60, 50, 45, 45], backgroundColor: [ CHART_PALETTE.lightBlue, CHART_PALETTE.purple, CHART_PALETTE.magenta, CHART_PALETTE.pink ] }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: tooltipTitleCallback as any } } }, scales: { x: { beginAtZero: true, title: { display: true, text: '% VWC' } }, y: { grid: { display: false } } } }
                }));
            }
        }
        return () => chartInstances.forEach(chart => chart.destroy());
    }, []);

    return (
        <>
            <header className="bg-[#003f5c] text-white p-8 text-center relative">
                <h1 className="text-4xl font-bold">PNO de Cultivo de Élite V4.7</h1>
                <p className="mt-2 text-lg text-slate-300">Hoja de Ruta Visual para Rendimientos {'>'} 1,000 g/m²</p>
                {elitePno && (
                    <button
                        onClick={() => navigate('/pno-library', { state: { openPnoId: elitePno.id } })}
                        className="absolute top-4 right-4 py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-bold rounded-md text-sm transition-colors"
                    >
                        Ver PNO de Referencia
                    </button>
                )}
            </header>
            <main className="p-4 md:p-8">
                <section id="kpis" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-xl font-semibold text-[#7a5195]">Rendimiento Objetivo</h3><p className="text-5xl font-bold text-[#003f5c] mt-2">{'>'} 1,000 g/m²</p><p className="text-slate-500 mt-1">Con LEDs de alta eficiencia</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-xl font-semibold text-[#7a5195]">CO₂ Máximo</h3><p className="text-5xl font-bold text-[#003f5c] mt-2">1400 ppm</p><p className="text-slate-500 mt-1">En pico de floración</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-xl font-semibold text-[#7a5195]">PPFD Máximo</h3><p className="text-5xl font-bold text-[#003f5c] mt-2">1300 µmol·m⁻²·s⁻¹</p><p className="text-slate-500 mt-1">Para máxima fotosíntesis</p></div>
                </section>
                <section id="ambiente" className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-center text-[#003f5c] mb-2">Parámetros Ambientales por Fase</h2>
                    <p className="text-center text-slate-600 mb-6">Esta gráfica muestra la progresión de los parámetros ambientales clave. El control preciso es fundamental para que la planta procese la alta intensidad lumínica y alcance su máximo potencial.</p>
                    <div className="relative w-full max-w-4xl mx-auto h-[400px] max-h-[50vh]"><canvas ref={environmentalChartRef}></canvas></div>
                </section>
                <section id="nutricion" className="max-w-6xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-center text-[#003f5c] mb-6">Metas de Nutrición por Fase (mg/L)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-2xl font-semibold text-center text-[#7a5195] mb-4">Fase Vegetativa</h3><p className="text-center text-slate-600 mb-4 text-sm">El Nitrógeno es el motor principal para construir una estructura robusta. El Fósforo y el Potasio se mantienen en niveles de soporte.</p><div className="relative w-full max-w-md mx-auto h-[300px] max-h-[40vh]"><canvas ref={vegNutritionChartRef}></canvas></div></div>
                        <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-2xl font-semibold text-center text-[#7a5195] mb-4">Fase de Floración</h3><p className="text-center text-slate-600 mb-4 text-sm">Se mantiene un nivel de Nitrógeno alto (190 mg/L), mientras el Fósforo y Potasio suben a su punto óptimo para maximizar el rendimiento.</p><div className="relative w-full max-w-md mx-auto h-[300px] max-h-[40vh]"><canvas ref={flowerNutritionChartRef}></canvas></div></div>
                    </div>
                </section>
                <section id="mezcla" className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-center text-[#003f5c] mb-6">SOP de Mezcla en Tanque Único</h2>
                    <p className="text-center text-slate-600 mb-8 max-w-3xl mx-auto">El orden de mezcla es crítico para evitar el bloqueo de nutrientes. El silicato debe añadirse primero y neutralizarse antes de introducir el Calcio.</p>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-full max-w-md p-3 bg-slate-200 rounded-lg text-center font-semibold text-slate-700">1. Agua (80%) y agitar</div><div className="text-2xl text-[#ffa600]">↓</div>
                        <div className="w-full max-w-md p-3 bg-[#ffa600] text-white rounded-lg text-center font-bold">2. Silicato (pre-diluido)</div><div className="text-2xl text-slate-500">↓</div>
                        <div className="w-full max-w-md p-3 bg-slate-200 rounded-lg text-center font-semibold text-slate-700">3. Acidificar a pH 5.5</div><div className="text-2xl text-slate-500">↓</div>
                        <div className="w-full max-w-md p-3 bg-[#ff764a] text-white rounded-lg text-center font-semibold">4. MgSO₄·7H₂O</div><div className="text-2xl text-slate-500">↓</div>
                        <div className="w-full max-w-md p-3 bg-[#ef5675] text-white rounded-lg text-center font-semibold">5. Yara Calcinit</div><div className="text-2xl text-slate-500">↓</div>
                        <div className="w-full max-w-md p-3 bg-[#bc5090] text-white rounded-lg text-center font-semibold">6. Ultrasol Inicial/Desarrollo</div><div className="text-2xl text-slate-500">↓</div>
                        <div className="w-full max-w-md p-3 bg-[#7a5195] text-white rounded-lg text-center font-semibold">7. Ultrasol MKP</div><div className="text-2xl text-slate-500">↓</div>
                        <div className="w-full max-w-md p-3 bg-[#374c80] text-white rounded-lg text-center font-semibold">8. Micros Rexene</div><div className="text-2xl text-slate-500">↓</div>
                        <div className="w-full max-w-md p-3 bg-slate-200 rounded-lg text-center font-semibold text-slate-700">9. Completar y ajuste final</div>
                    </div>
                </section>
                <section id="riego" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-2xl font-bold text-center text-[#003f5c] mb-4">Estrategia de Riego</h2><p className="text-center text-slate-600 mb-6 text-sm">Se riega hasta saturación (15-25% drenaje), y solo se vuelve a regar cuando el sustrato alcanza el "gatillo" de secado (VWC).</p><div className="flex flex-col items-center mt-8"><div className="w-24 h-48 border-4 border-[#003f5c] rounded-t-lg bg-gradient-to-t from-blue-300 to-blue-100 relative"><div className="absolute bottom-0 left-0 right-0 h-[74%] bg-blue-500 flex items-center justify-center text-white font-bold">74% VWC</div></div><div className="font-bold text-[#003f5c] mt-2">1. Saturación</div><div className="text-4xl text-slate-400 my-4">→</div><div className="w-24 h-48 border-4 border-[#bc5090] rounded-t-lg bg-gradient-to-t from-amber-200 to-amber-50 relative"><div className="absolute bottom-0 left-0 right-0 h-[45%] bg-amber-400 flex items-center justify-center text-slate-800 font-bold">45% VWC</div></div><div className="font-bold text-[#bc5090] mt-2">2. Gatillo de Secado</div></div></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-2xl font-bold text-center text-[#003f5c] mb-4">Gatillos de Riego (% VWC)</h2><p className="text-center text-slate-600 mb-6 text-sm">El nivel de secado permitido varía. Las plantas jóvenes requieren un sustrato más húmedo, mientras que las maduras toleran un mayor "dryback".</p><div className="relative w-full max-w-md mx-auto h-[300px] max-h-[40vh]"><canvas ref={vwcTriggerChartRef}></canvas></div></div>
                </section>
            </main>
        </>
    )
}

const MotherPlantsInfographic: React.FC = () => {
    // ... (existing chart logic remains the same)
    const environmentalChartRef = useRef<HTMLCanvasElement>(null);
    const nutritionChartRef = useRef<HTMLCanvasElement>(null);
    const { pnoProcedures } = usePno();
    const navigate = useNavigate();
    const motherPno = pnoProcedures.find(p => p.id === 'pno-plantas-madre');

    useEffect(() => {
        const chartInstances: Chart[] = [];
        const CHART_PALETTE = { blue: '#003f5c', purple: '#7a5195', pink: '#ef5675', orange: '#ff764a', yellow: '#ffa600' };

        if (environmentalChartRef.current) {
            const ctx = environmentalChartRef.current.getContext('2d');
            if(ctx) {
                chartInstances.push(new Chart(ctx, {
                    type: 'line',
                    data: { labels: ['PPFD', 'CO₂', 'Temp. Día'], datasets: [ { label: 'Parámetros de Mantenimiento', data: [400, 700, 25], borderColor: CHART_PALETTE.purple, backgroundColor: 'rgba(122, 81, 149, 0.2)', yAxisID: 'y1', tension: 0.1, pointRadius: 5, pointBackgroundColor: CHART_PALETTE.purple } ] },
                    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false, }, plugins: { legend: { display: false, }, }, scales: { x: { grid: { display: false } }, y1: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'PPFD / CO₂' }, max: 1000, min: 0 } } }
                }));
            }
        }
        if (nutritionChartRef.current) {
            const ctx = nutritionChartRef.current.getContext('2d');
            if(ctx) {
                chartInstances.push(new Chart(ctx, {
                    type: 'doughnut',
                    data: { labels: ['Nitrógeno (N)', 'Fósforo (P)', 'Potasio (K)'], datasets: [{ label: 'Ratio Nutricional', data: [160, 30, 95], backgroundColor: [ CHART_PALETTE.blue, CHART_PALETTE.pink, CHART_PALETTE.orange, ], hoverOffset: 4 }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', }, title: { display: true, text: 'PPM Objetivo: ~950' } } }
                }));
            }
        }
        return () => chartInstances.forEach(chart => chart.destroy());
    }, []);
    return (
        <>
            <header className="bg-[#003f5c] text-white p-8 text-center sticky top-0 z-10 shadow-lg relative">
                <h1 className="text-4xl font-bold">PNO: Cuidado de Plantas Madre</h1>
                <p className="mt-2 text-lg text-slate-300">Preservación Genética y Producción de Esquejes de Élite</p>
                {motherPno && (
                    <button
                        onClick={() => navigate('/pno-library', { state: { openPnoId: motherPno.id } })}
                        className="absolute top-4 right-4 py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-bold rounded-md text-sm transition-colors"
                    >
                        Ver PNO de Referencia
                    </button>
                )}
            </header>
            <main className="p-4 md:p-8">
                <section id="kpis" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"><h3 className="text-xl font-semibold text-[#7a5195]">Salud Genética</h3><p className="text-5xl font-bold text-[#003f5c] mt-2">100%</p><p className="text-slate-500 mt-1">Preservación a largo plazo</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"><h3 className="text-xl font-semibold text-[#7a5195]">Vigor Constante</h3><p className="text-5xl font-bold text-[#003f5c] mt-2">ÓPTIMO</p><p className="text-slate-500 mt-1">Plantas sanas, sin estrés</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"><h3 className="text-xl font-semibold text-[#7a5195]">Producción de Esquejes</h3><p className="text-5xl font-bold text-[#003f5c] mt-2">{'>'} 95%</p><p className="text-slate-500 mt-1">Calidad y tasa de éxito</p></div>
                </section>
                <section id="ambiente" className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-center text-[#003f5c] mb-2">Ambiente de Mantenimiento Perpetuo</h2>
                    <p className="text-center text-slate-600 mb-6">El objetivo no es el crecimiento explosivo, sino la estabilidad. Se utilizan niveles de luz (PPFD) y CO₂ moderados para mantener la planta en un estado vegetativo saludable y constante.</p>
                    <div className="relative w-full max-w-4xl mx-auto h-[400px] max-h-[50vh]"><canvas ref={environmentalChartRef}></canvas></div>
                </section>
                <section id="nutricion-y-mip" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-2xl font-semibold text-center text-[#7a5195] mb-4">Nutrición de Mantenimiento</h3><p className="text-center text-slate-600 mb-4">Una fórmula balanceada con ~950 PPM para mantener la salud sin forzar el crecimiento. El ratio N-P-K está diseñado para la producción de hojas y ramas sanas.</p><div className="relative w-full max-w-xs mx-auto h-[350px] max-h-[40vh]"><canvas ref={nutritionChartRef}></canvas></div></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-2xl font-semibold text-center text-[#7a5195] mb-4">Manejo Integrado de Plagas (MIP)</h3><p className="text-center text-slate-600 mb-6">La protección de las madres es la máxima prioridad. Se aplica un programa foliar preventivo dos veces por semana para asegurar que el reservorio genético permanezca 100% limpio.</p><div className="mt-8 space-y-4"><div className="p-4 bg-slate-200 rounded-lg"><p className="font-bold text-[#003f5c] text-lg">LUNES: Prevención de Insectos</p><p className="text-slate-700">Aceite de Neem con Jabón Potásico (10 ml/L)</p></div><div className="p-4 bg-slate-200 rounded-lg"><p className="font-bold text-[#003f5c] text-lg">JUEVES: Prevención de Hongos</p><p className="text-slate-700">Bacillus subtilis (4 ml/L)</p></div></div></div>
                </section>
                <section id="mantenimiento" className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-center text-[#003f5c] mb-6">Ciclo de Mantenimiento Físico</h2>
                    <p className="text-center text-slate-600 mb-8">La salud a largo plazo de una planta madre depende de un ciclo de podas que equilibra la producción de esquejes con la vitalidad de la planta.</p>
                    <div className="flex flex-col md:flex-row justify-center items-center md:items-start text-center gap-4 md:gap-0">
                        <div className="flex flex-col items-center p-4"><div className="w-24 h-24 bg-[#ffa600] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">1</div><h4 className="font-bold text-lg mt-4 text-[#003f5c]">Poda de Mantenimiento</h4><p className="text-slate-600 mt-1 max-w-xs">Regularmente, para mantener una forma de arbusto y estimular nuevos brotes.</p></div>
                        <div className="text-4xl text-slate-300 self-center hidden md:block mx-4">→</div><div className="text-4xl text-slate-300 self-center md:hidden my-2">↓</div>
                        <div className="flex flex-col items-center p-4"><div className="w-24 h-24 bg-[#ff764a] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">2</div><h4 className="font-bold text-lg mt-4 text-[#003f5c]">Toma de Esquejes</h4><p className="text-slate-600 mt-1 max-w-xs">Nunca retirar más del 30% de la masa foliar en una sola sesión.</p></div>
                        <div className="text-4xl text-slate-300 self-center hidden md:block mx-4">→</div><div className="text-4xl text-slate-300 self-center md:hidden my-2">↓</div>
                        <div className="flex flex-col items-center p-4"><div className="w-24 h-24 bg-[#ef5675] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">3</div><h4 className="font-bold text-lg mt-4 text-[#003f5c]">Poda de Raíces</h4><p className="text-slate-600 mt-1 max-w-xs">Cada 3-4 meses para rejuvenecer la planta y evitar que se vuelva radicularmente constreñida.</p></div>
                    </div>
                </section>
            </main>
        </>
    );
};

const DynamicInfographic: React.FC<{ infographic: Infographic }> = ({ infographic }) => {
    return (
        <div>
            <style>{infographic.htmlContent.style}</style>
            <div dangerouslySetInnerHTML={{ __html: infographic.htmlContent.body }} />
        </div>
    );
};

const Infographics: React.FC = () => {
    const { currentUser } = useAuth();
    const { infographics, saveInfographic, deleteInfographic } = useInfographics();
    const { showConfirmation } = useConfirmation();

    const [activeTabId, setActiveTabId] = useState<'elite' | 'mothers' | string>('elite');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInfographic, setEditingInfographic] = useState<Infographic | null>(null);
    
    const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

    const tabButtonClass = "py-2 px-4 font-semibold rounded-t-lg transition-colors focus:outline-none flex items-center gap-2 whitespace-nowrap";
    const activeTabClass = "bg-slate-100 text-[#003f5c]";
    const inactiveTabClass = "bg-[#003f5c] text-white hover:bg-opacity-80";
    
    const handleSave = (infographic: Infographic) => {
        saveInfographic(infographic);
        setIsModalOpen(false);
        setEditingInfographic(null);
        setActiveTabId(infographic.id); // Switch to the new/edited tab
    };
    
    const handleEdit = (e: React.MouseEvent, infographic: Infographic) => {
        e.stopPropagation();
        setEditingInfographic(infographic);
        setIsModalOpen(true);
    };

    const handleDelete = (e: React.MouseEvent, infographic: Infographic) => {
        e.stopPropagation();
        showConfirmation(`¿Estás seguro que quieres eliminar la infografía "${infographic.title}"?`, () => {
            if (activeTabId === infographic.id) {
                setActiveTabId('elite'); // Move to a safe tab before deleting
            }
            deleteInfographic(infographic.id);
        });
    };
    

    const allTabs = [
        { id: 'elite', title: 'Guía de Cultivo de Élite' },
        { id: 'mothers', title: 'Guía de Plantas Madre' },
        ...infographics,
    ];

    return (
        <div className="bg-slate-100 text-slate-800 -m-4 sm:-m-6 font-['Inter',_sans-serif]">
            <InfographicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} infographicToEdit={editingInfographic} />
            <div className="bg-[#003f5c] pt-4 px-4 sticky top-0 z-20">
                <div className="flex border-b-0 overflow-x-auto">
                    {allTabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`${tabButtonClass} ${activeTabId === tab.id ? activeTabClass : inactiveTabClass}`}
                        >
                            {tab.title}
                            {isAdmin && !['elite', 'mothers'].includes(tab.id) && (
                                <div className="flex gap-2 ml-2">
                                    <span onClick={(e) => handleEdit(e, tab as Infographic)} className="text-xs hover:text-yellow-400">✏️</span>
                                    <span onClick={(e) => handleDelete(e, tab as Infographic)} className="text-xs hover:text-red-400">🗑️</span>
                                </div>
                            )}
                        </button>
                    ))}
                    {isAdmin && (
                         <button
                            onClick={() => { setEditingInfographic(null); setIsModalOpen(true); }}
                            className={`${tabButtonClass} ${inactiveTabClass} bg-opacity-50`}
                        >
                            + Añadir Infografía
                        </button>
                    )}
                </div>
            </div>

            {activeTabId === 'elite' && <EliteGrowInfographic />}
            {activeTabId === 'mothers' && <MotherPlantsInfographic />}
            {infographics.map(info => activeTabId === info.id && <DynamicInfographic key={info.id} infographic={info} />)}

            <footer className="bg-[#003f5c] text-white p-4 text-center text-sm">
                <p>Infografía generada para Luis por María, Asistente Botánica.</p>
            </footer>
        </div>
    );
};

export default Infographics;