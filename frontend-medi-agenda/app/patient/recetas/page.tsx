"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { prescriptionsService, type Prescription } from "@/services/prescriptionsService"
import { usersService, type UserRecord } from "@/services/usersService"
import { Loader2, FilePlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RecetasPaciente() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([])
  const [doctors, setDoctors] = React.useState<UserRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        setLoading(true)
        const [rxData, doctorsData] = await Promise.all([
          prescriptionsService.getAll(),
          usersService.getAll({ role: 'doctor' }),
        ])
        // Filtrar solo las recetas del paciente logueado
        const mine = (rxData as Prescription[]).filter(r => r.patientId === user.id)
        setPrescriptions(mine)
        setDoctors(doctorsData as UserRecord[])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar recetas")
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
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <FilePlus className="text-emerald-500" size={36} />
          Mis Recetas
        </h1>
        <p className="text-gray-400 mt-2">Recetas emitidas por tus médicos.</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="bg-emerald-500/10 p-6 rounded-full border border-emerald-500/20">
            <FilePlus size={52} className="text-emerald-500" />
          </div>
          <p className="text-gray-400 text-lg">Aún no tienes recetas registradas.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {prescriptions.map((rx) => {
            const doctorName = doctors.find(d => d.id === rx.doctorId)?.name ?? "Médico"
            return (
              <Card key={rx.id} className="bg-card border-emerald-500/20 text-foreground">
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-emerald-400">{doctorName}</CardTitle>
                    <p className="text-sm text-gray-400 mt-0.5">{rx.date}</p>
                  </div>
                  {rx.diagnosis && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {rx.diagnosis}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {rx.medications.map((med, i) => (
                      <div key={i} className="bg-sidebar rounded-md px-4 py-2 text-sm">
                        <span className="font-semibold text-foreground">{med.name}</span>
                        <span className="text-gray-400 ml-2">
                          {med.dose} · {med.frequency} · {med.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                  {rx.notes && (
                    <p className="text-xs text-gray-500 italic border-t border-white/10 pt-2">
                      {rx.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
