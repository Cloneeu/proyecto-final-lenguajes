"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { appointmentsService, type Appointment } from "@/services/appointmentsService"
import { usersService, type UserRecord } from "@/services/usersService"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"

export default function AgendaCitas() {
  const { user } = useAuth()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [patients, setPatients] = React.useState<UserRecord[]>([])
  const [doctors, setDoctors] = React.useState<UserRecord[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadData = async () => {
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
        console.error("Error cargando agenda:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-emerald-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  // Filtramos solo las confirmadas y las ordenamos por fecha
  const confirmedAppointments = appointments
    .filter(a => a.status === 'confirmed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agenda de Citas</h1>
        <p className="text-muted-foreground mt-1">
          Historial y calendario de todas las citas confirmadas.
        </p>
      </div>

      <Card className="bg-card border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Doctor Asignado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {confirmedAppointments.length === 0 ? (
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay citas confirmadas en la agenda.
                  </TableCell>
                </TableRow>
              ) : (
                confirmedAppointments.map((appt) => (
                  <TableRow key={appt.id} className="border-gray-800 hover:bg-background">
                    <TableCell className="font-medium text-emerald-500">{appt.date}</TableCell>
                    <TableCell className="text-gray-300">{appt.startTime}</TableCell>
                    <TableCell className="text-foreground">
                      {patients.find(p => p.id === appt.patientId)?.name || 'Desconocido'}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {doctors.find(d => d.id === appt.doctorId)?.name || 'Desconocido'}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                        Confirmada
                      </Badge>
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
