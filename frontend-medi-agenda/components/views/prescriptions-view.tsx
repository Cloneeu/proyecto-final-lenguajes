// JP
"use client"

import * as React from "react"
import { PlusIcon, TrashIcon } from "lucide-react"

import {
  type Prescription,
  type CreatePrescriptionDto,
  type Medication,
  prescriptionsService,
} from "@/services/prescriptionsService"
import { usersService } from "@/services/usersService"

import { useCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

const EMPTY_MED: Medication = { name: "", dose: "", frequency: "", duration: "" }

const EMPTY_FORM: CreatePrescriptionDto = {
  patientId: "",
  doctorId: "",
  date: "",
  medications: [{ ...EMPTY_MED }],
  diagnosis: "",
  notes: "",
}

export function PrescriptionsView() {
  const user = useCurrentUser()

  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([])
  const [patients, setPatients] = React.useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<CreatePrescriptionDto>(EMPTY_FORM)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const [filterPatient, setFilterPatient] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const [prescriptionsData, usersData] = await Promise.all([
        prescriptionsService.getAll(),
        usersService.getAll()
      ])

      setPrescriptions(prescriptionsData as Prescription[])

      if (Array.isArray(usersData)) {
        const onlyPatients = usersData.filter((u: any) => u.role === 'patient')
        setPatients(onlyPatients)
      } else {
        setPatients([])
      }

    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (user !== undefined && user !== null && user.role !== 'receptionist') {
      load()
    }
  }, [user, load])

  if (user === undefined) {
    return <div className="container mx-auto py-16 text-center text-muted-foreground">Cargando...</div>
  }

  if (user === null) {
    return <div className="container mx-auto py-16 text-center text-muted-foreground">Inicia sesión para continuar.</div>
  }

  // Recepción no tiene acceso a las recetas
  if (user.role === 'receptionist') {
    return (
      <div className="container mx-auto py-16 text-center space-y-2">
        <p className="text-lg font-semibold">Sin permisos</p>
        <p className="text-sm text-muted-foreground">
          El rol de Recepción no tiene acceso a las recetas médicas.
        </p>
      </div>
    )
  }

  const canCreate = user.role === 'admin' || user.role === 'doctor'
  const canDelete = user.role === 'admin' || user.role === 'doctor'

  const filtered = prescriptions.filter(p =>
    !filterPatient || p.patientId.toLowerCase().includes(filterPatient.toLowerCase())
  )

  function updateMed(idx: number, key: keyof Medication, value: string) {
    setForm(prev => {
      const meds = [...prev.medications]
      meds[idx] = { ...meds[idx], [key]: value }
      return { ...prev, medications: meds }
    })
  }

  function addMed() {
    setForm(prev => ({ ...prev, medications: [...prev.medications, { ...EMPTY_MED }] }))
  }

  function removeMed(idx: number) {
    setForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx),
    }))
  }

  function resetForm() {
    if (!user) return;
    setForm({
      ...EMPTY_FORM,
      doctorId: user.role === 'doctor' ? user.id : "",
      medications: [{ ...EMPTY_MED }],
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await prescriptionsService.create(form)
      setOpen(false)
      resetForm()
      await load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al crear receta")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta receta?")) return
    try {
      await prescriptionsService.delete(id)
      setPrescriptions(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error eliminando")
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recetas</h1>
        {canCreate && (
          <Dialog open={open} onOpenChange={v => { setOpen(v); if (v) resetForm() }}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 size-4" />
                Nueva Receta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nueva Receta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Paciente</Label>
                    <Select required value={form.patientId} onValueChange={v => setForm(p => ({ ...p, patientId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(patient => (
                          <SelectItem key={`patient-${patient.id}`} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="rx-doctorId">ID Médico</Label>
                    <Input
                      id="rx-doctorId"
                      value={form.doctorId}
                      onChange={e => setForm(p => ({ ...p, doctorId: e.target.value }))}
                      placeholder="uid-del-médico"
                      disabled={user.role === 'doctor'}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="rx-date">Fecha</Label>
                  <Input
                    id="rx-date"
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="rx-diagnosis">Diagnóstico (opcional)</Label>
                  <Input
                    id="rx-diagnosis"
                    value={form.diagnosis ?? ""}
                    onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))}
                    placeholder="Diagnóstico principal"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Medicamentos</Label>
                    <Button type="button" variant="outline" size="xs" onClick={addMed}>
                      <PlusIcon className="mr-1 size-3" />
                      Agregar
                    </Button>
                  </div>
                  {form.medications.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 rounded-md border p-2">
                      <div className="col-span-4 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Medicamento {idx + 1}
                        </span>
                        {form.medications.length > 1 && (
                          <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeMed(idx)}>
                            <TrashIcon className="size-3" />
                          </Button>
                        )}
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Nombre</Label>
                        <Input value={med.name} onChange={e => updateMed(idx, "name", e.target.value)} placeholder="Amoxicilina" required className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Dosis</Label>
                        <Input value={med.dose} onChange={e => updateMed(idx, "dose", e.target.value)} placeholder="500mg" required className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Frecuencia</Label>
                        <Input value={med.frequency} onChange={e => updateMed(idx, "frequency", e.target.value)} placeholder="Cada 8h" required className="h-7 text-sm" />
                      </div>
                      <div className="col-span-4 space-y-1">
                        <Label className="text-xs">Duración</Label>
                        <Input value={med.duration} onChange={e => updateMed(idx, "duration", e.target.value)} placeholder="7 días" required className="h-7 text-sm" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="rx-notes">Notas (opcional)</Label>
                  <Textarea
                    id="rx-notes"
                    value={form.notes ?? ""}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Instrucciones adicionales..."
                    rows={2}
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

      {(user.role === 'admin' || user.role === 'doctor') && (
        <div className="flex gap-3">
          <Input
            className="w-64"
            placeholder="Filtrar por ID de paciente..."
            value={filterPatient}
            onChange={e => setFilterPatient(e.target.value)}
          />
        </div>
      )}

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
                {user.role !== 'patient' && <TableHead>Médico</TableHead>}
                <TableHead>Fecha</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Medicamentos</TableHead>
                {canDelete && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canDelete ? 6 : 5} className="text-center text-muted-foreground">
                    No hay recetas
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(rx => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-medium">
                      {patients.find(p => p.id === rx.patientId)?.name ?? rx.patientId}
                    </TableCell>
                    {user.role !== 'patient' && (
                      <TableCell className="font-mono text-xs">{rx.doctorId}</TableCell>
                    )}
                    <TableCell>{rx.date}</TableCell>
                    <TableCell>{rx.diagnosis ?? "—"}</TableCell>
                    <TableCell>
                      <ul className="text-xs space-y-0.5">
                        {rx.medications.map((m, i) => (
                          <li key={i}>
                            <span className="font-medium">{m.name}</span>{" "}
                            {m.dose} · {m.frequency} · {m.duration}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    {canDelete && (
                      <TableCell className="text-right">
                        <Button variant="destructive" size="xs" onClick={() => handleDelete(rx.id)}>
                          Eliminar
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
