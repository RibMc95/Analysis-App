const API_BASE_URL = "http://localhost:5000/api";

export type AppUser = {
  userId: string;
  email: string;
  createdAt?: string;
};

type LoginResponse = {
  message?: string;
  user?: AppUser;
  error?: string;
};

export async function loginUser(
  email: string,
  password: string
): Promise<AppUser> {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not log in user");
  }

  if (!data.user) {
    throw new Error("User data was not returned from the server");
  }

  return data.user;
}