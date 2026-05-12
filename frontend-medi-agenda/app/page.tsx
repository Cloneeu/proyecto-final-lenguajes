"use client"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", active: true },
  { title: "Agenda diaria" },
  { title: "Pacientes" },
  { title: "Profesionales" },
]

const adminItems = [
  { title: "Reportes" },
  { title: "Configuracion" },
]

export default function Page() {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white">
              MA
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">
                Medi Agenda
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Clinica Central
              </span>
            </div>
          </div>
          <SidebarInput placeholder="Buscar" />
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={item.active}>
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Administracion</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton>{item.title}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="rounded-md border bg-background px-2 py-2 text-xs text-muted-foreground">
            Modo demo activo
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarRail />

      <SidebarInset className="bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-background to-background">
        <header className="flex items-center gap-3 border-b px-6 py-4">
          <SidebarTrigger />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight">
              Agenda medica
            </h1>
            <p className="text-xs text-muted-foreground">
              Vista general de citas del dia
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              Ver calendario
            </Button>
            <Button size="sm">Nueva cita</Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">
                Citas confirmadas
              </p>
              <p className="mt-2 text-2xl font-semibold">18</p>
              <p className="text-xs text-muted-foreground">
                +3 vs ayer
              </p>
            </div>
            <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">
                En espera
              </p>
              <p className="mt-2 text-2xl font-semibold">6</p>
              <p className="text-xs text-muted-foreground">
                2 pendientes de confirmacion
              </p>
            </div>
            <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">
                Profesionales activos
              </p>
              <p className="mt-2 text-2xl font-semibold">4</p>
              <p className="text-xs text-muted-foreground">
                1 libre ahora
              </p>
            </div>
          </section>

          <section className="rounded-xl border bg-card/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Turnos proximos</h2>
                <p className="text-xs text-muted-foreground">
                  Clinica Central, consultorio 3
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Ver todo
              </Button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
                <div>
                  <p className="font-medium">09:30 - Ana Torres</p>
                  <p className="text-xs text-muted-foreground">
                    Odontologia general
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Detalle
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
                <div>
                  <p className="font-medium">10:15 - Luis Diaz</p>
                  <p className="text-xs text-muted-foreground">
                    Control anual
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Detalle
                </Button>
              </div>
            </div>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
