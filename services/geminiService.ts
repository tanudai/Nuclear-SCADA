
import { GoogleGenAI } from "@google/genai";
import { PlantData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiDiagnosis = async (data: PlantData): Promise<string> => {
  const prompt = `
    You are a senior nuclear power plant operations engineer AI assistant.
    Analyze the following SCADA data from a nuclear reactor and provide a concise diagnosis and recommended actions.
    Format the response as Markdown.

    **Current SCADA Data:**
    - Reactor Core Temperature: ${data.reactorTemperature.toFixed(2)} °C
    - Coolant System Pressure: ${data.coolantPressure.toFixed(2)} bar
    - Turbine Speed: ${data.turbineRPM} RPM
    - Generator Power Output: ${data.powerOutput.toFixed(2)} MW
    - Control Rod Insertion: ${data.controlRodPosition.toFixed(2)}%
    - Radiation Levels: ${data.radiationLevel.toFixed(4)} mSv/h
    - Overall Plant Status: ${data.overallStatus}

    **Your Task:**
    1.  **Diagnosis:** Briefly explain the current situation and potential risks based on the data.
    2.  **Recommendations:** Provide a bulleted list of immediate actions to take to stabilize the plant or optimize its performance.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching AI diagnosis:", error);
    return "Error: Could not retrieve diagnosis from AI assistant. Please check console for details.";
  }
};

export const getAiEmergencyProcedure = async (data: PlantData): Promise<string> => {
  const prompt = `
    You are an AI assistant providing Emergency Operating Procedures (EOPs) for a nuclear power plant control room operator.
    The plant is currently in a '${data.overallStatus}' state.
    Analyze the following critical SCADA data and provide a clear, concise, step-by-step emergency procedure to stabilize the situation.
    The procedure must be formatted as a numbered list in Markdown.

    **Current Critical Data:**
    - Overall Plant Status: ${data.overallStatus}
    - Reactor Core Temperature: ${data.reactorTemperature.toFixed(2)} °C
    - Coolant System Pressure: ${data.coolantPressure.toFixed(2)} bar
    - Coolant Flow Rate: ${data.coolantFlow.toFixed(2)} m³/s
    - Containment Pressure: ${data.containmentPressure.toFixed(3)} atm
    - Radiation Levels: ${data.radiationLevel.toFixed(4)} mSv/h
    - ECCS Status: ${data.eccsStatus}

    **Your Task:**
    Generate a numbered list of immediate actions for the operator to take. Prioritize actions that ensure reactor safety first. Be direct and use clear, unambiguous language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching AI emergency procedure:", error);
    return "Error: Could not retrieve EOP from AI assistant. Please refer to standard operating procedures.";
  }
};
