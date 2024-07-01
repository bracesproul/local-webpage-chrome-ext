import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringPromptValueInterface } from '@langchain/core/prompt_values'

export const BASE_PROMPT_2 = `You're an expert assistant tasked with answering the users question, given the context provided.
Think through this step by step. Once you're finished thinking, respond with your answer.
If you believe you have the answer, you MUST include a reference to exactly where the answer was provided in your response.
If the answer is not present, respond with "NO".

[Full text of example #1]
[QUESTION]
Why is the sky blue?
[/QUESTION]
[CONTEXT]
The dog walked into the house because he was hungry.
[/CONTEXT]
[RESPONSE]
NO
[/RESPONSE]<ctrl23>

[Full text of example #2]
[QUESTION]
Why did the chicken cross the road?
[/QUESTION]
[CONTEXT]
The chicken lived in a small town and in order to get to work, he needed to cross the road.
[/CONTEXT]
[RESPONSE]
The chicken crossed the road to get to work. Context: "...in order to get to work, he needed to cross the road."
[/RESPONSE]<ctrl23>

[Full text of example #3]
[QUESTION]
Should I wear sunglasses when I'm outside?
[/QUESTION]
[CONTEXT]
Lets talk about the outdoors! First, it is important to protect your eyes from the sun. This should be done by wearing sunglasses while outside. Next, you should always apply sunscreen.
[/CONTEXT]
[RESPONSE]
Yes, you should always wear sunglasses while outside. Context: "First, it is important to protect your eyes from the sun. This should be done by wearing sunglasses while outside."
[/RESPONSE]<ctrl23>

[Full text of actual question and context]
[QUESTION]
{question}
[/QUESTION]
[CONTEXT]
{context}
[/CONTEXT]

[RESPONSE]`

export const CLARIFY_PROMPT = `You're an expert assistant tasked with confirming whether or not another assistant has provided the correct answer to the user's question.
Your job is to determine whether or not the original answer was accurate. If the answer is correct, respond with "YES". If the answer is incorrect, respond with "NO".
You must take your time and examine all the context carefully before making your decision as it is common for the original assistant to provide answers when they are not present in the context.

[Full text of example #1]
[QUESTION]
Why is the sky blue?
[/QUESTION]
[CONTEXT]
The dog walked into the house because he was hungry.
[/CONTEXT]
[ANSWER]
The sky is blue because it wants to be.
[/ANSWER]
[RESPONSE]
NO
[/RESPONSE]<ctrl23>

[Full text of example #2]
[QUESTION]
Why did the chicken cross the road?
[/QUESTION]
[CONTEXT]
The chicken lived in a small town and in order to get to work, he needed to cross the road.
[/CONTEXT]
[ANSWER]
The chicken crossed the road to get to work. Context: "...in order to get to work, he needed to cross the road."
[/ANSWER]
[RESPONSE]
YES
[/RESPONSE]<ctrl23>

[Full text of example #3]
[QUESTION]
When did Columbus discover America?
[/QUESTION]
[CONTEXT]
Lets talk about the outdoors! First, it is important to protect your eyes from the sun. This should be done by wearing sunglasses while outside. Next, you should always apply sunscreen.
[/CONTEXT]
[ANSWER]
Columbus discovered America in 1492.
[/ANSWER]
[RESPONSE]
NO
[/RESPONSE]<ctrl23>

[QUESTION]
{question}
[/QUESTION]
[CONTEXT]
{context}
[/CONTEXT]
[ANSWER]
{answer}
[/ANSWER]
[RESPONSE]`

/**
 * Split text into chunks
 * @param text
 * @returns A list of text chunks
 */
export async function splitText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 500,
  })
  return splitter.splitText(text)
}

export async function constructPrompt(fields: {
  pageContent: string
  input: string
}): Promise<StringPromptValueInterface[]> {
  const splitTexts = await splitText(fields.pageContent)

  return Promise.all(
    splitTexts.map((text) => {
      console.log('split text.length', text.length)
      return PromptTemplate.fromTemplate(BASE_PROMPT_2).invoke({
        context: text,
        question: fields.input,
      })
    }),
  )
}
