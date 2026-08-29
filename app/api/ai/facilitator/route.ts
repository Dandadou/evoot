import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, answers, distribution, objective } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY manquante.' }, { status: 500 });

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        input: [
          { role: 'developer', content: 'Tu es Assistant ÉVOOT, copilote privé d’un formateur en entreprise. Analyse uniquement les résultats agrégés du groupe. Ne diagnostique personne, ne juge pas les participants et ne présente pas ceci comme de la psychothérapie. Réponds en français québécois professionnel et naturel. Donne exactement 3 pistes très courtes et concrètes pour guider la discussion. Favorise la curiosité, la réflexion et l’efficacité relationnelle plutôt que la recherche d’une bonne réponse.' },
          { role: 'user', content: `Objectif pédagogique: ${objective}\nQuestion: ${question}\nChoix: ${answers.map((a:string,i:number)=>`${i+1}. ${a}`).join(' | ')}\nDistribution des réponses: ${distribution.map((n:number,i:number)=>`${i+1}: ${n}`).join(', ')}` }
        ],
        max_output_tokens: 220
      })
    });

    const data:any = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || 'Erreur OpenAI.' }, { status: response.status });
    const text = data.output?.flatMap((item:any)=>item.content || []).find((item:any)=>item.type === 'output_text')?.text;
    if (!text) return NextResponse.json({ error: 'Aucune suggestion générée.' }, { status: 502 });
    return NextResponse.json({ suggestion: text });
  } catch {
    return NextResponse.json({ error: 'Impossible de générer les pistes ÉVOOT.' }, { status: 500 });
  }
}
