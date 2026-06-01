"use client"

import * as React from "react"
import { useAuth } from "@/context/AuthContext"
import { appointmentsService, type Appointment } from "@/services/appointmentsService"
import { usersService, type UserRecord } from "@/services/usersService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CalendarCheck, PlusCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CitasPaciente() {
  const { user } = useAuth()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [doctors, setDoctors] = React.useState<UserRecord[]>([])
  const [loading, setLoading] = React.useState(true)

  // Estados para el Modal de nueva cita
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    doctorId: "",
    date: "",
    startTime: "",
    reason: "",
  })

  // Separamos la carga de datos para poder reutilizarla al crear una cita nueva
  const loadAppointments = React.useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const [apptsData, doctorsData] = await Promise.all([
        appointmentsService.getAll(),
        usersService.getAll({ role: 'doctor' })
      ])

      const myAppointments = (apptsData as Appointment[]).filter(
        a => a.patientId === user.id
      )

      setAppointments(myAppointments)
      setDoctors(doctorsData as UserRecord[])
    } catch (error) {
      console.error("Error cargando citas:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Función para enviar la solicitud de cita
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    try {
      // Calculamos una hora de fin genérica (30 minutos después de la hora de inicio)
      const [h, m] = formData.startTime.split(':').map(Number)
      const endM = (m + 30) % 60
      const endH = h + Math.floor((m + 30) / 60)
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

      await appointmentsService.create({
        patientId: user?.id ?? "",
        doctorId: formData.doctorId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: endTime,
        reason: formData.reason,
        status: 'pending' // Entra en espera de la recepcionista
      })

      // Limpiamos y cerramos el modal
      setOpen(false)
      setFormData({ doctorId: "", date: "", startTime: "", reason: "" })

      // Recargamos la tabla para que el paciente vea su nueva cita en "Espera"
      await loadAppointments()
    } catch (error: any) {
      setFormError(error.message || "Error al solicitar la cita")
    } finally {
      setSubmitting(false)
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
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed')

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex justify-between items-end border-b border-emerald-500/30 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Hola, <span className="text-emerald-500">{user?.name}</span>
          </h1>
          <p className="text-gray-400 mt-2">Controla y agenda tus citas médicas.</p>
        </div>

        {/* MODAL PARA SOLICITAR CITA */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2">
              <PlusCircle size={20} /> Solicitar Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
            <DialogHeader>
              <DialogTitle className="text-emerald-500 text-xl">Nueva Solicitud de Cita</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="doctor" className="text-popover-foreground">Médico Especialista</Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, doctorId: val }))}
                  required
                >
                  <SelectTrigger className="bg-popover border-gray-700 text-popover-foreground">
                    <SelectValue placeholder="Selecciona un doctor..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-gray-700 text-popover-foreground">
                    {doctors.map(doc => (
                      <SelectItem key={doc.id} value={doc.id} className="hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-300">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    className="bg-background border-border w-full text-foreground"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-gray-300">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    className="bg-transparent border-gray-700 text-popover-foreground"
                    value={formData.startTime}
                    onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-300">Motivo de la consulta</Label>
                <Input
                  id="reason"
                  placeholder="Ej. Chequeo general, dolor de cabeza..."
                  required
                  className="bg-transparent border-gray-700 text-popover-foreground [color-scheme:dark]"
                  value={formData.reason}
                  onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              {formError && <p className="text-sm text-red-500 font-medium">{formError}</p>}

              <DialogFooter className="mt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {submitting ? "Enviando solicitud..." : "Confirmar Solicitud"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* CITAS PENDIENTES */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-yellow-500 flex items-center gap-3">
          <Clock size={24} /> En Espera de Autorización
        </h2>
        {pendingAppointments.length === 0 ? (
          <p className="text-gray-500 text-sm">No tienes citas pendientes de aprobación.</p>
        ) : (
          <div className="grid gap-5">
            {pendingAppointments.map((cita) => (
              <Card key={cita.id} className="bg-card border-yellow-500/20">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-foreground">
                      {doctors.find(d => d.id === cita.doctorId)?.name || 'Doctor no asignado'}
                    </h3>
                    <p className="text-emerald-500 font-medium">
                      {cita.date} - {cita.startTime}
                    </p>
                    <p className="text-gray-400 text-sm">Motivo: {cita.reason}</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full border border-yellow-500 text-yellow-500 text-xs font-black bg-yellow-500/10">
                    PENDIENTE
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CITAS CONFIRMADAS */}
      <div className="space-y-6 mt-10">
        <h2 className="text-xl font-semibold text-emerald-500 flex items-center gap-3">
          <CalendarCheck size={24} /> Citas Aprobadas
        </h2>
        {confirmedAppointments.length === 0 ? (
          <p className="text-gray-500 text-sm">Aún no hay citas confirmadas en tu agenda.</p>
        ) : (
          <div className="grid gap-5">
            {confirmedAppointments.map((cita) => (
              <Card key={cita.id} className="bg-card border-emerald-500/30">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-card-foreground">
                      {doctors.find(d => d.id === cita.doctorId)?.name || 'Doctor no asignado'}
                    </h3>
                    <p className="text-emerald-500 font-medium">
                      {cita.date} - {cita.startTime}
                    </p>
                    <p className="text-gray-400 text-sm">Motivo: {cita.reason}</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full border border-emerald-500 text-emerald-500 text-xs font-black bg-emerald-500/10">
                    CONFIRMADA
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
