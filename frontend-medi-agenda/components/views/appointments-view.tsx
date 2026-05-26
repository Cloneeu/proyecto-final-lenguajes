// JP

"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, PlusIcon } from "lucide-react"

import {
  type Appointment,
  type CreateAppointmentDto,
  appointmentsService,
} from "@/services/appointmentsService"
import { useCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// TODO: reemplazar por doctorsService cuando esté disponible
const MOCK_DOCTORS = [
  { id: "doc1", name: "Dr. Alex" },
  { id: "doc2", name: "Dra. Jacqui" },
  { id: "doc3", name: "Dr. Eladio" },
  { id: "doc3", name: "Dr. JP" },
]

// Defini los colores para cada estado de la cita (por si luego se quiere cambiar mas facil), usados en la tabla principal
const STATUS_COLORS: Record<Appointment["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
}

type Status = Appointment["status"]

// Función para determinar qué opciones de cambio de estado mostrar según el rol del usuario y el estado actual de la cita
function allowedStatusOptions(role: string, current: Status): Status[] {
  if (role === 'admin') return ['pending', 'confirmed', 'cancelled', 'completed']
  if (role === 'receptionist') return [current, 'confirmed', 'cancelled'].filter((v, i, a) => a.indexOf(v) === i) as Status[]
  if (role === 'doctor') return [current, 'completed', 'cancelled'].filter((v, i, a) => a.indexOf(v) === i) as Status[]
  if (role === 'patient') return [current, 'cancelled'].filter((v, i, a) => a.indexOf(v) === i) as Status[]
  return [current]
}

// Formulario vacío para crear una nueva cita, se reinicia cada vez que se abre el diálogo
const EMPTY_FORM: CreateAppointmentDto = {
  patientId: "",
  doctorId: "",
  date: "",
  startTime: "",
  endTime: "",
  status: "pending",
}

export function AppointmentsView() {
  const user = useCurrentUser()

  // Estados para la lista de citas, filtros, formulario de creación y manejo de errores
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filtros para mostrar solo ciertas citas según estado, fecha o médico
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [filterDate, setFilterDate] = React.useState<Date | undefined>()
  const [filterDoctor, setFilterDoctor] = React.useState<string>("")

  // Estados para el formulario de creación de citas
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<CreateAppointmentDto>(EMPTY_FORM)
  const [pickerDate, setPickerDate] = React.useState<Date | undefined>()
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  // Carga inicial de citas desde la API
  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await appointmentsService.getAll()
      setAppointments(data as Appointment[])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading appointments")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (user !== undefined) load()
  }, [user, load])

  // Filtros aplicados sobre la lista principal
  const filtered = React.useMemo(() => {
    return appointments.filter(a => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false
      if (filterDate && a.date !== format(filterDate, "yyyy-MM-dd")) return false
      if (filterDoctor && a.doctorId !== filterDoctor) return false
      return true
    })
  }, [appointments, filterStatus, filterDate, filterDoctor])

  // Manejo de cambios en el formulario de creación
  function handleFormChange(key: keyof CreateAppointmentDto, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Envío del formulario para crear una nueva cita
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await appointmentsService.create(form)
      setOpen(false)
      setForm(EMPTY_FORM)
      setPickerDate(undefined)
      await load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error creating appointment")
    } finally {
      setSubmitting(false)
    }
  }

  // Manejo de eliminación de citas
  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta cita?")) return
    try {
      await appointmentsService.delete(id)
      setAppointments(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error eliminando")
    }
  }

  // Manejo de cambios de estado de las citas
  async function handleStatusChange(id: string, status: Status) {
    try {
      const updated = await appointmentsService.updateStatus(id, status)
      setAppointments(prev => prev.map(a => (a.id === id ? (updated as Appointment) : a)))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error actualizando estado")
    }
  }

  // Estados de carga y autenticación
  if (user === undefined) {
    return <div className="container mx-auto py-16 text-center text-muted-foreground">Cargando...</div>
  }
  if (user === null) {
    return <div className="container mx-auto py-16 text-center text-muted-foreground">Inicia sesión para ver las citas.</div>
  }

  // Permisos para mostrar el botón de creación y las opciones de eliminación según el rol del usuario
  const canCreate = user.role === 'admin' || user.role === 'receptionist' || user.role === 'patient'
  const canDelete = user.role === 'admin'

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Encabezado y creación de citas */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Citas</h1>
        {/* El formulario de creación solo aparece para los roles permitidos */}
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 size-4" />
                Nueva Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nueva Cita</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* El paciente no necesita ingresar su ID manualmente; el backend lo define */}
                {user.role !== 'patient' && (
                  <div className="space-y-1">
                    <Label htmlFor="patientId">ID Paciente</Label>
                    <Input
                      id="patientId"
                      value={form.patientId}
                      onChange={e => handleFormChange("patientId", e.target.value)}
                      placeholder="uid-del-paciente"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label>Médico</Label>
                  <Select value={form.doctorId} onValueChange={v => handleFormChange("doctorId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_DOCTORS.map(d => (
                        <SelectItem key={`form-${d.id}`} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 size-4" />
                        {pickerDate ? format(pickerDate, "PPP") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pickerDate}
                        onSelect={d => {
                          setPickerDate(d)
                          handleFormChange("date", d ? format(d, "yyyy-MM-dd") : "")
                        }}
                        disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="startTime">Hora inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={form.startTime}
                      onChange={e => handleFormChange("startTime", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="endTime">Hora fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={form.endTime}
                      onChange={e => handleFormChange("endTime", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reason">Motivo (opcional)</Label>
                  <Input
                    id="reason"
                    value={form.reason ?? ""}
                    onChange={e => handleFormChange("reason", e.target.value)}
                    placeholder="Motivo de consulta"
                  />
                </div>

                {formError && <p className="text-sm text-destructive">{formError}</p>}

                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros de búsqueda y fecha */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>

        {(user.role === 'admin' || user.role === 'receptionist') && (
          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Médico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los médicos</SelectItem>
              {MOCK_DOCTORS.map(d => (
                <SelectItem key={`filter-${d.id}`} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-44 justify-start">
              <CalendarIcon className="mr-2 size-4" />
              {filterDate ? format(filterDate, "PPP") : "Filtrar por fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={filterDate} onSelect={setFilterDate} />
          </PopoverContent>
        </Popover>

        {filterDate && (
          <Button variant="ghost" size="sm" onClick={() => setFilterDate(undefined)}>
            Limpiar fecha
          </Button>
        )}
      </div>

      {/* Tabla principal de citas */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay citas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(appt => {
                  const options = allowedStatusOptions(user.role, appt.status)
                  return (
                    <TableRow key={appt.id}>
                      <TableCell className="font-mono text-xs">{appt.patientId}</TableCell>
                      <TableCell>
                        {MOCK_DOCTORS.find(d => d.id === appt.doctorId)?.name ?? appt.doctorId}
                      </TableCell>
                      <TableCell>{appt.date}</TableCell>
                      <TableCell>{appt.startTime} – {appt.endTime}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[appt.status]}`}>
                          {appt.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {/* Cambio de estado disponible según el rol del usuario */}
                        {options.length > 1 && (
                          <Select
                            value={appt.status}
                            onValueChange={v => handleStatusChange(appt.id, v as Status)}
                          >
                            <SelectTrigger size="sm" className="w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                // Solo mostrar las opciones de estado permitidas según el rol del usuario
                                options.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {
                          // El botón de eliminación solo aparece dependiendo del usuario
                          canDelete && (
                          <Button variant="destructive" size="xs" onClick={() => handleDelete(appt.id)}>
                            Eliminar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}


