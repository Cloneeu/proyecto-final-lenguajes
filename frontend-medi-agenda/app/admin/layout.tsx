"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboardIcon,
  UsersIcon,
  ShieldIcon,
  LogOutIcon,
} from "lucide-react"
import { useCurrentUser } from "@/lib/auth"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

// Elementos de navegación disponibles en el sidebar para el admin
const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/users", label: "Usuarios", icon: UsersIcon },
  { href: "/admin/audits", label: "Auditorías", icon: ShieldIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    // Si no hay usuario autenticado o no es administrador, se envía al login
    if (user === null) router.replace("/login")
    else if (user !== undefined && user.role !== "admin") router.replace("/login")
  }, [user, router])

  if (user === undefined) {
    // Mientras se verifica la sesión, se muestra un indicador de carga
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">
        Cargando...
      </div>
    )
  }

  // Si la sesión no es válida o el rol no corresponde, no se renderiza el layout
  if (user === null || user.role !== "admin") return null

  function handleLogout() {
    // Borra el token guardado y retorna al formulario de acceso
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <SidebarProvider>
      {/* Contenedor principal del panel lateral. */}
      <Sidebar>
        <SidebarHeader className="px-4 py-4">
          <span className="text-base font-semibold">MediAgenda</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
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
              {/* Acción para cerrar la sesión actual. */}
              <SidebarMenuButton onClick={handleLogout}>
                <LogOutIcon />
                <span>Cerrar sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Encabezado superior con el nombre de la sección activa. */}
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        {/* Contenedor principal para el contenido de cada página */}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
