"use client"

import * as React from "react"
import {
  UsersIcon,
  StethoscopeIcon,
  UserIcon,
  ClipboardListIcon,
  CalendarIcon,
  FileTextIcon,
  BarChart2Icon,
  ShieldIcon,
} from "lucide-react"
import { adminService, type DashboardStats } from "@/services/adminService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  doctor: "Doctor",
  patient: "Paciente",
  receptionist: "Recepcionista",
}

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  doctor: "secondary",
  patient: "outline",
  receptionist: "outline",
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    adminService
      .getStats()
      .then(setStats)
      .catch(e => setError(e instanceof Error ? e.message : "Error al cargar estadísticas"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (!stats) return null

  const { totals, recentUsers } = stats

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Usuarios totales" value={totals.users} icon={UsersIcon} />
        <StatCard label="Doctores" value={totals.doctors} icon={StethoscopeIcon} />
        <StatCard label="Pacientes" value={totals.patients} icon={UserIcon} />
        <StatCard label="Recepcionistas" value={totals.receptionists} icon={ClipboardListIcon} />
        <StatCard label="Citas" value={totals.appointments} icon={CalendarIcon} />
        <StatCard label="Recetas" value={totals.prescriptions} icon={FileTextIcon} />
      </div>

      {/* Últimos usuarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Últimos usuarios registrados</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">Ver todos</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Registrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Sin usuarios
                  </TableCell>
                </TableRow>
              ) : (
                recentUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[u.role] ?? "outline"}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.createdAt.slice(0, 10)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
