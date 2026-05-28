export const apiFetch = async (url, options = {}) => {
  let userId = localStorage.getItem('nexus-user-id')
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('nexus-user-id', userId)
  }
  
  const headers = new Headers(options.headers || {})
  headers.set('x-user-id', userId)
  
  const llmProvider = localStorage.getItem('nexus-provider')
  if (llmProvider) headers.set('x-llm-provider', llmProvider)
  
  const llmApiKey = localStorage.getItem('nexus-api-key')
  if (llmApiKey) headers.set('x-llm-api-key', llmApiKey)
  
  // Support remote backend URLs in production
  const baseUrl = import.meta.env.VITE_API_URL || ''
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  
  return fetch(fullUrl, { ...options, headers })
}
