const API_BASE_URL = 'http://localhost:5000/api'

export type AppUser = {
  userId: string
  email: string
  createdAt?: string
}

export async function loginUser(email: string, password: string): Promise<AppUser> {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error('Could not log in user')
  }

  const data = await response.json()
  return data.user
}