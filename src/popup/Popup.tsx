import { useState } from 'react'
import { convert } from 'html-to-text'

import './Popup.css'

function getPageHTML(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id === undefined) {
        reject(new Error('No active tab found'))
        return
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => document.documentElement.outerHTML,
        },
        (injectionResults) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else if (injectionResults && injectionResults[0]) {
            resolve(injectionResults[0].result as string)
          } else {
            reject(new Error('Failed to get page HTML'))
          }
        },
      )
    })
  })
}

const QUESTION = `Did President Emmanuel Macron's snap election in France go well for him?`

export const Popup = () => {
  const [totalChars, setTotalChars] = useState(0)
  const [results, setResults] = useState<
    Array<{
      llmResponse: string
      context: string
    }>
  >([])

  const handleGetMarkdown = async () => {
    setResults([])
    const pageHtml = await getPageHTML()
    if (pageHtml) {
      const pageContent = convert(pageHtml, {
        baseElements: { selectors: ['body'] },
      })

      chrome.runtime.sendMessage(
        { type: 'CHROME_LLM', pageContent, input: QUESTION },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError)
            return
          }
          if (response.response.length && typeof response.response !== 'string') {
            setResults(response.response)
          }
        },
      )
    }
  }

  return (
    <main>
      <h3>Popup Page</h3>
      <button onClick={handleGetMarkdown}>Get HTML</button>
      <p>Total chars: {totalChars}</p>
      {results.length > 0
        ? results.map((result, idx) => (
            <div key={idx}>
              <h4>Result {idx + 1}</h4>
              <p>
                <strong>LLM Response: </strong>
                {result.llmResponse}
              </p>
              <p>
                <strong>Context: </strong>
                {result.context}
              </p>
              <br />
            </div>
          ))
        : null}
    </main>
  )
}

export default Popup
