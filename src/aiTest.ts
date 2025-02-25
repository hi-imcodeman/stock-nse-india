/* eslint-disable max-len */
/* eslint-disable no-console */
import { appendMessage, getUsageCost, Message,
     runConversation, UsageInfo } from "./openai"
import { toolsData } from "./tools"


const messages: Message[] = []
const usage: UsageInfo[] = []
appendMessage(messages, 'You are a trading advisor.', 'system')

appendMessage(messages, 'What is the current stock price of TCS and Zomato?')
// appendMessage(messages, 'What is the market cap of TCS and Zomato?')
// appendMessage(messages, 'list sectoral Market Indices and price of those')
// appendMessage(messages, 'what are the stocks under "NIFTY 50" and their price, sort based on percent change?')
// appendMessage(messages, 'list all the indices with percent change of the index')
// appendMessage(messages, 'is "TCS" has FNO or not?')
// appendMessage(messages, 'What are the indexes performing well based on percent change?')
// appendMessage(messages, 'show me advance and decline ratio percent of "NIFTY 50" and "NIFTY NEXT 50"?')
// appendMessage(messages, 'show me advance percent each index under sectoral Market Indices?')

runConversation(messages, toolsData, usage).then((res) => {
    console.log('----------------------------------')
    console.log(res)
    console.log('----------------------------------')
    const combinedUsageData=getUsageCost(usage)
    console.log(`Conversation cost: ${(combinedUsageData.totalCost * 87).toFixed(2)} INR`);
}).catch((err) => {
    console.error(err);
    const combinedUsageData=getUsageCost(usage)
    console.log(`Conversation cost: ${(combinedUsageData.totalCost * 87).toFixed(2)} INR`);
})

