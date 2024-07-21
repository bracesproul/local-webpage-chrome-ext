import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringPromptValueInterface } from '@langchain/core/prompt_values'

export const BASE_PROMPT_2 = `You are an AI assistant tasked with extracting the answer to a user's question from a given text snippet. Your goal is to provide a concise and accurate answer based solely on the information provided in the context.

Here is the context you will be working with:
<context>
{context}
</context>

Here is the question you need to answer:
<question>
{question}
</question>

To answer this question, follow these steps:
1. Carefully read and analyze the provided context.
2. Identify the specific information that directly answers the question.
3. Formulate a concise answer using only the information found in the context.
4. Do not include any information or assumptions that are not explicitly stated in the given text.

You must be absolutely certain the answer is in the text. If you cannot find a direct answer to the question in the context, respond with "No answer found in the given context."

Present your answer within <ANSWER> tags. Your response should be brief and to the point, directly addressing the question asked.

It is extremely important that you do not use any information or context when responding except for the context provided to you inside the <context> tags. If you respond with an answer using information not provided in the context, you will be considered to have failed the task.

Remember, accuracy is crucial. It's better to respond with "No answer found in the given context" than to provide an answer that isn't directly supported by the given text.`

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
      return PromptTemplate.fromTemplate(BASE_PROMPT_2).invoke({
        context: text,
        question: fields.input,
      })
    }),
  )
}
