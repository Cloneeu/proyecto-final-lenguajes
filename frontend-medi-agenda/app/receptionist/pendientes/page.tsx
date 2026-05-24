"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { appointmentsService, type Appointment } from "@/services/appointmentsService"
import { usersService, type UserRecord } from "@/services/usersService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function SolicitudesPendientes() {
  const { user } = useAuth()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [patients, setPatients] = React.useState<UserRecord[]>([])
  const [doctors, setDoctors] = React.useState<UserRecord[]>([])
  const [loading, setLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const [apptsData, usersData] = await Promise.all([
        appointmentsService.getAll(),
        usersService.getAll()
      ])

      setAppointments(apptsData as Appointment[])
      const allUsers = usersData as UserRecord[]
      setPatients(allUsers.filter(u => u.role === 'patient'))
      setDoctors(allUsers.filter(u => u.role === 'doctor'))
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await appointmentsService.updateStatus(id, status)
      await loadData()
    } catch (error) {
      alert("Error al actualizar el estado")
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-emerald-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  const pendingAppointments = appointments.filter(a => a.status === 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Solicitudes Pendientes</h1>
        <p className="text-muted-foreground mt-1">
          Revisa y gestiona las solicitudes de citas enviadas por los pacientes.
        </p>
      </div>

      <Card className="bg-[#111] border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead>Paciente</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Datos Adicionales</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingAppointments.length === 0 ? (
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay solicitudes pendientes en este momento.
                  </TableCell>
                </TableRow>
              ) : (
                pendingAppointments.map((appt) => (
                  <TableRow key={appt.id} className="border-gray-800 hover:bg-[#1a1a1a]">
                    <TableCell className="font-medium text-white">
                      {patients.find(p => p.id === appt.patientId)?.name || 'Desconocido'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {doctors.find(d => d.id === appt.doctorId)?.name || 'Desconocido'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-emerald-500">{appt.date}</div>
                      <div className="text-xs text-muted-foreground">{appt.startTime}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="text-sm font-semibold truncate text-white" title={appt.reason}>
                        {appt.reason}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={appt.notes}>
                        {appt.notes || "Sin notas adicionales"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10"
                        onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                      >
                        <CheckCircle2 className="size-4 mr-1" /> Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                        onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                      >
                        <XCircle className="size-4 mr-1" /> Rechazar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
