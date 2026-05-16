import { useState, useEffect } from 'react'

export type Role = 'admin' | 'reception' | 'doctor' | 'patient'

export interface AuthUser {
  id: string
  role: Role
}

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // El payload del JWT es el segundo segmento, que está codificado en base64url
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      // Para decodificar el payload, primero lo convertimos de base64 a una cadena JSON
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    // Luego parseamos el JSON para obtener el payload como un objeto
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

// Función para obtener el usuario autenticado a partir del token almacenado en localStorage
export function getCurrentUser(): AuthUser | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  const payload = decodeToken(token)
  if (!payload) return null
  // por si se usa id o sub para el ID del usuario, se toma cualquiera de los dos, y se asegura que el rol sea uno de los permitidos
  const id = (payload.id ?? payload.sub) as string | undefined
  const role = payload.role as Role | undefined
  if (!id || !role) return null
  return { id, role }
}

export function useCurrentUser(): AuthUser | null | undefined {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  useEffect(() => {
    setUser(getCurrentUser())
  }, [])
  return user
}
