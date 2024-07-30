/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OpenAI = require("openai")

import { getStockDetails, getStockDetailsTool } from './tools'

type Message = {
  "tool_call_id"?: string,
  "role": "system" | "user" | "assistant" | "function" | "tool",
  "name"?: string,
  "content": {
    "type": "text",
    "text": string
  }[] | string
}

const avaialbeFunctions: any = {
  getStockDetails
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


async function getChatCompletion(messages: Message[]): Promise<any> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    tools: [getStockDetailsTool]
  });
  return response
}

const getToolResponses = async (responseMessage: any) => {
  const toolCallResponses: Message[] = await Promise.all(responseMessage.tool_calls.map(async (toolCall: any) => {
    const fnName = toolCall.function.name
    const args = JSON.parse(toolCall.function.arguments)
    const fnToCall = avaialbeFunctions[fnName]
    if (fnToCall) {
      const fnResponse = await fnToCall(args)
      const message: Message = {
        tool_call_id: toolCall.id,
        role: "tool",
        name: fnName,
        content: JSON.stringify(fnResponse),
      }
      return message
    }
  }))
  return toolCallResponses
}

async function runConversation(messages: Message[]) {
  let finishReason = ''
  do {
    const response = await getChatCompletion(messages)
    // console.log(JSON.stringify(response,null,2))
    finishReason = response.choices[0].finish_reason
    const responseMessage = response.choices[0].message
    messages.push(responseMessage)
    if (responseMessage.tool_calls && responseMessage.tool_calls.length) {
      const toolCallResponses = await getToolResponses(responseMessage)
      messages.push(...toolCallResponses)
    } else {
      return responseMessage.content
    }
  } while (finishReason === 'tool_calls');
}

const messages: Message[] = [
  {
    "role": "system",
    "content": [
      {
        "type": "text",
        "text": "You are a trading advisor."
      }
    ]
  }
]

const appendMessage = (messages: Message[], query: string) => {
  messages.push({
    role: 'user',
    content: [
      {
        "type": "text",
        "text": query
      }
    ]
  })
}

// appendMessage(messages, 'What is the current stock price of TCS and Zomato?')
appendMessage(messages, 'What is the market cap of TCS and Zomato?')
runConversation(messages).then((res) => {
  console.log(res)
})

export { getChatCompletion }