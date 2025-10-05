import { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { Crop } from '../types';

// Gemini API Call for Diagnosis
const runDiagnosis = async (ai: GoogleGenAI, base64Image: string, mimeType: string, notes: string) => {
    const imagePart = {
        inlineData: { mimeType, data: base64Image },
    };
    const textPart = {
        text: `Por favor, analiza esta imagen de una planta de cannabis y las siguientes notas para diagnosticar cualquier problema potencial. 
        Notas: "${notes}".
        Proporciona un diagnóstico detallado, una evaluación general de la salud y consejos preventivos.
        Responde ÚNICAMENTE con un objeto JSON que coincida con el esquema proporcionado.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    diagnosis: { type: Type.STRING, description: "Un diagnóstico detallado de cualquier problema encontrado." },
                    overall_health_assessment: { type: Type.STRING, description: "Un resumen del estado general de salud de la planta." },
                    preventative_tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Una lista de consejos prácticos para prevenir problemas futuros." }
                },
                required: ["diagnosis", "overall_health_assessment", "preventative_tips"]
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

// Gemini API Call for Prediction
const runPrediction = async (ai: GoogleGenAI, crop: Crop) => {
    const prompt = `
    Basado en los siguientes datos de cultivo de cannabis, predice el rendimiento final de la cosecha.
    - Genética: ${crop.geneticsId}
    - Días totales en vegetación: ${crop.flowerDate && crop.vegDate ? (new Date(crop.flowerDate).getTime() - new Date(crop.vegDate).getTime()) / (1000 * 3600 * 24) : 'N/A'}
    - Días en floración hasta ahora: ${crop.flowerDate ? (new Date().getTime() - new Date(crop.flowerDate).getTime()) / (1000 * 3600 * 24) : 'N/A'}
    - Número de plantas: ${crop.plantCounts.reduce((sum, pc) => sum + pc.count, 0)}
    - Datos de registro promedio (últimas 5 entradas):
        - Temp: ${crop.logEntries.slice(-5).reduce((acc, l) => acc + (l.environmental?.temp || 0), 0) / 5}°C
        - Humedad: ${crop.logEntries.slice(-5).reduce((acc, l) => acc + (l.environmental?.humidity || 0), 0) / 5}%
        - PPM: ${crop.logEntries.slice(-5).reduce((acc, l) => acc + (l.irrigation?.ppm || 0), 0) / 5}
    
    Proporciona un rango de rendimiento previsto en gramos, tu razonamiento y un nivel de confianza.
    Responde ÚNICAMENTE con un objeto JSON que coincida con el esquema proporcionado.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    yield_range: { type: Type.STRING, description: "Rango de rendimiento previsto, ej., '450g - 550g'." },
                    reasoning: { type: Type.STRING, description: "Explicación de la predicción." },
                    confidence_level: { type: Type.STRING, description: "Confianza en la predicción (ej., Alta, Media, Baja)." }
                },
                required: ["yield_range", "reasoning", "confidence_level"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


const handler: Handler = async (event: HandlerEvent) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable is not set.");
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Configuration error on the server." })
        };
    }
    
    const ai = new GoogleGenAI({ apiKey });

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Request body is missing." })
            };
        }
        const body = JSON.parse(event.body);
        const { action } = body;

        if (action === 'diagnose') {
            const { image, mimeType, notes } = body;
            const result = await runDiagnosis(ai, image, mimeType, notes);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        } else if (action === 'predict') {
            const { crop } = body;
            const result = await runPrediction(ai, crop);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Invalid action specified." })
            };
        }

    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to process the request." })
        };
    }
};

export { handler };
