"use client"

import * as React from "react"
import Link from "next/link" // AÑADIMOS IMPORTACIÓN DE LINK PARA EL BOTÓN DE ESPECIALIDADES
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { usersService, type UserRecord } from "@/services/usersService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROLES = ["admin", "doctor", "patient", "receptionist"] as const
type Role = (typeof ROLES)[number]

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  doctor: "Doctor",
  patient: "Paciente",
  receptionist: "Recepcionista",
}

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline" | "destructive"> = {
  admin: "default",
  doctor: "secondary",
  patient: "outline",
  receptionist: "outline",
}

// AÑADIMOS 'specialtyId' A LOS ESTADOS INICIALES
const EMPTY_CREATE = { name: "", email: "", password: "", role: "patient" as Role, assignedReceptionistId: "", specialtyId: "" }
const EMPTY_EDIT = { name: "", email: "", role: "patient" as Role, isActive: true, assignedReceptionistId: "", specialtyId: "" }

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserRecord[]>([])
  
  //  ESTADO PARA GUARDAR LAS ESPECIALIDADES DEL BACKEND
  const [specialties, setSpecialties] = React.useState<{id: string, name: string}[]>([])
  
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [filterRole, setFilterRole] = React.useState<string>("all")
  const [filterActive, setFilterActive] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState(EMPTY_CREATE)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)

  const [editTarget, setEditTarget] = React.useState<UserRecord | null>(null)
  const [editForm, setEditForm] = React.useState(EMPTY_EDIT)
  const [editError, setEditError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState(false)

  const receptionists = React.useMemo(
    () => users.filter(u => u.role === "receptionist" && u.isActive),
    [users]
  )

  // CARGAMOS USUARIOS Y ESPECIALIDADES AL MISMO TIEMPO
  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const [usersData, specRes] = await Promise.all([
        usersService.getAll(),
        fetch('http://localhost:4000/api/specialties')
      ])
      
      setUsers(usersData)

      if (specRes.ok) {
        const specData = await specRes.json()
        setSpecialties(Array.isArray(specData) ? specData : [])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = React.useMemo(() => {
    return users.filter(u => {
      if (filterRole !== "all" && u.role !== filterRole) return false
      if (filterActive === "active" && !u.isActive) return false
      if (filterActive === "inactive" && u.isActive) return false
      if (search) {
        const q = search.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [users, filterRole, filterActive, search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    setCreating(true)
    try {
      const dto: Parameters<typeof usersService.create>[0] = {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      }
      //  SI ES DOCTOR, ENVIAMOS LA ESPECIALIDAD Y RECEPCIONISTA
      if (createForm.role === "doctor") {
        if (createForm.assignedReceptionistId) dto.assignedReceptionistId = createForm.assignedReceptionistId
        // Nota: Asegúrate que usersService.create soporte specialtyId si tu backend lo requiere en la colección users
        if (createForm.specialtyId) (dto as any).specialtyId = createForm.specialtyId 
      }
      
      await usersService.create(dto)
      setCreateOpen(false)
      setCreateForm(EMPTY_CREATE)
      await load()
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Error al crear usuario")
    } finally {
      setCreating(false)
    }
  }

  function openEdit(user: UserRecord) {
    setEditTarget(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      assignedReceptionistId: user.assignedReceptionistId ?? "",
      specialtyId: (user as any).specialtyId ?? "",
    })
    setEditError(null)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setEditError(null)
    setEditing(true)
    try {
      const dto: Parameters<typeof usersService.update>[1] = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        isActive: editForm.isActive,
      }
      if (editForm.role === "doctor") {
        dto.assignedReceptionistId = editForm.assignedReceptionistId || null
        if (editForm.specialtyId) (dto as any).specialtyId = editForm.specialtyId
      } else {
        dto.assignedReceptionistId = null
      }
      await usersService.update(editTarget.id, dto)
      setEditTarget(null)
      await load()
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Error al actualizar usuario")
    } finally {
      setEditing(false)
    }
  }

  async function handleToggleActive(user: UserRecord) {
    try {
      await usersService.toggleActive(user.id, !user.isActive)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al cambiar estado")
    }
  }

  async function handleAssignReceptionist(doctorId: string, receptionistId: string | null) {
    try {
      await usersService.assignReceptionist(doctorId, receptionistId)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al asignar recepcionista")
    }
  }

  async function handleDelete(user: UserRecord) {
    if (!confirm(`¿Eliminar a ${user.name}? Esta acción desactivará su cuenta.`)) return
    try {
      await usersService.delete(user.id)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar usuario")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>

        <div className="flex gap-3">
          {/*NUEVO BOTÓN DE ACCESO RÁPIDO A ESPECIALIDADES */}
          <Link href="/admin/specialties">
            <Button variant="outline" className="border-slate-300">
              Gestionar Especialidades
            </Button>
          </Link>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 size-4" />
                Nuevo usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo usuario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="c-name">Nombre</Label>
                  <Input
                    id="c-name"
                    value={createForm.name}
                    onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-email">Correo</Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-password">Contraseña</Label>
                  <Input
                    id="c-password"
                    type="password"
                    value={createForm.password}
                    onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Rol</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={v => setCreateForm(p => ({ ...p, role: v as Role, assignedReceptionistId: "", specialtyId: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AÑADIMOS LOS CAMPOS EXTRA SI EL ROL ELEGIDO ES DOCTOR */}
                {createForm.role === "doctor" && (
                  <div className="grid gap-4 p-4 bg-slate-50 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-slate-700">Especialidad Asignada *</Label>
                      <Select
                        required
                        value={createForm.specialtyId}
                        onValueChange={v => setCreateForm(p => ({ ...p, specialtyId: v }))}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecciona la especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map(spec => (
                            <SelectItem key={spec.id} value={spec.id}>{spec.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-700">Recepcionista asignada</Label>
                      <Select
                        value={createForm.assignedReceptionistId || "__none__"}
                        onValueChange={v =>
                          setCreateForm(p => ({ ...p, assignedReceptionistId: v === "__none__" ? "" : v }))
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sin asignar</SelectItem>
                          {receptionists.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {createError && <p className="text-sm text-destructive">{createError}</p>}
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Guardando..." : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {ROLES.map(r => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Buscar por nombre o email..."
          className="w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                {/* 8. NUEVA COLUMNA DE ESPECIALIDAD */}
                <TableHead>Especialidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Recepcionista</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Sin usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(u => {
                  const assignedRecep = u.role === "doctor" && u.assignedReceptionistId
                    ? receptionists.find(r => r.id === u.assignedReceptionistId)
                    : null

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={ROLE_VARIANT[u.role as Role] ?? "outline"}>
                          {ROLE_LABELS[u.role as Role] ?? u.role}
                        </Badge>
                      </TableCell>

                      {/* CELDA QUE MUESTRA LA ESPECIALIDAD DEL DOCTOR */}
                      <TableCell>
                        {u.role === "doctor" ? (
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {specialties.find(s => s.id === (u as any).specialtyId)?.name || "Sin asignar"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className="text-xs"
                          title="Click para cambiar estado"
                        >
                          <Badge variant={u.isActive ? "secondary" : "destructive"}>
                            {u.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        {u.role === "doctor" ? (
                          <Select
                            value={u.assignedReceptionistId ?? "__none__"}
                            onValueChange={v =>
                              handleAssignReceptionist(u.id, v === "__none__" ? null : v)
                            }
                          >
                            <SelectTrigger className="h-7 w-40 text-xs">
                              <SelectValue placeholder="Sin asignar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Sin asignar</SelectItem>
                              {receptionists.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.createdAt.slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Dialog
                          open={editTarget?.id === u.id}
                          onOpenChange={open => { if (!open) setEditTarget(null) }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                              <PencilIcon className="size-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar usuario</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEdit} className="space-y-4">
                              <div className="space-y-1">
                                <Label htmlFor="e-name">Nombre</Label>
                                <Input
                                  id="e-name"
                                  value={editForm.name}
                                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="e-email">Correo</Label>
                                <Input
                                  id="e-email"
                                  type="email"
                                  value={editForm.email}
                                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Rol</Label>
                                <Select
                                  value={editForm.role}
                                  onValueChange={v =>
                                    setEditForm(p => ({ ...p, role: v as Role, assignedReceptionistId: "", specialtyId: "" }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map(r => (
                                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {editForm.role === "doctor" && (
                                <div className="grid gap-4 p-4 bg-slate-50 border rounded-lg">
                                  <div className="space-y-1">
                                    <Label className="text-slate-700">Especialidad Asignada</Label>
                                    <Select
                                      value={editForm.specialtyId || "__none__"}
                                      onValueChange={v => setEditForm(p => ({ ...p, specialtyId: v === "__none__" ? "" : v }))}
                                    >
                                      <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selecciona la especialidad" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__none__">Sin asignar</SelectItem>
                                        {specialties.map(spec => (
                                          <SelectItem key={spec.id} value={spec.id}>{spec.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-slate-700">Recepcionista asignada</Label>
                                    <Select
                                      value={editForm.assignedReceptionistId || "__none__"}
                                      onValueChange={v =>
                                        setEditForm(p => ({
                                          ...p,
                                          assignedReceptionistId: v === "__none__" ? "" : v,
                                        }))
                                      }
                                    >
                                      <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Sin asignar" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__none__">Sin asignar</SelectItem>
                                        {receptionists.map(r => (
                                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <input
                                  id="e-active"
                                  type="checkbox"
                                  checked={editForm.isActive}
                                  onChange={e => setEditForm(p => ({ ...p, isActive: e.target.checked }))}
                                  className="size-4"
                                />
                                <Label htmlFor="e-active">Cuenta activa</Label>
                              </div>

                              {editError && <p className="text-sm text-destructive">{editError}</p>}
                              <DialogFooter>
                                <Button type="submit" disabled={editing}>
                                  {editing ? "Guardando..." : "Guardar cambios"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(u)}
                        >
                          <TrashIcon className="size-3" />
                        </Button>
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