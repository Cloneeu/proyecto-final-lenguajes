"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Aqui estan definidos las features, si quieren agregar o quitar es aqui
const features = [
  {
    icon: "📅",
    title: "Gestión de Citas",
    description:
      "Programa, modifica y cancela citas médicas con facilidad. Recordatorios automáticos para pacientes y profesionales.",
  },
  {
    icon: "💊",
    title: "Recetas Digitales",
    description:
      "Crea y gestiona prescripciones médicas de forma segura. Historial completo de medicamentos por paciente.",
  },
  {
    icon: "👩‍⚕️",
    title: "Gestión de Profesionales",
    description:
      "Administra horarios, especialidades y disponibilidad de todo tu equipo médico en un solo lugar.",
  },
  {
    icon: "👥",
    title: "Expedientes de Pacientes",
    description:
      "Mantén un historial clínico completo y actualizado. Acceso rápido a toda la información del paciente.",
  },
  {
    icon: "📊",
    title: "Reportes y Estadísticas",
    description:
      "Visualiza métricas clave de tu clínica: ocupación, tendencias y rendimiento del equipo médico.",
  },
  {
    icon: "🔐",
    title: "Seguridad y Privacidad",
    description:
      "Acceso por roles con autenticación JWT. Tus datos y los de tus pacientes siempre protegidos.",
  },
]

// Estas son las métricas que se muestran en la sección de estadísticas, pueden modificar los valores o quitar o añadir cosas aqui
const stats = [
  { value: "2,500+", label: "Pacientes atendidos" },
  { value: "99%", label: "Satisfacción" },
  { value: "50%", label: "Menos tiempo administrativo" },
  { value: "24/7", label: "Disponibilidad" },
]

// Estos son los datos de las citas que se muestran en la vista previa del panel, pueden modificar los valores o quitar o añadir cosas aqui
const appointments = [
  { time: "09:30", name: "Alexandro Vega", type: "Odontología" },
  { time: "10:15", name: "Jacqueline González", type: "Pediatría" },
  { time: "11:00", name: "Eladio Zarate", type: "Cardiología" },
  { time: "11:00", name: "Juan Pablo Hernández", type: "Psiquiatría" }
]

// Estas son las estadísticas que se muestran en la vista previa del panel, pueden modificar los valores o quitar o añadir cosas aqui
const dashboardStats = [
  { label: "Citas hoy", value: "18", trend: "+3 mañana" },
  { label: "En espera", value: "6", trend: "2 pendientes" },
  { label: "Profesionales", value: "4", trend: "1 libre ahora" },
]

// Estos son los testimonios que se muestran en la sección de testimonios, pueden modificar los valores o quitar o añadir cosas aqui
const testimonials =[
  {
    quote:
      "MediAgenda transformó por completo la forma en que gestionamos nuestra clínica. Ahora dedicamos más tiempo a los pacientes y menos al papeleo.",
    name: "Dr. Marco Aurelio",
    role: "Directora médica, Clínica Norte",
  },
  {
    quote:
      "La integración de citas y recetas en una sola plataforma es exactamente lo que necesitábamos!",
    name: "Dr. Ramírez Silva",
    role: "Médico clínico, Centro Salud Sur",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Sección: barra de navegación */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            {/* Aqui esta el logo que se ve */}
            <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white shadow-sm">
              MA
            </div>
            <span className="text-sm font-semibold">MediAgenda</span>
          </div>

          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#encabezado" className="transition-colors hover:text-foreground">Inicio</a>
            <a href="#funciones" className="transition-colors hover:text-foreground">Funciones</a>
            <a href="#testimonios" className="transition-colors hover:text-foreground">Testimonios</a>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              size="lg"
              variant="link"
              className="hover:text-emerald-700 transition-colors"
            >
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Sección: encabezado principal */}
      <section id="encabezado" className="relative overflow-hidden px-4 pb-20 pt-32 text-center sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.88_0.12_160_/_0.4),transparent)]" />

        <div className="mx-auto max-w-3xl">

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            La gestión médica{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
              que tu clínica merece
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            MediAgenda centraliza tus citas, recetas y expedientes en una
            plataforma segura, rápida y fácil de usar. Dedica más tiempo a lo
            que importa: tus pacientes 🧑‍⚕️
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="link"
              className="hover:text-emerald-700 transition-colors"
            >
              <Link href="/registro">Crear una cuenta</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sin tarjeta de crédito. Sin compromiso. Es gratis!
          </p>
        </div>

        {/* Vista previa del panel */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border bg-card/60 p-1 shadow-2xl shadow-emerald-500/10 backdrop-blur-sm">
            <div className="rounded-xl bg-muted/30 p-5">
              {/* Barra simulada del navegador */}
              <div className="mb-4 flex items-center gap-1.5">
                {/* Los tres puntitos que salen en el preview, quise que se parecieran a los de una mac */}
                <span className="size-2.5 rounded-full bg-red-400" />
                <span className="size-2.5 rounded-full bg-yellow-400" />
                <span className="size-2.5 rounded-full bg-emerald-400" />

                {/* El link fake q sale */}
                <div className="ml-3 h-5 flex-1 rounded-md border bg-background/60 px-2 text-left text-[10px] text-muted-foreground flex items-center">
                  mediagenda.com/dashboard
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                { // Aqui se cargan las estadisticas del dashboard, estan definidas en el array dashboardStats
                  dashboardStats.map((s) => (
                  <div key={s.label} className="rounded-lg border bg-card p-3 text-left shadow-sm">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{s.value}</p>
                    <p className="mt-0.5 text-xs text-emerald-600">{s.trend}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                { // Aqui se cargan las citas del dashboard, estan definidas en el array appointments
                  appointments.map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between rounded-lg border border-dashed bg-background/50 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-sm font-medium">
                        {a.time} — {a.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">{a.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: métricas destacadas */}
      <section className="border-y bg-muted/20 py-16 px-4 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          { // Aqui se cargan las métricas destacadas, estan definidas en el array de arriba
            stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-emerald-600">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sección: funcionalidades */}
      <section id="funciones" className="py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <Badge
              variant="outline"
              className="mb-4 border-emerald-200 text-emerald-600"
            >
              Funcionalidades
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Desde la agenda diaria hasta los expedientes clínicos, MediAgenda
              cubre cada aspecto de la gestión de tu clínica.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border bg-card p-6 transition-all duration-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: testimonios */}
      <section id="testimonios" className="py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <Badge
              variant="outline"
              className="mb-4 border-emerald-200 text-emerald-600"
            >
              Testimonios
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            { // Aqui se cargan los testimonios, estan definidos en el array de arriba
            testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  {/* Aqui se genera un tipo avatar para que se vea bonito el testimonio */}
                  <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white">
                    {
                      // Se generan las iniciales del nombre del testimonio para el "avatar"
                      t.name.split(" ")
                      // Se toman las primeras dos palabras y luego solo la primer letra para generar las iniciales, asi se ve mejor en el avatar
                      .slice(-2)
                      .map((n) => n[0]).join("")
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: pie de página */}
      <footer className="border-t py-10 px-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground md:flex-row">
          <p>© 2026 MediAgenda. Hecho con el ❤️ por todo el equipo.</p>
        </div>
      </footer>

    </div>
  )
}