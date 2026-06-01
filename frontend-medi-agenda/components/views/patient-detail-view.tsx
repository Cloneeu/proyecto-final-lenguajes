// Eladio
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { patientsService, Patient, MedicalRecord } from "@/services/patientsService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PatientDetailViewProps {
  // Opcionalmente se puede pasar un href para el botón de volver, por defecto es "/patients"
  backHref?: string
}

export function PatientDetailView({ backHref = "/patients" }: PatientDetailViewProps) {
  const params = useParams()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [history, setHistory] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [patientData, historyData] = await Promise.all([
          patientsService.getById(patientId),
          patientsService.getHistory(patientId)
        ])

        setPatient(patientData as Patient)
        setHistory(historyData as MedicalRecord[] || [])
      } catch (error) {
        console.error("Error al cargar el expediente:", error)
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Cargando expediente...</div>
  }

  if (!patient) {
    return <div className="p-10 text-center text-red-500">Paciente no encontrado.</div>
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 max-w-5xl">
      <div className="mb-6">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="hover:text-emerald-700">
            Volver a la lista
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Datos del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Nombre</p>
              <p className="font-medium text-lg">{patient.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Correo</p>
              <p className="font-medium">{patient.email || "No registrado"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Edad</p>
              <p className="font-medium">{patient.age ? `${patient.age} años` : "No registrada"}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ID del Sistema</p>
              <p className="font-mono text-xs text-muted-foreground break-all">{patient.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
            <CardTitle className="text-xl">Historial Médico</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {history.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                Aún no hay registros médicos para este paciente.
              </div>
            ) : (
              <div className="space-y-6">
                {history.filter(record => !(record as any).deletedAt).map((record) => (
                  <div key={record.id} className="border-l-2 border-emerald-500 pl-4 py-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      {record.diagnosis && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                          {record.diagnosis}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {record.notes}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
