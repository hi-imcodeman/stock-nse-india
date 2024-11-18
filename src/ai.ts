/* eslint-disable max-len */
/* eslint-disable no-console */
import { appendMessage, Message, runConversation } from "./openai"

const messages: Message[] = []
appendMessage(messages, 'You are a trading advisor.', 'system')

// appendMessage(messages, 'What is the current stock price of TCS and Zomato?')
// appendMessage(messages, 'What is the market cap of TCS and Zomato?')
// appendMessage(messages, 'list Broad Market Indices and price of those')
appendMessage(messages, 'what are the top 5 stocks under "NIFTY 50"?')
// appendMessage(messages, 'list all the indices with price of the index')

runConversation(messages).then((res) => {
    console.log('----------------------------------')
    console.log(res)
    console.log('----------------------------------')
})