export async function loginRequest(email: string, password: string) {
  const response = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      senha: password
    }),
  })

  if (!response.ok) {
    throw new Error("Email ou senha inválidos")
  }

  return response.json()
}