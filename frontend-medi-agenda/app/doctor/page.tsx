"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  CalendarCheck, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  ClipboardList
} from "lucide-react"

import { useCurrentUser } from "@/lib/auth"
import { usersService } from "@/services/usersService"
import { appointmentsService } from "@/services/appointmentsService" 

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DoctorDashboard() {
  const user = useCurrentUser()
  const router = useRouter()
  const [appointments, setAppointments] = React.useState<any[]>([])
  const [patients, setPatients] = React.useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = React.useState(true)

  const loadDashboardData = React.useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const [appointmentsData, usersData] = await Promise.all([
        appointmentsService.getAll(),
        usersService.getAll()
      ])

      if (Array.isArray(usersData)) {
        setPatients(usersData.filter((u: any) => u.role === 'patient'))
      }

      if (Array.isArray(appointmentsData)) {
        // Filtrar citas del doctor logueado
        const myAppointments = appointmentsData.filter((app: any) => app.doctorId === user.id)
        myAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setAppointments(myAppointments)
      }
    } catch (error) {
      console.error("Error cargando el dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentsService.update(appointmentId, { status: newStatus })
      await loadDashboardData()
    } catch (error) {
      alert("Error al actualizar la cita")
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando tu agenda...</div>
  }

  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length
  const todayCount = appointments.length 

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Bienvenido, Dr. {user?.name?.split(' ')[0] || 'Médico'}
        </h1>
        <p className="text-muted-foreground mt-1">Aquí está el resumen de tu día y tus próximas consultas.</p>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card text-card-foreground border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas para Hoy</CardTitle>
            <CalendarCheck className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground mt-1">En tu agenda</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Por Confirmar</CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren tu atención</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card text-card-foreground border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Listas para consulta</p>
          </CardContent>
        </Card>
      </div>

      {/* Botones de Acción Rápida (Consistentes con tu tema) */}
      <div className="flex flex-wrap gap-3 py-2">
        <Button 
          onClick={() => router.push('/prescriptions')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          <FileText className="mr-2 size-4" />
          Crear Receta
        </Button>
        <Button 
          onClick={() => router.push('/patients')}
          variant="secondary"
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-sm"
        >
          <Users className="mr-2 size-4" />
          Ver mis Pacientes
        </Button>
      </div>

      {/* Tabla: Mis citas del día */}
      <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
          <CardTitle className="text-lg">Mis citas del día</CardTitle>
          <CardDescription>Gestiona tus consultas. Confirma o rechaza las solicitudes pendientes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px] font-semibold">Hora</TableHead>
                <TableHead className="font-semibold">Paciente</TableHead>
                <TableHead className="font-semibold">Motivo</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="text-right font-semibold pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-32">
                    No tienes citas agendadas para hoy. ¡Tómate un café! ☕
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((app) => {
                  const patientName = patients.find(p => p.id === app.patientId)?.name || app.patientId
                  
                  return (
                    <TableRow key={app.id} className="border-border/50">
                      <TableCell className="font-medium text-foreground">
                        {app.time || app.date.slice(11, 16)}
                      </TableCell>
                      <TableCell className="text-foreground">{patientName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {app.reason || "Consulta general"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            app.status === 'confirmed' ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 
                            app.status === 'pending' ? 'border-amber-500/30 text-amber-600 bg-amber-500/10' : 
                            'border-rose-500/30 text-rose-600 bg-rose-500/10'
                          }
                        >
                          {app.status === 'pending' ? 'Pendiente' : 
                           app.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4 space-x-2">
                        
                        {app.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 bg-transparent"
                              onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                            >
                              <CheckCircle className="size-3.5 mr-1.5" />
                              Confirmar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 bg-transparent"
                              onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                            >
                              <XCircle className="size-3.5 mr-1.5" />
                              Rechazar
                            </Button>
                          </div>
                        )}

                        {app.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="h-8 bg-secondary/60 hover:bg-secondary text-secondary-foreground"
                            onClick={() => router.push(`/patients/${app.patientId}`)}
                          >
                            <ClipboardList className="size-3.5 mr-1.5" />
                            Expediente
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}