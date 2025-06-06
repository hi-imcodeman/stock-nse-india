/* eslint-disable no-console */
import {appendMessage, getChatCompletion, Message} from './openai'

// Mock OpenAI module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: { content: 'Test response' },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        })
      }
    }
  }))
})

describe('OpenAI',()=>{
    beforeEach(() => {
        process.env.OPENAI_API_KEY = 'test-api-key'
    })

    test('getChatCompletion',async ()=>{
        const messages: Message[] = []
        appendMessage(messages,'What you can do?')
        const response = await getChatCompletion(messages)
        expect(response).toBeDefined()
        expect(response.choices[0].message.content).toBe('Test response')
    })
})