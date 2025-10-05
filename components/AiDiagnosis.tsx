
import React, { useState, useCallback } from 'react';
import Card from './ui/Card';
import Spinner from './ui/Spinner';
import { diagnosePlantIssue } from '../services/geminiService';
import { DiagnosisResult } from '../types';
import CameraModal from './ui/CameraModal';

const AiDiagnosis: React.FC = () => {
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (dataUrl: string) => {
      const base64String = dataUrl.split(',')[1];
      setImageBase64(base64String);
      setImageMimeType('image/jpeg');
      setImagePreview(dataUrl);
      setIsCameraOpen(false);
  }

  const handleDiagnose = useCallback(async () => {
    if (!imageBase64 || !imageMimeType) {
      setError('Por favor, selecciona o captura una imagen primero.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const diagnosisResult = await diagnosePlantIssue(imageBase64, imageMimeType, notes);
      setResult(diagnosisResult);
    } catch (err) {
      setError('Ocurrió un error al obtener el diagnóstico. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageBase64, imageMimeType, notes]);

  return (
    <>
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-text-primary">Diagnóstico de Plantas con IA</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-primary">1. Subir o Tomar Foto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Opción 1: Subir Archivo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
               <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Opción 2: Usar Cámara</label>
                  <button onClick={() => setIsCameraOpen(true)} className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary font-bold rounded-md transition-colors">
                      Tomar Foto
                  </button>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Vista previa de la planta" className="rounded-lg max-h-60 w-auto mx-auto" />
                </div>
              )}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-2">Notas Adicionales</label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ej., Hojas amarillentas en las ramas inferiores, se observan pequeñas manchas blancas."
                  className="w-full px-3 py-2 bg-white border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleDiagnose}
                disabled={isLoading || !imageBase64}
                className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Spinner /> : 'Diagnosticar Planta'}
              </button>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-primary">2. Resultado del Diagnóstico</h2>
            {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {result && (
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="font-bold text-lg text-text-primary">Salud General</h3>
                  <p>{result.overall_health_assessment}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary">Diagnóstico</h3>
                  <p>{result.diagnosis}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary">Consejos Preventivos</h3>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    {result.preventative_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted">Tu diagnóstico aparecerá aquí.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default AiDiagnosis;
