"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// La página raíz del doctor redirige directamente a Citas
export default function DoctorPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/doctor/appointments")
  }, [router])

  return (
    <div className="flex h-full items-center justify-center text-emerald-500">
      Cargando...
    </div>
  )
}
