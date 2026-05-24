"use client"
import { FileText, Construction } from "lucide-react"

export default function ExpedientePaciente() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 h-[80vh] flex flex-col justify-center items-center text-center">
      <div className="bg-emerald-500/10 p-6 rounded-full mb-4 border border-emerald-500/20">
        <FileText size={64} className="text-emerald-500" />
      </div>
      <h1 className="text-4xl font-bold text-white">Expediente Médico</h1>
      <p className="text-gray-400 max-w-md text-lg">
        Tu historial clínico, diagnósticos y resultados de laboratorio estarán disponibles aquí muy pronto.
      </p>
      <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20 mt-8">
        <Construction size={20} />
        <span className="font-semibold text-sm">Módulo en construcción</span>
      </div>
    </div>
  )
}
