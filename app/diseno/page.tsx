'use client'

import { useEffect, useState } from 'react'
import { supabase, ModeloSuela, ReporteTendencia } from '@/lib/supabase'

function generarSugerencia(reporte: ReporteTendencia | null, modelos: ModeloSuela[]): string[] {
  const sugerencias: string[] = []

  // Analizar colección actual
  const damVerano = modelos.filter(m => m.categoria === 'dama' && m.temporada === 'verano').length
  const damInvierno = modelos.filter(m => m.categoria === 'dama' && m.temporada === 'invierno').length
  const ninVerano = modelos.filter(m => m.categoria === 'nino' && m.temporada === 'verano').length
  const ninInvierno = modelos.filter(m => m.categoria === 'nino' && m.temporada === 'invierno').length

  const temporadaActual = reporte?.temporada || detectarTemporada()

  // Identificar gaps en la colección
  const gaps: string[] = []
  if (damVerano === 0) gaps.push('dama verano')
  if (damInvierno === 0) gaps.push('dama invierno')
  if (ninVerano === 0) gaps.push('niño verano')
  if (ninInvierno === 0) gaps.push('niño invierno')

  if (gaps.length > 0) {
    sugerencias.push(`📌 Tu colección no tiene modelos de: ${gaps.join(', ')}. Comenzá por ahí.`)
  }

  // Categoría con menos modelos
  const minimos = [
    { label: 'Dama Verano', count: damVerano },
    { label: 'Dama Invierno', count: damInvierno },
    { label: 'Niño Verano', count: ninVerano },
    { label: 'Niño Invierno', count: ninInvierno },
  ].sort((a, b) => a.count - b.count)

  if (minimos[0].count < 3) {
    sugerencias.push(`📈 Reforzá la categoría "${minimos[0].label}" (${minimos[0].count} modelo${minimos[0].count !== 1 ? 's' : ''}). Tener al menos 3 por categoría te da variedad real.`)
  }

  // Sugerencia basada en tendencias
  if (reporte) {
    if (reporte.concepto_dama) {
      sugerencias.push(`👠 Próximo modelo dama sugerido: ${reporte.concepto_dama.substring(0, 150)}${reporte.concepto_dama.length > 150 ? '...' : ''}`)
    }
    if (reporte.concepto_nino) {
      sugerencias.push(`👟 Próximo modelo niño sugerido: ${reporte.concepto_nino.substring(0, 150)}${reporte.concepto_nino.length > 150 ? '...' : ''}`)
    }
    if (reporte.alerta_emergente) {
      sugerencias.push(`⚡ Tendencia emergente a aprovechar: ${reporte.alerta_emergente}`)
    }
  } else {
    // Sin reporte: usar contexto de temporada
    const ctxMap: Record<string, string[]> = {
      verano: [
        '👠 Para dama verano: explorá suelas planas o cuñas en EVA con colores arena, blanco o coral. Son tendencia en calzado casual de playa y ciudad.',
        '👟 Para niño verano: suelas livianas con buena ventilación, colores brillantes (amarillo, turquesa). La funcionalidad y el confort son clave.',
      ],
      otono: [
        '👠 Para dama otoño: suelas de mayor altura con textura mate, colores tierra (camel, tostado). Combinan con botas y botines.',
        '👟 Para niño otoño: suelas con buen agarre para días húmedos. Colores oscuros que no muestren suciedad.',
      ],
      invierno: [
        '👠 Para dama invierno: suelas gruesas tipo block o lug con costura visible. Colores negro, burdeos y verde botella.',
        '👟 Para niño invierno: suelas aislantes y antideslizantes. Priorizar durabilidad sobre estética.',
      ],
      primavera: [
        '👠 Para dama primavera: suelas livianas en colores pasteles y floreados. Perfectas para sandalias y mocasines.',
        '👟 Para niño primavera: suelas flexibles de goma para mayor actividad. Colores verde y azul cielo.',
      ],
    }
    const ctx = ctxMap[temporadaActual] || ctxMap['verano']
    sugerencias.push(...ctx)
  }

  return sugerencias
}

