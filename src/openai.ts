/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OpenAI = require("openai")

import {
  getEquityDetails,
  getEquityDetailsTool,
  getMarketStatus,
  getMarketStatusTool,
  getAllIndices,
  getAllIndicesTool,
  getEquityMaster,
  getEquityMasterTool,
  getEquityStockIndices,
  getEquityStockIndicesTool
} from './tools'

export type Message = {
  "tool_call_id"?: string,
  "role": "system" | "user" | "assistant" | "function" | "tool",
  "name"?: string,
  "content": {
    "type": "text",
    "text": string
  }[] | string
}

export type UsageInfo = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  prompt_tokens_details: {
    cached_tokens: number
    audio_tokens: number
  }
  completion_tokens_details: {
    reasoning_tokens: number
    audio_tokens: number
    accepted_prediction_tokens: number
    rejected_prediction_tokens: number
  }}

const avaialbeFunctions: { [key: string]: CallableFunction } = {
  getEquityDetails,
  getMarketStatus,
  getAllIndices,
  getEquityMaster,
  getEquityStockIndices
}

const tools = [
  getEquityDetailsTool,
  getMarketStatusTool,
  getAllIndicesTool,
  getEquityMasterTool,
  getEquityStockIndicesTool
]

export const getUsageCost = (usage: UsageInfo[]): {combinedUsage: any,
   unCachedInputCost: number, cachedInputCost: number, outputCost: number, totalCost: number} => {
  const combinedUsage = { promptTokens: 0,
     completionTokens: 0, totalTokens: 0, cachedInputTokens: 0, uncachedInputTokens: 0 }
  usage.forEach((u) => {
      combinedUsage.promptTokens += u.prompt_tokens
      combinedUsage.completionTokens += u.completion_tokens
      combinedUsage.totalTokens += u.total_tokens
      combinedUsage.cachedInputTokens += u.prompt_tokens_details.cached_tokens
  })
  combinedUsage.uncachedInputTokens = combinedUsage.promptTokens - combinedUsage.cachedInputTokens
  
  const unCachedInputPrice = 0.15 / 1000000
  const cachedInputPrice = 0.075 / 1000000
  const outputPrice = 0.6 / 1000000

  const unCachedInputCost = combinedUsage.uncachedInputTokens * unCachedInputPrice
  const cachedInputCost = combinedUsage.cachedInputTokens * cachedInputPrice
  const outputCost = combinedUsage.completionTokens * outputPrice
  const totalCost = unCachedInputCost + cachedInputCost + outputCost
  return {combinedUsage, unCachedInputCost, cachedInputCost, outputCost, totalCost}
}

async function getChatCompletion(messages: Message[]): Promise<any> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0,
    max_tokens: 4000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    tools,
  });
  return response
}

const getToolResponses = async (responseMessage: any) => {
  const toolCallResponses: Message[] = await Promise.all(responseMessage.tool_calls.map(async (toolCall: any) => {
    const fnName = toolCall.function.name
    const args = JSON.parse(toolCall.function.arguments)
    const fnToCall = avaialbeFunctions[fnName]
    if (fnToCall) {
      console.log(`Calling ${fnName} with args ${JSON.stringify(args)}`);
      const fnResponse = await fnToCall(args)
      // console.log(`Got response:\n${JSON.stringify(fnResponse,null,2)}`);
      let content = JSON.stringify(fnResponse)
      console.log(`Content Length: ${content.length}`)
      if (content.length > 100000){
        console.log(`Content too long, skipping for ${fnName} with args ${JSON.stringify(args)}`);
        content = ""
      }
      const message: Message = {
        tool_call_id: toolCall.id,
        role: "tool",
        name: fnName,
        content,
      }
      return message
    }
  }))
  return toolCallResponses.filter(message => message !== undefined)
}

async function runConversation(messages: Message[],usage?: UsageInfo[]): Promise<string> {
  let finishReason = ''
  let content = ''
  do {
    const response = await getChatCompletion(messages)
    console.log('Got response from GPT.');
    // console.log(JSON.stringify(response,null,2))
    if (usage) {
      usage.push(response.usage)
    }
    finishReason = response.choices[0].finish_reason
    const responseMessage = response.choices[0].message
    content = responseMessage.content
    messages.push(responseMessage)
    if (responseMessage.tool_calls?.length) {
      console.log(`Tool Calls Count: ${responseMessage.tool_calls.length}`);
      const toolCallResponses = await getToolResponses(responseMessage)
      messages.push(...toolCallResponses)
    } else {
      return content
    }
  } while (finishReason === 'tool_calls');
  return content
}

const appendMessage = (messages: Message[], query: string, role: 'user'|'system'|'assistant' = 'user'): void => {
  messages.push({
    role,
    content: [
      {
        "type": "text",
        "text": query
      }
    ]
  })
}

export { appendMessage, getChatCompletion, runConversation }