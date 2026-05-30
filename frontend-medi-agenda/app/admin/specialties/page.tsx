"use client"

import * as React from "react"
import { PlusIcon, PencilIcon, TrashIcon, Loader2, XIcon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react"
import { specialtiesService, type Specialty } from "@/services/specialtiesService"
import { buildPageItems } from "@/lib/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const PAGE_SIZE = 10

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = React.useState<Specialty[]>([])
  const [loading, setLoading] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Crear
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newSpecialtyName, setNewSpecialtyName] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)

  // Editar
  const [editTarget, setEditTarget] = React.useState<Specialty | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editing, setEditing] = React.useState(false)
  const [editError, setEditError] = React.useState<string | null>(null)

  // Eliminar
  const [deleteTarget, setDeleteTarget] = React.useState<Specialty | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Paginación (client-side: el GET devuelve toda la lista)
  const [page, setPage] = React.useState(1)

  // Notificaciones tipo toast
  type Toast = { id: number; message: string; variant: "default" | "destructive" }
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const pushToast = React.useCallback(
    (message: string, variant: Toast["variant"] = "destructive") => {
      const id = Date.now() + Math.random()
      setToasts(prev => [...prev, { id, message, variant }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    },
    []
  )
  const dismissToast = React.useCallback(
    (id: number) => setToasts(prev => prev.filter(t => t.id !== id)),
    []
  )

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await specialtiesService.getAll()
      setSpecialties(Array.isArray(data) ? data : [])
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error al cargar especialidades")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  // Paginación derivada
  const totalPages = Math.max(1, Math.ceil(specialties.length / PAGE_SIZE))
  React.useEffect(() => {
    // Si la página actual queda fuera de rango tras crear/borrar, la corregimos
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])
  const pageItems = React.useMemo(
    () => specialties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [specialties, page]
  )

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    setCreating(true)
    try {
      await specialtiesService.create(newSpecialtyName)
      setCreateOpen(false)
      setNewSpecialtyName("")
      await load()
      pushToast("Especialidad creada correctamente", "default")
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
    } finally {
      setCreating(false)
    }
  }

  function openEdit(spec: Specialty) {
    setEditTarget(spec)
    setEditName(spec.name)
    setEditError(null)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setEditError(null)
    setEditing(true)
    try {
      await specialtiesService.update(editTarget.id, editName)
      setEditTarget(null)
      await load()
      pushToast("Especialidad actualizada correctamente", "default")
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
    } finally {
      setEditing(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await specialtiesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      await load()
      pushToast("Especialidad eliminada correctamente", "default")
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Error al eliminar especialidad")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado y botón de creación */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Especialidades Médicas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Agrega y administra las especialidades de los doctores en la clínica
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Nueva Especialidad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Especialidad</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1 mt-2">
                <Label htmlFor="s-name">Nombre de la Categoría *</Label>
                <Input
                  id="s-name"
                  value={newSpecialtyName}
                  onChange={e => setNewSpecialtyName(e.target.value)}
                  placeholder="Ej. Pediatría, Cardiología..."
                  required
                  autoComplete="off"
                />
              </div>

              {createError && (
                <p className="text-sm text-destructive font-medium">{createError}</p>
              )}

              <DialogFooter className="mt-4">
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {creating ? "Guardando..." : "Agregar Especialidad"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Cargando catálogo...</p>
        </div>
      ) : errorMsg ? (
        <p className="text-sm text-destructive">{errorMsg}</p>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre de Especialidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                      No hay especialidades registradas en el sistema.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map(spec => (
                    <TableRow key={spec.id}>
                      <TableCell className="font-medium px-4 py-3">{spec.name}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="outline" size="sm" onClick={() => openEdit(spec)}>
                          <PencilIcon className="size-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(spec)}
                        >
                          <TrashIcon className="size-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {specialties.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * PAGE_SIZE + 1}
                {"-"}
                {Math.min(page * PAGE_SIZE, specialties.length)} de {specialties.length} especialidades
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

      {/* Diálogo de edición */}
      <Dialog open={editTarget !== null} onOpenChange={open => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Especialidad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1 mt-2">
              <Label htmlFor="e-spec-name">Nombre de la Categoría *</Label>
              <Input
                id="e-spec-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Ej. Pediatría, Cardiología..."
                required
                autoComplete="off"
              />
            </div>

            {editError && (
              <p className="text-sm text-destructive font-medium">{editError}</p>
            )}

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={editing}>
                {editing && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editing ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación de borrado */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar especialidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>.
              No podrás borrarla si algún doctor la tiene asignada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => { e.preventDefault(); confirmDelete() }}
              disabled={deleting}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notificaciones tipo toast */}
      <div className="fixed bottom-4 right-4 z-100 flex w-full max-w-sm flex-col gap-2">
        {toasts.map(t => (
          <Alert
            key={t.id}
            variant={t.variant}
            className="shadow-lg ring-1 ring-foreground/10"
          >
            {t.variant === "destructive" ? (
              <AlertCircleIcon />
            ) : (
              <CheckCircle2Icon className="text-emerald-600" />
            )}
            <AlertDescription className="text-foreground">{t.message}</AlertDescription>
            <button
              onClick={() => dismissToast(t.id)}
              className="absolute top-2.5 right-3 text-muted-foreground hover:text-foreground"
              aria-label="Cerrar notificación"
            >
              <XIcon className="size-4" />
            </button>
          </Alert>
        ))}
      </div>
    </div>
  )
}
