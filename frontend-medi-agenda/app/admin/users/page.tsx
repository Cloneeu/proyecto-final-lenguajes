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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Tamaño fijo de página para el listado!!!!!!
const PAGE_SIZE = 10

// Calcula la secuencia de páginas a mostrar en la paginación
// Genera un array con los números de página a visualizar, incluyendo "ellipsis",
// apenas aprendi como se llamaban los tres puntitos (...) :P 
// cuando hay espacios grandes entre páginas. Muestra siempre la primera y última página,
// y 1-2 páginas alrededor de la página actual para navegación rápida
function buildPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | "ellipsis")[] = [1]
  if (current > 3) items.push("ellipsis")
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) items.push(i)
  if (current < total - 2) items.push("ellipsis")
  items.push(total)
  return items
}

// Los roles que manejamos hasta el momento
const ROLES = ["admin", "doctor", "patient", "receptionist"] as const
type Role = (typeof ROLES)[number]

// Mapeo de etiquetas legibles para cada rol
const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  doctor: "Doctor",
  patient: "Paciente",
  receptionist: "Recepcionista",
}

// Mapeo de variantes de badge para cada rol
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
  const [specialties, setSpecialties] = React.useState<{ id: string, name: string }[]>([])

  // Lista completa de recepcionistas para selects (independiente de la paginación)
  const [receptionistsList, setReceptionistsList] = React.useState<UserRecord[]>([])

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [filterRole, setFilterRole] = React.useState<string>("all")
  const [filterActive, setFilterActive] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  // Valor de búsqueda con debounce que dispara los fetches
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  // Estado de paginación
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState(EMPTY_CREATE)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)

  const [editTarget, setEditTarget] = React.useState<UserRecord | null>(null)
  const [editForm, setEditForm] = React.useState(EMPTY_EDIT)
  const [editError, setEditError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState(false)

  // Recepcionistas activas obtenidas de la lista completa
  const receptionists = React.useMemo(
    () => receptionistsList.filter(u => u.isActive),
    [receptionistsList]
  )

  // Aplica debounce sobre el texto de búsqueda para no martillar el backend
  React.useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  // Resetea a la primera página cuando cambian los filtros
  React.useEffect(() => {
    setPage(1)
  }, [filterRole, filterActive, debouncedSearch])

  // Carga la página de usuarios solicitada usando los filtros actuales
  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const isActiveValue =
        filterActive === "active" ? true : filterActive === "inactive" ? false : undefined
      const roleValue = filterRole !== "all" ? filterRole : undefined

      const [paginatedRes, specRes, recepData] = await Promise.all([
        usersService.getPaginated({
          page,
          pageSize: PAGE_SIZE,
          role: roleValue,
          isActive: isActiveValue,
          search: debouncedSearch || undefined,
        }),
        fetch('http://localhost:4000/api/specialties'),
        // Lista completa de recepcionistas para los selects de asignación
        usersService.getAll({ role: 'receptionist' }),
      ])

      // Procesamos la respuesta paginada y actualizamos el estado de usuarios y paginación
      const paginated = paginatedRes as {
        data: UserRecord[]
        total: number
        page: number
        pageSize: number
        totalPages: number
      }
      setUsers(paginated.data ?? [])
      setTotal(paginated.total ?? 0)
      setTotalPages(paginated.totalPages ?? 1)

      if (specRes.ok) {
        const specData = await specRes.json()
        setSpecialties(Array.isArray(specData) ? specData : [])
      }

      setReceptionistsList(Array.isArray(recepData) ? (recepData as UserRecord[]) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [page, filterRole, filterActive, debouncedSearch])

  React.useEffect(() => {
    load()
  }, [load])

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

  // CUANDO ABRIMOS EL FORMULARIO DE EDICIÓN, CARGAMOS LOS DATOS DEL USUARIO EN EL ESTADO, INCLUYENDO ESPECIALIDAD Y RECEPCIONISTA SI ES DOCTOR
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

  // EN EL HANDLE EDIT, TAMBIÉN ENVIAMOS LOS CAMBIOS DE ESPECIALIDAD Y RECEPCIONISTA SI EL ROL ES DOCTOR
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
        dto.assignedReceptionistId = editForm.assignedReceptionistId || null;
        (dto as any).specialtyId = editForm.specialtyId || null
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

  // FUNCION PARA TOGGLEAR EL ESTADO ACTIVO/INACTIVO DE UN USUARIO, SOLO ENVIAMOS EL CAMBIO DE ESTADO, EL BACKEND SE ENCARGA DE MANTENER LOS DEMÁS CAMPOS
  async function handleToggleActive(user: UserRecord) {
    try {
      await usersService.toggleActive(user.id, !user.isActive)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al cambiar estado")
    }
  }

  // FUNCION PARA ASIGNAR O CAMBIAR LA RECEPCIONISTA DE UN DOCTOR DESDE LA TABLA, SOLO ENVIAMOS EL ID DE LA RECEPCIONISTA, EL BACKEND SE ENCARGA DE VALIDAR Y ACTUALIZAR
  async function handleAssignReceptionist(doctorId: string, receptionistId: string | null) {
    try {
      await usersService.assignReceptionist(doctorId, receptionistId)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al asignar recepcionista")
    }
  }

  // FUNCION PARA ELIMINAR UN USUARIO, SOLO ENVIAMOS SU ID, EL BACKEND SE ENCARGA DE DESACTIVARLO
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
        <>
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
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Sin usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(u => {
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

          {/* Controles de paginación y contador de resultados */}
          {total > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * PAGE_SIZE + 1}
                {"-"}
                {Math.min(page * PAGE_SIZE, total)} de {total} usuarios
              </p>

              {totalPages > 1 && (
                <Pagination className="mx-0 sm:justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        text="Anterior"
                        aria-disabled={page === 1}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                        onClick={e => {
                          e.preventDefault()
                          if (page > 1) setPage(page - 1)
                        }}
                      />
                    </PaginationItem>

                    {buildPageItems(page, totalPages).map((item, idx) =>
                      item === "ellipsis" ? (
                        <PaginationItem key={`e-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === page}
                            onClick={e => {
                              e.preventDefault()
                              setPage(item)
                            }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        text="Siguiente"
                        aria-disabled={page === totalPages}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                        onClick={e => {
                          e.preventDefault()
                          if (page < totalPages) setPage(page + 1)
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}