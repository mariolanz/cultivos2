import { DiagnosisResult, HarvestPrediction, Crop } from '../types';

const callGeminiFunction = async (body: object) => {
    // The endpoint for Netlify Functions is /.netlify/functions/your-function-name
    const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido del servidor' }));
        throw new Error(errorData.error || `Error del servidor: ${response.statusText}`);
    }

    return response.json();
};


export const diagnosePlantIssue = async (base64Image: string, mimeType: string, notes: string): Promise<DiagnosisResult> => {
    try {
        const result = await callGeminiFunction({
            action: 'diagnose',
            image: base64Image,
            mimeType: mimeType,
            notes: notes,
        });
        return result as DiagnosisResult;
    } catch (error) {
        console.error("Error in diagnosePlantIssue:", error);
        throw new Error("No se pudo obtener el diagnóstico del modelo de IA.");
    }
};

export const predictHarvestYield = async (crop: Crop): Promise<HarvestPrediction> => {
    try {
        const result = await callGeminiFunction({
            action: 'predict',
            crop: crop,
        });
        return result as HarvestPrediction;
    } catch (error) {
        console.error("Error in predictHarvestYield:", error);
        throw new Error("No se pudo obtener la predicción de cosecha del modelo de IA.");
    }
};
