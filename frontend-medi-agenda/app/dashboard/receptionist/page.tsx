"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { appointmentsService, type Appointment } from "@/services/appointmentsService"
import { usersService, type UserRecord } from "@/services/usersService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarIcon, UserIcon, ClockIcon, CheckCircle2, XCircle, LogOut } from "lucide-react"

export default function ReceptionistDashboard() {
  const router = useRouter()
  // Extraemos la función logout del contexto
  const { user, logout } = useAuth()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [patients, setPatients] = React.useState<UserRecord[]>([])
  const [doctors, setDoctors] = React.useState<UserRecord[]>([])
  const [loading, setLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
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
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await appointmentsService.updateStatus(id, status)
      await loadData()
    } catch (error) {
      alert("Error al actualizar el estado")
    }
  }

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      if (logout) {
        await logout()
      }
      router.push('/login')
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const pendingAppointments = appointments.filter(a => a.status === 'pending')
  const todayAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0]
    return a.date === today && a.status === 'confirmed'
  })

  if (loading) return <div className="p-8">Cargando dashboard...</div>

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado modificado con el botón de cerrar sesión */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Recepción</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Bienvenido, {user?.name}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="size-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <ClockIcon className="size-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas para Hoy</CardTitle>
            <CalendarIcon className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            <UserIcon className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solicitudes de Citas */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Solicitudes de Citas (Por Confirmar)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Datos de Contacto / Motivo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No hay solicitudes pendientes
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingAppointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-medium">
                        {patients.find(p => p.id === appt.patientId)?.name || 'Paciente'}
                      </TableCell>
                      <TableCell>
                        {doctors.find(d => d.id === appt.doctorId)?.name || 'Doctor'}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">{appt.date}</div>
                        <div className="text-xs text-muted-foreground">{appt.startTime}</div>
                      </TableCell>
                      
                      <TableCell className="max-w-[200px]">
                        <div className="text-xs font-semibold truncate" title={appt.reason}>
                          {appt.reason}
                        </div>
                        <div className="text-xs text-muted-foreground truncate" title={appt.notes}>
                          {appt.notes}
                        </div>
                      </TableCell>

                      <TableCell className="text-right space-x-2 min-w-[220px]">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                        >
                          <CheckCircle2 className="size-4 mr-1" /> Confirmar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
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
    </div>
  )
}