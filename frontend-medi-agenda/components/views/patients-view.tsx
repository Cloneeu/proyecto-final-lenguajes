// Eladio
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
//import { patientsService, Patient, CreatePatientDto } from "@/services/patientsService"
import { patientsService, Patient } from "@/services/patientsService"
import { appointmentsService } from "@/services/appointmentsService"
import { useCurrentUser } from "@/lib/auth" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usersService } from "@/services/usersService"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PatientsViewProps {
  // Opcionalmente se puede pasar un basePath para los enlaces, por defecto es "/patients"
  basePath?: string
}

export function PatientsView({ basePath = "/patients" }: PatientsViewProps) {
  const user = useCurrentUser()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  //const [isDialogOpen, setIsDialogOpen] = useState(false)
  //const [formData, setFormData] = useState({ name: "", email: "", age: "" })

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) {
        setLoading(false)
        return 
      }
      try {
        setLoading(true)
        
        const [usersData, appointmentsData] = await Promise.all([
          usersService.getAll(),
          appointmentsService.getAll()
        ])

        if (Array.isArray(appointmentsData) && Array.isArray(usersData)) {
          // 1. Extraer los id únicos de los pacientes que tienen cita con ese doctor
          const myPatientIds = new Set(
            appointmentsData
              .filter((app: any) => app.doctorId === user.id)
              .map((app: any) => app.patientId)
          )

          // filtramos la colección de usuarios que sean 'patient' y que estén en la lista de sus id
          const myPatients = usersData.filter((u: any) =>
            u.role === 'patient' && myPatientIds.has(u.id)
          )

          setPatients(myPatients)
        }

      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /*const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPatientData: CreatePatientDto = {
        name: formData.name,
        email: formData.email,
        age: Number(formData.age)
      };
      const createdPatient = await patientsService.create(newPatientData) as Patient;
      setPatients([...patients, createdPatient]);
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", age: "" });
    } catch (error) {
      console.error("Error al crear paciente:", error);
    }
  };*/

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el directorio de pacientes y sus expedientes médicos.
          </p>
        </div>
        {/*
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              + Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Registrar Paciente</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo paciente para añadirlo al sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>*/}
      </div>

      <div className="mb-6 flex items-center">
        <Input
          placeholder="Buscar por nombre o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>ID del Sistema</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Cargando pacientes...
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No se encontraron pacientes.
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age || "N/A"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {patient.id}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`${basePath}/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Expediente
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
