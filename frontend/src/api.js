export const apiFetch = async (url, options = {}) => {
  let userId = localStorage.getItem('nexus-user-id')
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('nexus-user-id', userId)
  }
  
  const headers = new Headers(options.headers || {})
  headers.set('x-user-id', userId)
  
  // if Content-Type is not set and body is not FormData, default to application/json
  // Actually, the components themselves set Content-Type correctly, so we just pass options through.
  
  return fetch(url, { ...options, headers })
}
