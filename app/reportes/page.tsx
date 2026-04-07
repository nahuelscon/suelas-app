'use client'

import { useEffect, useState } from 'react'
import { supabase, ReporteTendencia } from '@/lib/supabase'

export default function Reportes() {
  const [reportes, setReportes] = useState<ReporteTendencia[]>([])
  const [loading, setLoading] = useState(true)
  const [abierto, setAbierto] = useState<string | null>(null)

  useEffect(() => { cargarReportes() }, [])

  async function cargarReportes() {
    const { data } = await supabase
      .from('reportes_tendencias')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setReportes(data as ReporteTendencia[])
    setLoading(false)
  }

  function formatearTexto(texto: string) {
    return texto
      .split('\n')
      .map((linea, i) => {
        if (linea.startsWith('## ')) {
          return <h3 key={i} className="text-purple-800 font-bold text-base mt-4 mb-1">{linea.replace('## ', '')}</h3>
        }
        if (linea.includes('**')) {
          const partes = linea.split('**')
          return (
            <p key={i} className="text-sm text-gray-700 my-0.5">
              {partes.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
            </p>
          )
        }
        if (linea.trim()) return <p key={i} className="text-sm text-gray-600 my-0.5">{linea}</p>
        return <br key={i} />
      })
  }

  const temporadaColor = (t: string) => {
    if (t === 'verano') return 'bg-orange-100 text-orange-700'
    if (t === 'invierno') return 'bg-blue-100 text-blue-700'
    if (t === 'otoño') return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  const temporadaEmoji = (t: string) => {
    if (t === 'verano') return '☀️'
    if (t === 'invierno') return '❄️'
    if (t === 'otoño') return '🍂'
    return '🌸'
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Reportes de Tendencias</h2>
      <p className="text-gray-500 text-sm mb-4">Se generan automáticamente cada lunes</p>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : reportes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📊</p>
          <p className="text-gray-500 font-medium">Aún no hay reportes</p>
          <p className="text-gray-400 text-sm mt-1">El primero llega el próximo lunes a las 8:00 AM</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportes.map(r => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => setAbierto(abierto === r.id ? null : r.id)}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${temporadaColor(r.temporada)}`}>
                      {temporadaEmoji(r.temporada)} {r.temporada.charAt(0).toUpperCase() + r.temporada.slice(1)}
                    </span>
                    <span className="text-gray-400 text-xs">{new Date(r.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  {r.concepto_dama && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {r.concepto_dama.replace(/\*\*/g, '').replace(/## CONCEPTO DE SUELA DAMA\n/g, '')}
                    </p>
                  )}
                </div>
                <span className="text-gray-400 text-lg ml-2">{abierto === r.id ? '▲' : '▼'}</span>
              </div>

              {/* Detalle expandible */}
              {abierto === r.id && (
                <div className="px-4 pb-4 border-t border-gray-100">

                  {/* Concepto Dama */}
                  {r.concepto_dama && (
                    <div className="mt-3 bg-purple-50 rounded-xl p-3">
                      {formatearTexto(r.concepto_dama)}
                    </div>
                  )}

                  {/* Concepto Niño */}
                  {r.concepto_nino && (
                    <div className="mt-3 bg-blue-50 rounded-xl p-3">
                      {formatearTexto(r.concepto_nino)}
                    </div>
                  )}

                  {/* Alerta */}
                  {r.alerta_emergente && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      {formatearTexto(r.alerta_emergente)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
