import { Configuration, OpenAIApi } from 'openai'
import { envFile } from './config.js'
const apiKey = envFile.OPENAI_API_KEY
export const _model = [
  [
    'text-davinci-003',
    'text-curie-001',
    'text-babbage-001',
    'text-ada-001',
    'code-davinci-002',
    'code-cushman-001'
  ],
  [
    'GPT-3 - Most capable model in the GPT-3 series. Can perform any task the other GPT-3 models can, often with higher quality, longer output and better instruction-following. It can process up to 4,000 tokens per request. \n\nSTRENGTHS\n Complex intent, cause and effect, creative generation, search, summarization for audience.',
    'GPT-3 - Very capable, but faster and lower cost than text-davinci-003. \n\nSTRENGTHS\n Language translation, complex, classification, sentiment, summarization.',
    'GPT-3 - Capable of straightforward tasks, very fast, and lower cost. \n\nSTRENGTHS\n Moderate classification, semantic search.',
    'GPT-3 - Capable of simple tasks, ussuarlly the fastest model in the GPT-3 series, and lowest cost.\n\nSTRENGTHS\n Parsing text, simple classification, address correction, keywords.',
    'CODEX - Most capable model in the Codex series, which can understand and generate code, including translating natural language to code, It can process up to 4,000 tokens per request.\n\nOur JavaScript Sandbox demo application uses this model to translate instructions into JS.',
    'CODEX - Almost as capable as code-davinci-002, but slightly faster. Part of the Codex series, which can understand and generate code.\n\nOur JavaScript Sandbox demo application uses this model to translate instructions into JS.\n\nSTRENGTHS\nReal-time applications where low latency is preferable.'
  ]
]
export const _temperatures = { min: 0, max: 1 }
export const _maxTokens = { min: 1, max: 8000 }
export const _topP = { min: 0, max: 1 }
export const _frequencyPenalty = { min: 0, max: 2 }
export const _presencePenalty = { min: 0, max: 2 }
export const _showResult = [
  ['next_to', 'side', 'inline'],
  [
    'Show result in other tab over the same group.',
    'Show result on the side in a new group in a new tab.',
    'Show result inline.'
  ]
]
export const _lang = [
  ['EN', 'ES'],
  ['English', 'Spanish']
]
export const executeAI = async (
  text,
  args = {
    model: 'text-davinci-003',
    temperature: 0,
    maxTokens: 512, // old 256
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    showResult: 'side'
  }
) => {
  const {
    model,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty
  } = args

  return new Promise((resolve, reject) => {
    const confAI = new Configuration({ apiKey })
    const openai = new OpenAIApi(confAI)
    try {
      (async () => {
        const completion = await openai.createCompletion({
          model,
          prompt: text,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          stop: ['"""']
        })
        if (completion.status === 200) {
          resolve(completion.data)
        } else {
          reject(completion)
        }
      })()
    } catch (e) {
      reject(e)
    } finally {
      (async () => await Promise.resolve())()
    }
  })
}
