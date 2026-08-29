import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type WorkersAI = {
  run: (model: string, input: Record<string, unknown>) => Promise<any>;
};

type EvootAIEnv = { AI?: WorkersAI };

export async function POST(request: Request) {
  try {
    const { question, answers, distribution, objective } = await request.json();
    const { env } = getCloudflareContext();
    const ai = (env as unknown as EvootAIEnv).AI;

    if (!ai) {
      return NextResponse.json({ error: 'Workers AI n’est pas disponible dans le runtime Cloudflare.' }, { status: 500 });
    }

    const result = await ai.run('@cf/google/gemma-4-26b-a4b-it', {
      messages: [
        {
          role: 'system',
          content: 'Tu es Assistant ÉVOOT, copilote privé d’un formateur en entreprise. Analyse uniquement les résultats agrégés du groupe. Ne diagnostique personne, ne juge pas les participants et ne présente pas ceci comme de la psychothérapie. Réponds en français québécois professionnel et naturel. Donne exactement 3 pistes très courtes et concrètes pour guider la discussion. Favorise la curiosité, la réflexion et l’efficacité relationnelle plutôt que la recherche d’une bonne réponse.'
        },
        {
          role: 'user',
          content: `Objectif pédagogique: ${objective}\nQuestion: ${question}\nChoix: ${answers.map((a:string,i:number)=>`${i+1}. ${a}`).join(' | ')}\nDistribution des réponses: ${distribution.map((n:number,i:number)=>`${i+1}: ${n}`).join(', ')}`
        }
      ],
      max_tokens: 220,
      chat_template_kwargs: { enable_thinking: false }
    });

    const text = typeof result?.response === 'string'
      ? result.response
      : result?.choices?.[0]?.message?.content;

    if (!text) return NextResponse.json({ error: 'Aucune suggestion générée par Workers AI.' }, { status: 502 });
    return NextResponse.json({ suggestion: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: `Assistant ÉVOOT indisponible: ${message}` }, { status: 500 });
  }
}
