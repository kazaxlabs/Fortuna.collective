import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";

// Initialize gracefully to prevent crashing local dev servers if the .env file is missing
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : ({} as any);

export enum AgentRole {
  GOVERNOR = "governor",
  PILLAR = "pillar",
  AUDITOR = "auditor",
  ADMIN_AUDITOR = "admin_auditor"
}

export enum NicheGroup {
  SALES = "Sales & Marketing",
  MEDIA = "Media & Advertising",
  FINANCE = "Finance & Trading",
  LAW = "Law",
  REAL_ESTATE = "Real Estate",
  TRADES = "Trades & Construction",
  HOSPITALITY = "Hospitality"
}

// 1. The Governor: Global Orchestrator (Gemini 1.5 Pro)
export const runGovernor = async (newPost: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze this post for potential cross-pillar connections in the FORTUNA network:
      Content: ${newPost.content}
      Author Niche: ${newPost.nicheGroup}
      
      If a connection is found, suggest a CONNECTION_PROPOSAL.`,
      config: {
        systemInstruction: "You are the FORTUNA Governor. Your goal is to identify high-value connections between different industry pillars.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            connectionFound: { type: Type.BOOLEAN },
            targetNiche: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text);
    if (result.connectionFound) {
      await addDoc(collection(db, "action_proposals"), {
        type: "CONNECTION_PROPOSAL",
        proposerId: "governor_agent",
        affectedUserId: newPost.authorUid,
        data: result,
        status: "pending",
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Governor error:", error);
  }
};

// 2. Pillar Agents: Intent Extraction (Gemini 1.5 Flash)
export const runPillarAgent = async (text: string, niche: NicheGroup) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract business intent from this text for the ${niche} pillar:
      Text: ${text}`,
      config: {
        systemInstruction: `You are a Pillar Agent for ${niche}. Extract leads, costs, and status into structured data.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            entities: { type: Type.ARRAY, items: { type: Type.STRING } },
            value: { type: Type.NUMBER }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Pillar Agent error:", error);
    return null;
  }
};

// 3. Niche Auditors: Shadow Moderation (Gemini 1.5 Flash)
export const runNicheAuditor = async (text: string, niche: NicheGroup, authorUid: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Check for policy violations in this ${niche} post:
      Text: ${text}`,
      config: {
        systemInstruction: `You are a Niche Auditor for ${niche}. Check for poaching, misrepresentation, or PII leaks.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            violationFound: { type: Type.BOOLEAN },
            violationType: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
            explanation: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text);
    if (result.violationFound) {
      if (result.severity === "critical" || result.severity === "high") {
        await runAdminAuditor(authorUid, result);
      } else {
        await addDoc(collection(db, "action_proposals"), {
          type: "POLICY_ALIGNMENT",
          proposerId: `auditor_${niche}`,
          affectedUserId: authorUid,
          data: result,
          status: "pending",
          createdAt: serverTimestamp()
        });
      }
    }
    return result;
  } catch (error) {
    console.error("Niche Auditor error:", error);
    return null;
  }
};

// 4. Administrative Auditors: Security & Investigation (Gemini 1.5 Pro)
export const runAdminAuditor = async (userId: string, violation: any) => {
  try {
    // Compile evidence
    await addDoc(collection(db, "evidence_ledger"), {
      userId,
      agentId: "admin_auditor",
      violationType: violation.violationType,
      evidence: violation.explanation,
      severity: violation.severity,
      createdAt: serverTimestamp()
    });

    // Propose disciplinary action
    await addDoc(collection(db, "action_proposals"), {
      type: violation.severity === "critical" ? "BAN_INITIATION" : "PROVISIONAL_HOLD",
      proposerId: "admin_auditor",
      affectedUserId: userId,
      data: violation,
      status: "pending",
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Admin Auditor error:", error);
  }
};
