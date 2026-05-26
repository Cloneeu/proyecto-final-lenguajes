"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboardIcon,
  ClockIcon,
  CalendarDaysIcon,
  CalendarIcon,
  UsersIcon,
  StethoscopeIcon,
  LogOutIcon,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Aqui muevanle para que se ponga en la sidebar la pestaña
const NAV_ITEMS = [
  { href: "/receptionist", label: "Resumen", icon: LayoutDashboardIcon },
  { href: "/receptionist/pendientes", label: "Solicitudes Pendientes", icon: ClockIcon },
  { href: "/receptionist/agenda", label: "Agenda de Citas", icon: CalendarDaysIcon },
  { href: "/receptionist/appointments", label: "Citas", icon: CalendarIcon },
  { href: "/receptionist/patients", label: "Pacientes", icon: UsersIcon },
]

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (user === null) router.replace("/login")
    else if (user !== undefined && user.role !== "receptionist") router.replace("/login")
  }, [user, router])

  if (user === undefined) {
    return <div className="flex h-screen items-center justify-center text-emerald-500">Cargando...</div>
  }
  if (user === null || user.role !== "receptionist") return null

  async function handleLogout() {
    try {
      if (logout) await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-4">
          <span className="text-lg font-bold text-emerald-600">MediAgenda</span>
          <span className="text-xs text-muted-foreground">Recepción</span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="text-red-500 hover:text-red-600">
                <LogOutIcon />
                <span>Cerrar sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background text-foreground">
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="text-foreground" />
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
