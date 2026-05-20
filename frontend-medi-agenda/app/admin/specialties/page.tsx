"use client"

import * as React from "react"
import { PlusIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

    interface Specialty {
    id: string;
    name: string;
    createdAt?: string;
    }

    export default function SpecialtiesPage() {
    const [specialties, setSpecialties] = React.useState<Specialty[]>([])
    const [loading, setLoading] = React.useState(true)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

    // Estados para el Modal 
    const [createOpen, setCreateOpen] = React.useState(false)
    const [newSpecialtyName, setNewSpecialtyName] = React.useState('')
    const [creating, setCreating] = React.useState(false)
    const [createError, setCreateError] = React.useState<string | null>(null)

    //  Cargar las especialidades de 
    const load = React.useCallback(async () => {
        try {
        setLoading(true)
        const res = await fetch('http://localhost:4000/api/specialties')
        if (res.ok) {
            const data = await res.json()
            setSpecialties(Array.isArray(data) ? data : [])
        } else {
            throw new Error("Error al cargar datos del servidor")
        }
        } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Error al cargar especialidades")
        } finally {
        setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        load()
    }, [load])

    // Guardar una nueva especialidad 
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setCreateError(null)
        setCreating(true)

        try {
        const res = await fetch('http://localhost:4000/api/specialties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newSpecialtyName }),
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || 'Error al crear la especialidad')
        }

        // Éxito: Cerramos el modal, limpiamos el input y recargamos la tabla
        setCreateOpen(false)
        setNewSpecialtyName('')
        await load()
        } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
        } finally {
        setCreating(false)
        }
    }

    return (
        <div className="space-y-6">
        {/* Encabezado y Botón que abre el Modal */}
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

        {/* Tabla de Visualización */}
        {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Cargando catálogo...</p>
            </div>
        ) : errorMsg ? (
            <p className="text-sm text-destructive">{errorMsg}</p>
        ) : (
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nombre de Especialidad</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {specialties.length === 0 ? (
                    <TableRow>
                    <TableCell className="text-center text-muted-foreground h-24">
                        No hay especialidades registradas en el sistema.
                    </TableCell>
                    </TableRow>
                ) : (
                    specialties.map(spec => (
                    <TableRow key={spec.id}>
                        <TableCell className="font-medium px-4 py-3">
                        {spec.name}
                        </TableCell>
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