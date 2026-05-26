"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { patientsService, type MedicalRecord } from "@/services/patientsService"
import { Loader2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ExpedientePaciente() {
  const { user } = useAuth()
  const [history, setHistory] = React.useState<MedicalRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        setLoading(true)
        const data = await patientsService.getHistory(user.id)
        setHistory((data as MedicalRecord[]) || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar expediente")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-emerald-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto pt-16 text-center text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-emerald-500/30 pb-6">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <FileText className="text-emerald-500" size={36} />
          Mi Expediente
        </h1>
        <p className="text-gray-400 mt-2">Tu historial clínico y diagnósticos registrados.</p>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="bg-emerald-500/10 p-6 rounded-full border border-emerald-500/20">
            <FileText size={52} className="text-emerald-500" />
          </div>
          <p className="text-gray-400 text-lg">Aún no hay registros médicos en tu expediente.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {history.map((record) => (
            <div
              key={record.id}
              className="border-l-2 border-emerald-500 pl-5 py-2 bg-sidebar rounded-r-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-gray-300">
                  {new Date(record.date).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {record.diagnosis && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {record.diagnosis}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                {record.notes}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
