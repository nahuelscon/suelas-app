'use client'

import { useEffect, useState } from 'react'
import { supabase, ModeloSuela, ReporteTendencia } from '@/lib/supabase'

function detectarTemporada(): string {
  const mes = new Date().getMonth() + 1
  if (mes >= 12 || mes <= 2) return 'verano'
  if (mes >= 3 && mes <= 5) return 'otono'
  if (mes >= 6 && mes <= 8) return 'invierno'
  return 'primavera'
}

function generarSugerenciaTexto(reporte: ReporteTendencia | null, modelos: ModeloSuela[], cat: string): string {
  if (reporte) {
    const concepto = cat === 'dama' ? reporte.concepto_dama : reporte.concepto_nino
    if (concepto) return concepto
    if (reporte.texto_completo) return reporte.texto_completo.substring(0, 200)
  }
  const temporada = detectarTemporada()
  if (cat === 'dama') {
    return temporada === 'verano' || temporada === 'primavera'
      ? 'Suela plana o cuña en EVA, colores arena y blanco, acabado liso, ideal para sandalias y calzado casual de verano.'
      : 'Suela gruesa tipo block con costura visible, colores oscuros tierra, ideal para botas y botines de invierno.'
  }
  return temporada === 'verano' || temporada === 'primavera'
    ? 'Suela liviana con buena flexibilidad, colores brillantes, diseño activo para zapatillas escolares de verano.'
    : 'Suela de goma antideslizante con buen agarre, colores oscuros, aislante para calzado de invierno infantil.'
}

export default function Diseno() {
  const [modelos, setModelos] = useState<ModeloSuela[]>([])
  const [reporte, setReporte] = useState<ReporteTendencia | null>(null)
  const [loading, setLoading] = useState(true)

  // Generador de imágenes
  const [categoria, setCategoria] = useState<'dama' | 'nino'>('dama')
  const [temporadaSel, setTemporadaSel] = useState<'verano' | 'invierno'>('verano')
  const [generando, setGenerando] = useState(false)
  const [imagenGenerada, setImagenGenerada] = useState<string | null>(null)
  const [errorImg, setErrorImg] = useState('')
  const [modeloUsado, setModeloUsado] = useState('')

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

  async function generarImagen() {
    setGenerando(true)
    setErrorImg('')
    setImagenGenerada(null)
    setModeloUsado('')

    const concepto = generarSugerenciaTexto(reporte, modelos, categoria)

    try {
      const res = await fetch('/api/generar-imagen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria, temporada: temporadaSel, concepto }),
      })
      const data = await res.json()
      if (data.imagen) {
        setImagenGenerada(data.imagen)
        setModeloUsado(data.modelo || '')
      } else {
        setErrorImg(data.error || 'No se pudo generar la imagen.')
      }
    } catch {
      setErrorImg('Error de conexión al generar la imagen.')
    } finally {
      setGenerando(false)
    }
  }

  const stats = {
    damVerano: modelos.filter(m => m.categoria === 'dama' && m.temporada === 'verano').length,
    damInvierno: modelos.filter(m => m.categoria === 'dama' && m.temporada === 'invierno').length,
    ninVerano: modelos.filter(m => m.categoria === 'nino' && m.temporada === 'verano').length,
    ninInvierno: modelos.filter(m => m.categoria === 'nino' && m.temporada === 'invierno').length,
  }

  const temporadaCtx = reporte?.temporada || detectarTemporada()
  const conceptoActual = generarSugerenciaTexto(reporte, modelos, categoria)

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">✨ Diseño de Nuevos Modelos</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Contexto temporada */}
          <div className="bg-gradient-to-r from-purple-900 to-purple-600 rounded-2xl p-4 text-white">
            <p className="text-purple-200 text-xs uppercase tracking-wide">Temporada actual</p>
            <p className="text-xl font-bold capitalize mt-1">
              {temporadaCtx === 'otono' ? 'Otoño' : temporadaCtx.charAt(0).toUpperCase() + temporadaCtx.slice(1)} 2025
            </p>
            <p className="text-purple-200 text-sm mt-1">
              {reporte
                ? `Tendencias del ${new Date(reporte.fecha).toLocaleDateString('es-AR')}`
                : 'Sin reporte aún — llega cada lunes a las 8AM'}
            </p>
          </div>

          {/* Colección actual */}
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
          </div>

          {/* Últimas fotos */}
          {modelos.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">🖼️ Modelos cargados (referencia)</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {modelos.slice(0, 8).map(m => (
                  <div key={m.id} className="flex-shrink-0 w-20">
                    <img src={m.public_url} alt={m.nombre} className="w-20 h-20 object-cover rounded-xl" />
                    <p className="text-xs text-gray-400 mt-1 truncate text-center">{m.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GENERADOR DE IMÁGENES */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-purple-100">
            <h3 className="font-semibold text-gray-800 mb-1">🎨 Generar imagen de diseño con IA</h3>
            <p className="text-xs text-gray-500 mb-4">
              La IA crea una imagen del próximo modelo sugerido según tus tendencias y colección.
            </p>

            {/* Selector categoría */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setCategoria('dama')}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${categoria === 'dama' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                👠 Dama
              </button>
              <button
                onClick={() => setCategoria('nino')}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${categoria === 'nino' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                👟 Niño
              </button>
            </div>

            {/* Selector temporada */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Temporada</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setTemporadaSel('verano')}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${temporadaSel === 'verano' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                ☀️ Verano
              </button>
              <button
                onClick={() => setTemporadaSel('invierno')}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${temporadaSel === 'invierno' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                ❄️ Invierno
              </button>
            </div>

            {/* Concepto base */}
            <div className="bg-purple-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-purple-600 font-medium mb-1">Concepto base (de tus tendencias):</p>
              <p className="text-xs text-gray-600 leading-relaxed">{conceptoActual.substring(0, 120)}...</p>
            </div>

            {/* Botón generar */}
            <button
              onClick={generarImagen}
              disabled={generando}
              className="w-full bg-purple-700 text-white rounded-2xl py-4 font-bold text-base disabled:opacity-60 transition-all active:scale-95"
            >
              {generando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Generando... puede tardar 30-60s
                </span>
              ) : '🎨 Generar imagen de suela'}
            </button>

            {/* Error */}
            {errorImg && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">⚠️ {errorImg}</p>
              </div>
            )}

            {/* Imagen generada */}
            {imagenGenerada && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 text-center">
                  Diseño generado con IA {modeloUsado ? `(${modeloUsado})` : ''}
                </p>
                <img
                  src={imagenGenerada}
                  alt="Diseño de suela generado por IA"
                  className="w-full rounded-2xl shadow-md"
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Usá esta imagen como referencia de concepto visual
                </p>
                <button
                  onClick={generarImagen}
                  className="mt-3 w-full bg-gray-100 text-gray-700 rounded-xl py-3 text-sm font-medium"
                >
                  🔄 Generar otra variante
                </button>
              </div>
            )}
          </div>

          {/* CTA subir */}
          <a
            href="/subir"
            className="block w-full bg-gray-800 text-white rounded-2xl py-4 text-center font-bold text-base"
          >
            📷 Subir nuevo modelo
          </a>
        </>
      )}
    </div>
  )
}
