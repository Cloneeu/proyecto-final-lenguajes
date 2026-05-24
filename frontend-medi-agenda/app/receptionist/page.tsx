"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { appointmentsService, type Appointment } from "@/services/appointmentsService"
import { usersService, type UserRecord } from "@/services/usersService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, UserIcon, ClockIcon, Loader2 } from "lucide-react"

export default function ReceptionistDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [patients, setPatients] = React.useState<UserRecord[]>([])
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
      } catch (error) {
        console.error("Error loading dashboard data:", error)
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

  const pendingAppointments = appointments.filter(a => a.status === 'pending')
  const todayAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0]
    return a.date === today && a.status === 'confirmed'
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resumen General</h1>
        <p className="text-muted-foreground mt-1">
          Estadísticas y estado actual de la clínica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#111] border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Solicitudes Pendientes</CardTitle>
            <ClockIcon className="size-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pendingAppointments.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Citas para Hoy</CardTitle>
            <CalendarIcon className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{todayAppointments.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-emerald-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500">Total Pacientes Registrados</CardTitle>
            <UserIcon className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{patients.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
