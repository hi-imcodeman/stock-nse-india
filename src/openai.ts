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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


async function getChatCompletion(messages: Message[]): Promise<any> {
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
        console.log("Content too long, skipping");
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

async function runConversation(messages: Message[]): Promise<string> {
  let finishReason = ''
  let content = ''
  do {
    const response = await getChatCompletion(messages)
    console.log('Got response from GPT.');
    // console.log(JSON.stringify(response,null,2))
    finishReason = response.choices[0].finish_reason
    const responseMessage = response.choices[0].message
    content = responseMessage.content
    messages.push(responseMessage)
    if (responseMessage.tool_calls?.length) {
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