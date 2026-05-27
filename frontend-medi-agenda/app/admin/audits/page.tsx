"use client"

import * as React from "react"
import { auditsService, type AuditLog } from "@/services/auditsService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AuditsPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    auditsService.getPaginated(1, 50)
      .then(res => setLogs(res.data)) 
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground p-6">Cargando registros de auditoría...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registro de Auditorías</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Últimas acciones en el sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario (Autor)</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.performedBy.name}</span>
                      <span className="text-xs text-muted-foreground">{log.performedBy.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.resource}</TableCell>
                  <TableCell className="text-sm">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}