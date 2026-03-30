const BACKEND_URL = process.env.BACKEND_URL!
const API_KEY = process.env.API_KEY!

export async function proxyFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = `${BACKEND_URL}${path}`
  return fetch(url, {
    ...init,
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}
