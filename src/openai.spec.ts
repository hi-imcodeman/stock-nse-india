/* eslint-disable no-console */
import 'openai/shims/node'
import {getChatCompletion} from './openai'

describe('OpenAI',()=>{
    test('getChatCompletion',async ()=>{
        const response = await getChatCompletion('What you can do?')
        console.log(JSON.stringify(response,null,2));
    })
})