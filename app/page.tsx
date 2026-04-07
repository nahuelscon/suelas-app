'use client'

import { useEffect, useState } from 'react'
import { supabase, ModeloSuela, ReporteTendencia } from '@/lib/supabase'

export default function Dashboard() {
  const [totalModelos, setTotalModelos] = useState(0)
  const [totalVerano, setTotalVerano] = useState(0)
  const [totalInvierno, setTotalInvierno] = useState(0)
  const [ultimoReporte, setUltimoReporte] = useState<ReporteTendencia | null>(null)
  const [ultimosModelos, setUltimosModelos] = useState<ModeloSuela[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const [modelosRes, reporteRes] = await Promise.all([
        supabase.from('modelos_suela').select('*').order('created_at', { ascending: false }),
        supabase.from('reportes_tendencias').select('*').order('created_at', { ascending: false }).limit(1),
      ])

      if (modelosRes.data) {
        const modelos = modelosRes.data as ModeloSuela[]
        setTotalModelos(modelos.length)
        setTotalVerano(modelos.filter(m => m.temporada === 'verano').length)
        setTotalInvierno(modelos.filter(m => m.temporada === 'invierno').length)
        setUltimosModelos(modelos.slice(0, 4))
      }

      if (reporteRes.data && reporteRes.data.length > 0) {
        setUltimoReporte(reporteRes.data[0] as ReporteTendencia)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const temporadaActual = () => {
    const mes = new Date().getMonth() + 1
    if ([12, 1, 2, 3].includes(mes)) return 'Verano'
    if ([6, 7, 8, 9].includes(mes)) return 'Invierno'
    if ([4, 5].includes(mes)) return 'Otoño'
    return 'Primavera'
  }

  return (
    <div className="p-4 space-y-4">

      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-500 rounded-2xl p-5 text-white">
        <p className="text-purple-200 text-sm">Temporada actual</p>
        <h2 className="text-2xl font-bold">{temporadaActual()} 2025</h2>
        <p className="text-purple-200 text-sm mt-1">Argentina · Calzado Dama & Niño</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-purple-800">{loading ? '...' : totalModelos}</p>
          <p className="text-xs text-gray-500 mt-1">Modelos totales</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-orange-500">{loading ? '...' : totalVerano}</p>
          <p className="text-xs text-gray-500 mt-1">Verano</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{loading ? '...' : totalInvierno}</p>
          <p className="text-xs text-gray-500 mt-1">Invierno</p>
        </div>
      </div>

      {/* Último reporte */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">Último reporte de tendencias</h3>
          <a href="/reportes" className="text-purple-700 text-sm font-medium">Ver todos →</a>
        </div>
        {loading ? (
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ) : ultimoReporte ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                {ultimoReporte.temporada}
              </span>
              <span className="text-gray-400 text-xs">{ultimoReporte.fecha}</span>
            </div>
            {ultimoReporte.concepto_dama && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {ultimoReporte.concepto_dama.replace(/\*\*/g, '').replace(/## /g, '')}
              </p>
            )}
            <a href="/reportes" className="block text-center bg-purple-50 text-purple-700 rounded-xl py-2 text-sm font-medium mt-2">
              Ver reporte completo
            </a>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">Aún no hay reportes.</p>
            <p className="text-gray-400 text-xs">El próximo llega el lunes.</p>
          </div>
        )}
      </div>

      {/* Últimos modelos */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">Últimos modelos cargados</h3>
          <a href="/galeria" className="text-purple-700 text-sm font-medium">Ver todos →</a>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : ultimosModelos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {ultimosModelos.map(m => (
              <div key={m.id} className="relative rounded-xl overflow-hidden bg-gray-100 h-32">
                <img src={m.public_url} alt={m.nombre} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{m.nombre}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${m.temporada === 'verano' ? 'bg-orange-400' : 'bg-blue-400'} text-white`}>
                    {m.temporada}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No hay modelos cargados aún.</p>
            <a href="/subir" className="mt-2 inline-block bg-purple-700 text-white rounded-xl px-4 py-2 text-sm font-medium">
              Subir primera foto
            </a>
          </div>
        )}
      </div>

    </div>
  )
}
