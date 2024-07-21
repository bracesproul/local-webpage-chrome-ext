import { ChromeAI } from '@langchain/community/experimental/llms/chrome_ai'
import { StringPromptValueInterface } from '@langchain/core/dist/prompt_values'

const ANSWER_OPEN_TAG = '<ANSWER>'
const ANSWER_CLOSE_TAG = '</ANSWER>'

export async function chromeLLM(
  messages: StringPromptValueInterface,
  llm: ChromeAI,
): Promise<string> {
  const response = await llm.invoke(messages)
  const trimmedAnswer = response.includes(ANSWER_OPEN_TAG)
    ? response.split(ANSWER_OPEN_TAG)[1].trim().split(ANSWER_CLOSE_TAG)[0].trim()
    : response

  return trimmedAnswer
}
