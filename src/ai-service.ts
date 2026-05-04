import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ExtractedEditalInfo {
  prazo_inscricao?: string;
  valor_disponivel?: string;
  requisitos?: string;
  area_cultural?: string;
  resumo?: string;
  palavras_chave?: string[];
  publico_alvo?: string;
}

// Verificar quais modelos estão disponíveis
export async function listAvailableModels() {
  try {
    const models = await anthropic.models.list();
    console.log('📋 Modelos disponíveis na Anthropic:');
    models.data.forEach((model: any) => {
      console.log(`  - ${model.id} (${model.display_name})`);
    });
    return models.data;
  } catch (error) {
    console.error('Erro ao listar modelos:', error);
    return [];
  }
}

export async function extractEditalInfo(texto: string): Promise<ExtractedEditalInfo> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️ ANTHROPIC_API_KEY não configurada, retornando dados vazios');
    return {};
  }

  try {
    // Primeiro listar modelos disponíveis
    const models = await anthropic.models.list();
    const availableModel = models.data.find((m: any) => m.id.includes('sonnet') || m.id.includes('claude'));
    
    if (!availableModel) {
      console.error('❌ Nenhum modelo Claude disponível na conta');
      return {};
    }

    console.log(`🤖 Usando modelo: ${availableModel.id}`);

    const response = await anthropic.messages.create({
      model: availableModel.id,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Analise o seguinte texto de um edital cultural e extraia as informações em formato JSON:

INSTRUÇÕES:
1. Identifique a data limite de inscrição (prazo_inscricao) no formato YYYY-MM-DD. Procure por termos como "prazo", "inscrições até", "encerra em", "deadline".
2. Extraia o valor disponível ou valor da bolsa (valor_disponivel). Procure por "R$", "bolsa", "valor", "fomento".
3. Resuma os requisitos principais em até 500 caracteres (requisitos). Inclua quem pode se inscrever, documentação necessária.
4. Classifique a área cultural: musica, teatro, danca, artes-visuais, literatura, audiovisual, ou outros (area_cultural).
5. Crie um resumo conciso do edital em até 300 caracteres (resumo).
6. Identifique palavras-chave importantes do edital (palavras_chave) - array de até 8 palavras relevantes.
7. Se possível, extraia o público-alvo (publico_alvo).

RETORNE APENAS JSON válido sem formatação adicional:
{
  "prazo_inscricao": "YYYY-MM-DD ou null",
  "valor_disponivel": "valor ou null",
  "requisitos": "resumo dos requisitos ou null",
  "area_cultural": "uma das opções válidas",
  "resumo": "resumo do edital",
  "palavras_chave": ["palavra1", "palavra2", ...],
  "publico_alvo": "público alvo ou null"
}

Texto do edital:
${texto.substring(0, 12000)}`
        }
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return extracted;
      }
    }
    return {};
  } catch (error) {
    console.error('Erro ao extrair informações com IA:', error);
    return {};
  }
}

export async function summarizeEdital(titulo: string, texto: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return '';
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `Crie um resumo conciso do edital cultural em até 100 caracteres.

Título: ${titulo}
Texto: ${texto.substring(0, 2000)}`
        }
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    return '';
  } catch (error) {
    console.error('Erro ao resumir edital:', error);
    return '';
  }
}
