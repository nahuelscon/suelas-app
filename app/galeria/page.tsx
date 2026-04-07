'use client'

import { useEffect, useState } from 'react'
import { supabase, ModeloSuela } from '@/lib/supabase'

type Filtro = { temporada: 'todos' | 'verano' | 'invierno'; categoria: 'todos' | 'dama' | 'nino' }

export default function Galeria() {
  const [modelos, setModelos] = useState<ModeloSuela[]>([])
  const [filtro, setFiltro] = useState<Filtro>({ temporada: 'todos', categoria: 'todos' })
  const [loading, setLoading] = useState(true)
  const [seleccionado, setSeleccionado] = useState<ModeloSuela | null>(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => { cargarModelos() }, [])

  async function cargarModelos() {
    setLoading(true)
    const { data } = await supabase
      .from('modelos_suela')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setModelos(data as ModeloSuela[])
    setLoading(false)
  }

  const modelosFiltrados = modelos.filter(m => {
    if (filtro.temporada !== 'todos' && m.temporada !== filtro.temporada) return false
    if (filtro.categoria !== 'todos' && m.categoria !== filtro.categoria) return false
    return true
  })

  async function eliminarModelo(modelo: ModeloSuela) {
    if (!confirm(`¿Eliminar "${modelo.nombre}"?`)) return
    setEliminando(true)
    await supabase.storage.from('suelas-fotos').remove([modelo.storage_path])
    await supabase.from('modelos_suela').delete().eq('id', modelo.id)
    setSeleccionado(null)
    await cargarModelos()
    setEliminando(false)
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Mis Modelos de Suelas</h2>

      {/* Filtros temporada */}
      <div className="flex gap-2 mb-3">
        {(['todos', 'verano', 'invierno'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFiltro(f => ({ ...f, temporada: t }))}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filtro.temporada === t
                ? 'bg-purple-700 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {t === 'todos' ? 'Todos' : t === 'verano' ? '☀️ Verano' : '❄️ Invierno'}
          </button>
        ))}
      </div>

      {/* Filtros categoría */}
      <div className="flex gap-2 mb-4">
        {(['todos', 'dama', 'nino'] as const).map(c => (
          <button
            key={c}
            onClick={() => setFiltro(f => ({ ...f, categoria: c }))}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filtro.categoria === c
                ? 'bg-purple-700 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {c === 'todos' ? 'Todos' : c === 'dama' ? '👠 Dama' : '👟 Niño'}
          </button>
        ))}
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500 mb-3">{modelosFiltrados.length} modelos encontrados</p>

      {/* Grilla */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : modelosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">👠</p>
          <p className="text-gray-500">No hay modelos con estos filtros.</p>
          <a href="/subir" className="mt-4 inline-block bg-purple-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium">
            Subir modelo
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {modelosFiltrados.map(m => (
            <div
              key={m.id}
              onClick={() => setSeleccionado(m)}
              className="relative rounded-2xl overflow-hidden bg-gray-100 h-44 cursor-pointer shadow-sm active:scale-95 transition-transform"
            >
              <img src={m.public_url} alt={m.nombre} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-semibold truncate">{m.nombre}</p>
                <div className="flex gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${m.temporada === 'verano' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                    {m.temporada === 'verano' ? '☀️ Verano' : '❄️ Invierno'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white">
                    {m.categoria === 'dama' ? 'Dama' : 'Niño'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle */}
      {seleccionado && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setSeleccionado(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto p-5" onClick={e => e.stopPropagation()}>
            <img src={seleccionado.public_url} alt={seleccionado.nombre} className="w-full h-56 object-cover rounded-2xl mb-4" />
            <h3 className="text-xl font-bold text-gray-800">{seleccionado.nombre}</h3>
            <div className="flex gap-2 mt-2">
              <span className={`text-sm px-3 py-1 rounded-full text-white ${seleccionado.temporada === 'verano' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                {seleccionado.temporada === 'verano' ? '☀️ Verano' : '❄️ Invierno'}
              </span>
              <span className="text-sm px-3 py-1 rounded-full bg-purple-600 text-white">
                {seleccionado.categoria === 'dama' ? '👠 Dama' : '👟 Niño'}
              </span>
            </div>
            {seleccionado.descripcion && (
              <p className="text-gray-600 text-sm mt-3">{seleccionado.descripcion}</p>
            )}
            <p className="text-gray-400 text-xs mt-2">
              Cargado el {new Date(seleccionado.created_at).toLocaleDateString('es-AR')}
            </p>
            <button
              onClick={() => eliminarModelo(seleccionado)}
              disabled={eliminando}
              className="w-full mt-4 bg-red-50 text-red-600 rounded-xl py-3 text-sm font-medium border border-red-200 disabled:opacity-50"
            >
              {eliminando ? 'Eliminando...' : 'Eliminar modelo'}
            </button>
            <button
              onClick={() => setSeleccionado(null)}
              className="w-full mt-2 bg-gray-100 text-gray-700 rounded-xl py-3 text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