function detectarTemporada(): string {
  const mes = new Date().getMonth() + 1
  // Hemisferio sur (Argentina)
  if (mes >= 12 || mes <= 2) return 'verano'
  if (mes >= 3 && mes <= 5) return 'otono'
  if (mes >= 6 && mes <= 8) return 'invierno'
  return 'primavera'
}

export default function Diseno() {
  const [modelos, setModelos] = useState<ModeloSuela[]>([])
  const [reporte, setReporte] = useState<ReporteTendencia | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [{ data: mods }, { data: reps }] = await Promise.all([
        supabase.from('modelos_suela').select('*').order('created_at', { ascending: false }),
        supabase.from('reportes_tendencias').select('*').order('created_at', { ascending: false }).limit(1),
      ])
      if (mods) setModelos(mods as ModeloSuela[])
      if (reps && reps.length > 0) setReporte(reps[0] as ReporteTendencia)
      setLoading(false)
    }
    cargar()
  }, [])

  const sugerencias = generarSugerencia(reporte, modelos)

  const stats = {
    total: modelos.length,
    damVerano: modelos.filter(m => m.categoria === 'dama' && m.temporada === 'verano').length,
    damInvierno: modelos.filter(m => m.categoria === 'dama' && m.temporada === 'invierno').length,
    ninVerano: modelos.filter(m => m.categoria === 'nino' && m.temporada === 'verano').length,
    ninInvierno: modelos.filter(m => m.categoria === 'nino' && m.temporada === 'invierno').length,
  }

  const temporada = reporte?.temporada || detectarTemporada()

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">✨ Diseño de Nuevos Modelos</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Temporada actual */}
          <div className="bg-gradient-to-r from-purple-900 to-purple-600 rounded-2xl p-4 text-white">
            <p className="text-purple-200 text-xs uppercase tracking-wide">Contexto actual</p>
            <p className="text-xl font-bold capitalize mt-1">
              {temporada === 'otono' ? 'Otoño' : temporada.charAt(0).toUpperCase() + temporada.slice(1)} 2025
            </p>
            <p className="text-purple-200 text-sm mt-1">
              {reporte ? `Reporte del ${new Date(reporte.fecha).toLocaleDateString('es-AR')}` : 'Aún sin reporte — se genera cada lunes'}
            </p>
          </div>

          {/* Tu colección actual */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">📁 Tu colección actual</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Dama Verano', count: stats.damVerano, color: 'bg-orange-100 text-orange-700' },
                { label: 'Dama Invierno', count: stats.damInvierno, color: 'bg-blue-100 text-blue-700' },
                { label: 'Niño Verano', count: stats.ninVerano, color: 'bg-yellow-100 text-yellow-700' },
                { label: 'Niño Invierno', count: stats.ninInvierno, color: 'bg-indigo-100 text-indigo-700' },
              ].map(({ label, count, color }) => (
                <div key={label} className={`${color} rounded-xl p-3 text-center`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
            {stats.total === 0 && (
              <p className="text-sm text-gray-400 text-center mt-3">
                Subí tus primeros modelos para obtener sugerencias personalizadas.
              </p>
            )}
          </div>

          {/* Últimas fotos para referencia */}
          {modelos.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">🖼️ Últimos modelos cargados</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {modelos.slice(0, 6).map(m => (
                  <div key={m.id} className="flex-shrink-0 w-24">
                    <img
                      src={m.public_url}
                      alt={m.nombre}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <p className="text-xs text-gray-500 mt-1 truncate text-center">{m.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias de diseño */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">💡 Sugerencias para tu próximo diseño</h3>
            <div className="space-y-3">
              {sugerencias.map((s, i) => (
                <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Concepto completo del reporte */}
          {reporte?.texto_completo && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">📋 Análisis completo de tendencias</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {reporte.texto_completo}
              </p>
            </div>
          )}

          {/* CTA subir modelo */}
          <a
            href="/subir"
            className="block w-full bg-purple-700 text-white rounded-2xl py-4 text-center font-bold text-base"
          >
            📷 Subir nuevo modelo basado en estas sugerencias
          </a>
        </>
      )}
    </div>
  )
}
