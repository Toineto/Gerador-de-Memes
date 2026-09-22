import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const TEXT_MULTIMODAL_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.1-pro-preview',
];

async function callGeminiWithFallback<T>(
  fn: (model: string) => Promise<T>,
  models = TEXT_MULTIMODAL_MODELS,
): Promise<T> {
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await fn(model);
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || '';
        const msg = err?.message || String(err);
        console.warn(`[Gemini] Modelo ${model} falhou (tentativa ${attempt}):`, msg);

        if (msg.includes('429') || msg.includes('Quota exceeded') || status === 'RESOURCE_EXHAUSTED') {
          break;
        }

        if (msg.includes('503') || status === 'UNAVAILABLE') {
          if (attempt < 2) {
            await new Promise((res) => setTimeout(res, 800));
          }
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error('Todos os modelos Gemini disponíveis falharam.');
}

function parseBase64Image(dataUri: string): { mimeType: string; base64Data: string } {
  const match = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64Data: match[2] };
  }
  return { mimeType: 'image/jpeg', base64Data: dataUri };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/magic-captions', async (req, res) => {
  try {
    const { imageBase64, style = 'balanced', customContext = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Os dados da imagem são obrigatórios.' });
    }

    const { mimeType, base64Data } = parseBase64Image(imageBase64);
    const ai = getGeminiClient();

    const styleGuide: Record<string, string> = {
      balanced: 'Uma ótima mistura de humor espirituoso, cotidiano, irônico e cultura clássica da internet e memes brasileiros.',
      work_corporate: 'Vida corporativa, reuniões infinitas no Teams/Meet, mensagens no Slack/WhatsApp de trabalho, prazos apertados e desespero de CLT.',
      tech_coding: 'Bugs de programação, IA substituindo devs, deploy em produção na sexta-feira, Stack Overflow e guerra frontend vs backend.',
      relatable_everyday: 'Procrastinação, boleto chegando, preguiça, perrengues do dia a dia, café e ansiedade.',
      sarcastic_ironic: 'Sarcasmo afiado, ironia debochada, verdades inconvenientes e bom humor ácido.',
      absurdist_genz: 'Humor caótico, zoeira nonsense, gírias da internet brasileira e energia caótica.',
      wholesome: 'Humor fofo, carinhoso, mensagens reconfortantes e fofura.',
    };

    const prompt = `
Você é um mestre brasileiro na criação de memes virais e gênio do humor da internet brasileira.
Analise detalhadamente a imagem fornecida: examine as expressões faciais, linguagem corporal, cenário, clima, objetos e dinâmica visual cômica.

Gere exatamente 5 legendas de meme hilárias, inéditas e extremamente contextuais para esta imagem.
IMPORTANTE: As legendas DEVEM ser geradas em PORTUGUÊS DO BRASIL (pt-BR), usando humor natural brasileiro, termos e gírias da internet onde couber de forma autêntica.
Estilo/Tom solicitado: ${styleGuide[style] || styleGuide.balanced}.
${customContext ? `Tópico ou contexto específico sugerido pelo usuário: "${customContext}".` : ''}

Cada legenda DEVE conter:
- topText: Texto superior de preparação da piada (geralmente 2 a 8 palavras, estilo de meme, ou vazio se for apenas a punchline embaixo)
- bottomText: O desfecho cômico / punchline (geralmente 2 a 10 palavras, muito engraçado)
- tag: Categoria curta da piada em português (ex: "CLT / Trabalho", "Dev / Tech", "Vida Real", "Sarcasmo", "Boleto", "Caos")
- explanation: Uma frase curta em português explicando por que essa piada casa perfeitamente com a expressão ou imagem.

Retorne exatamente 5 opções em formato JSON estruturado.
`;

    const response = await callGeminiWithFallback(async (model) => {
      return await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'Array de 5 opções de legendas engraçadas de meme',
            items: {
              type: Type.OBJECT,
              properties: {
                topText: {
                  type: Type.STRING,
                  description: 'Texto superior de introdução do meme',
                },
                bottomText: {
                  type: Type.STRING,
                  description: 'Texto inferior com o desfecho cômico do meme',
                },
                tag: {
                  type: Type.STRING,
                  description: 'Etiqueta curta de 1 a 2 palavras com a categoria do humor',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Breve explicação de por que a piada combina com a expressão da imagem',
                },
              },
              required: ['topText', 'bottomText', 'tag', 'explanation'],
            },
          },
        },
      });
    });

    const responseText = response.text ? response.text.trim() : '';
    if (!responseText) {
      throw new Error('Falha ao gerar legendas com os modelos Gemini.');
    }

    const captions = JSON.parse(responseText).map((cap: any, index: number) => ({
      id: `cap-${Date.now()}-${index}`,
      topText: cap.topText || '',
      bottomText: cap.bottomText || '',
      tag: cap.tag || 'Cotidiano',
      explanation: cap.explanation || 'Combina perfeitamente com a expressão da foto.',
    }));

    res.json({ captions });
  } catch (error: any) {
    console.error('Erro em /api/magic-captions:', error);
    res.status(500).json({
      error: error.message || 'Erro interno ao gerar as legendas mágicas',
    });
  }
});

