import { ChromeAI } from '@langchain/community/experimental/llms/chrome_ai'
import { StringPromptValueInterface } from '@langchain/core/dist/prompt_values'
import { PromptTemplate } from '@langchain/core/prompts'
import { CLARIFY_PROMPT } from './extract-answers'

type ChromeLLMResponse =
  | {
      containsAnswer: false
    }
  | {
      containsAnswer: true
      fullResponse: string
      context: string
    }

export async function chromeLLM(
  messages: StringPromptValueInterface,
  llm: ChromeAI,
): Promise<ChromeLLMResponse> {
  const response = await llm.invoke(messages)
  const trimmedAnswer = response.includes('[/RESPONSE]')
    ? response.split('[/RESPONSE]')[0].trim()
    : response
  console.log('Resolved llm call', trimmedAnswer)

  if (trimmedAnswer.toLowerCase() === 'no') {
    return {
      containsAnswer: false,
    }
  } else {
    const context = messages.value.split('[CONTEXT]')[4].split('[/CONTEXT]')[0].trim()
    const question = messages.value.split('[QUESTION]')[4].split('[/QUESTION]')[0].trim()
    // Verification LLM
    const verificationPrompt = await PromptTemplate.fromTemplate(CLARIFY_PROMPT).invoke({
      context,
      question,
      answer: trimmedAnswer,
    })
    console.log('VERIFYING', {
      context,
      question,
      answer: trimmedAnswer,
    })
    const verification = await llm.invoke(verificationPrompt)
    const trimmedVerification = verification.includes('[/RESPONSE]')
      ? verification.split('[/RESPONSE]')[0].trim()
      : verification
    console.log('VERIFICATION RESULT', trimmedVerification)
    if (trimmedVerification.toLowerCase().trim() === 'no') {
      return {
        containsAnswer: false,
      }
    } else if (trimmedVerification.toLowerCase().trim() === 'yes') {
      return {
        containsAnswer: true,
        context,
        fullResponse: trimmedAnswer,
      }
    } else {
      console.log('neither?', trimmedVerification)
      return {
        containsAnswer: false,
      }
    }
  }
}

;`Good morning. We're covering the week after the debate — as well as the French
election, a Chinese rocket and ghosting. Donald Trump, left, and President Biden
standing at lecterns on the debate stage. Their images are reflected in the
shiny floor. The debate stage last week. Kenny Holston/The New York Times
America's image Whatever its ultimate effect on the campaign, the first
presidential debate of 2024 certainly did not cast the United States in a
favorable light. It featured two elderly men — one 81, one 78 — who insulted
each other and who most Americans wished were not the two major-party candidates
for president. One candidate told frequent lies and portrayed the country in
apocalyptic terms. The other struggled at times to describe his own policies or
complete his sentences. The image of the nation as some combination of unhinged
and doddering was especially striking at a time when the U.S. is supposed to be
leading the fight against a rising alliance of autocracies that includes China,
Russia and Iran. “I am worried about the image projected to the outside world,”
Sergey Radchenko, a historian at the Johns Hopkins School of Advanced
International Studies, wrote on social media. “It is not an image of leadership.
It is an image of terminal decline.” Radoslaw Sikorski, Poland's foreign
minister, seemingly compared President Biden's performance to Marcus Aurelius'
failure to find a competent successor in ancient Rome, which hastened the`
