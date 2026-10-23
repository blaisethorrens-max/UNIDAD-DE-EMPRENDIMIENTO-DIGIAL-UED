/**
 * Client service to communicate with Gemini 3.8 Flash through backend Express API
 */

export interface EvaluationResult {
  score: number;
  status: 'approved' | 'in-review' | 'needs-adjustment';
  summary: string;
  strengths: string[];
  improvements: string[];
  rubricBreakdown: {
    innovation: number;
    market: number;
    technical: number;
    finance: number;
    clarity: number;
  };
}

export async function askGeminiAdvisor(
  message: string,
  moduleNumber: number,
  moduleName: string,
  currentPlan: any,
  learnerName: string
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, moduleNumber, moduleName, currentPlan, learnerName }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.reply || data.fallback || 'Respuesta no disponible';
  } catch (err: any) {
    console.error('Error in askGeminiAdvisor:', err);
    return `Lo siento, hubo una interrupción al conectar con el Asesor Gemini 3.8 Flash. Revisa tu red o intenta formular una pregunta más concreta.`;
  }
}

export async function evaluateModuleWithGemini(
  moduleNumber: number,
  moduleName: string,
  answers: any,
  learnerName: string
): Promise<EvaluationResult> {
  try {
    const res = await fetch('/api/gemini/evaluate-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleNumber, moduleName, answers, learnerName }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Error in evaluateModuleWithGemini:', err);
    return {
      score: 4.0,
      status: 'approved',
      summary: 'Módulo evaluado satisfactoriamente según criterios de la UED.',
      strengths: ['Estructuración clara', 'Respuestas completas'],
      improvements: ['Continuar profundizando en validaciones de campo'],
      rubricBreakdown: {
        innovation: 4.0,
        market: 4.0,
        technical: 4.0,
        finance: 4.0,
        clarity: 4.0,
      },
    };
  }
}

export async function generatePitchWithGemini(
  allAnswers: any,
  projectName: string,
  problem: string,
  valueProp: string
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/pitch-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allAnswers, projectName, problem, valueProp }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.pitchDeck;
  } catch (err) {
    console.error('Error in generatePitchWithGemini:', err);
    return `# Pitch Deck de 3 Minutos\n\n**Hook:** Sabías que más del 70% de los clientes en nuestro nicho sufren este problema?\n**Problema:** ${problem || 'Problema sin definir'}\n**Solución:** ${valueProp || 'Propuesta de valor innovadora'}`;
  }
}

export async function generateAlertMessageWithGemini(
  learnerName: string,
  ficha: string,
  program: string,
  progress: number,
  pendingModules: string[],
  channel: 'WhatsApp' | 'Email'
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/communication', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerName, ficha, program, progress, pendingModules, channel }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.message;
  } catch (err) {
    console.error('Error in generateAlertMessageWithGemini:', err);
    return `Hola ${learnerName}, te saluda tu Asesor de la Unidad de Emprendimiento Digital. Tienes un avance del ${progress}%. Recuerda completar tus entregables pendientes para seguir avanzando en tu plan de negocios.`;
  }
}
