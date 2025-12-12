import { GoogleGenAI } from "@google/genai";
import { Trip, Staff } from "../types";

const SYSTEM_INSTRUCTION = `
Você é um consultor especialista em logística e finanças para pequenas empresas de transporte.
Seu objetivo é analisar dados de viagens, custos e desempenho da equipe para fornecer insights acionáveis.
Foque em:
1. Lucratividade por KM.
2. Identificação de gastos excessivos com ajudantes ou combustível.
3. Sugestões de otimização.
Responda sempre em Português do Brasil, de forma profissional e direta. Use formatação Markdown.
`;

export const analyzeBusinessData = async (trips: Trip[], staff: Staff[]) => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing for Gemini");
    return "API Key não configurada.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare data summary to save tokens
    const summary = trips.map(t => ({
      date: t.date,
      type: t.type,
      km: t.distanceKm,
      rev: t.revenue,
      cost: t.fuelCost + t.driverCost + t.helperCost + t.otherCost,
      isWeekend: t.isWeekend
    }));

    const prompt = `
      Analise os dados destas viagens recentes da minha transportadora:
      ${JSON.stringify(summary, null, 2)}
      
      Por favor, me dê 3 insights principais sobre onde posso economizar ou aumentar meu lucro.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Ocorreu um erro ao tentar analisar seus dados.";
  }
};

export const estimateDistance = async (origin: string, destination: string): Promise<number> => {
   if (!process.env.API_KEY) return 0;

   try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Qual é a distância rodoviária aproximada em KM entre ${origin} e ${destination} no Brasil?
    Responda APENAS com o número (ex: 15.5). Não escreva texto.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text || "";
    // Extract number from string (e.g., "Aprox 150km" -> 150)
    const matches = text.match(/(\d+[.,]?\d*)/);
    if (matches && matches[0]) {
       return parseFloat(matches[0].replace(',', '.'));
    }
    return 0;
   } catch (e) {
     console.error(e);
     return 0;
   }
}