app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Os dados da imagem são obrigatórios.' });
    }

    const { mimeType, base64Data } = parseBase64Image(imageBase64);
    const ai = getGeminiClient();

    const prompt = `
Analise esta imagem detalhadamente avaliando seu potencial para meme e contexto cômico.
Forneça uma análise perspicaz, divertida e completa EM PORTUGUÊS DO BRASIL (pt-BR):
1. visualSummary: Uma descrição concisa e bem-humorada do que está acontecendo na imagem (em português).
2. charactersAndMood: Análise das expressões faciais dos personagens, postura e clima emocional (em português).
3. humorBreakdown: Por que esta imagem é naturalmente engraçada ou tem potencial para meme (contraste, ironia, exagero, desespero identificável) (em português).
4. viralityScore: Uma pontuação realista de 1 a 100 para o potencial de viralização do meme.
5. targetCommunities: Uma lista de 3 a 5 comunidades/redes onde este meme faria sucesso (ex: "Twitter / X Brasil", "r/brasil", "Grupos de WhatsApp da Firma", "LinkedIn Brasil", "TikTok").
6. alternativeAngles: Uma lista de 3 ideias ou situações criativas diferentes para transformar esta foto em um meme viral (em português).
`;

    const response = await callGeminiWithFallback(async (model) => {
      return await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              visualSummary: { type: Type.STRING },
              charactersAndMood: { type: Type.STRING },
              humorBreakdown: { type: Type.STRING },
              viralityScore: { type: Type.INTEGER },
              targetCommunities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              alternativeAngles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'visualSummary',
              'charactersAndMood',
              'humorBreakdown',
              'viralityScore',
              'targetCommunities',
              'alternativeAngles',
            ],
          },
        },
      });
    });

    const responseText = response.text ? response.text.trim() : '';
    if (!responseText) {
      throw new Error('Falha ao analisar a imagem com os modelos Gemini.');
    }

    const analysis = JSON.parse(responseText);
    res.json({ analysis });
  } catch (error: any) {
    console.error('Erro em /api/analyze-image:', error);
    res.status(500).json({
      error: error.message || 'Erro interno ao analisar a imagem',
    });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'O texto descritivo (prompt) é obrigatório.' });
    }

    const ai = getGeminiClient();

    const memePrompt = `Meme photo template: ${prompt}. Cinematic lighting, expressive facial expressions, high detail, clean composition suitable for meme text overlay. No text or watermarks in the image.`;

    let generatedImageUrl: string | null = null;
    const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'];

    for (const model of imageModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ text: memePrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: (['1:1', '3:4', '4:3', '16:9', '9:16'].includes(aspectRatio)
                ? aspectRatio
                : '1:1') as any,
              imageSize: '1K',
            },
          },
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (generatedImageUrl) {
          break;
        }
      } catch (err) {
        console.warn(`[Gemini Image] Modelo ${model} falhou:`, err);
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: 'Não foi possível gerar a imagem. Tente um texto descritivo diferente ou tente novamente.',
      });
    }

    res.json({ imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error('Erro em /api/generate-image:', error);
    res.status(500).json({
      error: error.message || 'Falha ao gerar imagem de meme',
    });
  }
});

export default app;
