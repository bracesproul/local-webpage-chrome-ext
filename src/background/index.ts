import { chromeLLM } from './chrome-llm'
import { constructPrompt } from './extract-answers'
import { ChromeAI } from '@langchain/community/experimental/llms/chrome_ai'

console.log('background is running')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHROME_LLM') {
    handleQueryChromeLLM(request, sendResponse)
    return true // Indicates that the response will be sent asynchronously
  }
})

async function handleQueryChromeLLM(
  fields: {
    pageContent: string
    input: string
  },
  sendResponse: (response?: any) => void,
) {
  const prompts = await constructPrompt(fields)

  const llm = new ChromeAI()
  await llm.initialize()

  let responses: Array<{
    llmResponse: string
  }> = []
  for await (const prompt of prompts) {
    const res = await chromeLLM(prompt, llm)
    responses.push({
      llmResponse: res,
    })
  }

  sendResponse({
    type: 'CHROME_LLM_RESPONSE',
    response: responses,
  })
}
