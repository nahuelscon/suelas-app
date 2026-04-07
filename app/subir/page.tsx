'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function SubirFoto() {
  const [temporada, setTemporada] = useState<'verano' | 'invierno'>('verano')
  const [categoria, setCategoria] = useState<'dama' | 'nino'>('dama')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function seleccionarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
    setExito(false)
    setError('')
    // Auto-completar nombre si está vacío
    if (!nombre) {
      const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setNombre(nombreSinExtension)
    }
  }

  async function subirFoto() {
    if (!archivo) { setError('Seleccioná una foto primero.'); return }
    if (!nombre.trim()) { setError('Ingresá un nombre para el modelo.'); return }

    setSubiendo(true)
    setError('')

    try {
      // Nombre único para el archivo
      const extension = archivo.name.split('.').pop()
      const nombreArchivo = `${temporada}/${categoria}/${Date.now()}.${extension}`

      // Subir imagen a Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('suelas-fotos')
        .upload(nombreArchivo, archivo, { contentType: archivo.type })

      if (storageError) throw new Error(`Error storage: ${storageError.message}`)

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('suelas-fotos')
        .getPublicUrl(nombreArchivo)

      // Guardar en base de datos
      const { error: dbError } = await supabase.from('modelos_suela').insert({
        nombre: nombre.trim(),
        temporada,
        categoria,
        descripcion: descripcion.trim() || null,
        storage_path: nombreArchivo,
        public_url: urlData.publicUrl,
      })

      if (dbError) throw new Error(`Error base de datos: ${dbError.message}`)

      // Limpiar formulario
      setExito(true)
      setArchivo(null)
      setPreview(null)
      setNombre('')
      setDescripcion('')
      if (inputRef.current) inputRef.current.value = ''

    } catch (err: any) {
      setError(err.message || 'Error al subir la foto.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Subir modelo de suela</h2>

      {/* Éxito */}
      {exito && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-green-700 font-medium">¡Modelo cargado con éxito!</p>
            <a href="/galeria" className="text-green-600 text-sm underline">Ver en galería →</a>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Foto */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-purple-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-purple-50 transition-colors"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-52 object-cover rounded-xl" />
        ) : (
          <>
            <p className="text-5xl mb-2">📷</p>
            <p className="text-purple-700 font-medium">Tocá para elegir una foto</p>
            <p className="text-gray-400 text-sm mt-1">JPG o PNG desde tu cámara o galería</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={seleccionarArchivo}
          className="hidden"
          capture="environment"
        />
      </div>

      {preview && (
        <button
          onClick={() => { setArchivo(null); setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
          className="w-full text-sm text-gray-500 underline"
        >
          Cambiar foto
        </button>
      )}

      {/* Temporada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Temporada</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTemporada('verano')}
            className={`py-3 rounded-xl font-medium transition-all ${temporada === 'verano' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            ☀️ Verano
          </button>
          <button
            onClick={() => setTemporada('invierno')}
            className={`py-3 rounded-xl font-medium transition-all ${temporada === 'invierno' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            ❄️ Invierno
          </button>
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setCategoria('dama')}
            className={`py-3 rounded-xl font-medium transition-all ${categoria === 'dama' ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            👠 Dama
          </button>
          <button
            onClick={() => setCategoria('nino')}
            className={`py-3 rounded-xl font-medium transition-all ${categoria === 'nino' ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            👟 Niño
          </button>
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del modelo</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej: Plataforma verano ref 201"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Ej: Suela EVA 6cm, punta cuadrada, textura lisa"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
        />
      </div>

      {/* Botón subir */}
      <button
        onClick={subirFoto}
        disabled={subiendo || !archivo}
        className="w-full bg-purple-700 text-white rounded-2xl py-4 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        {subiendo ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Subiendo...
          </span>
        ) : 'Guardar modelo'}
      </button>
    </div>
  )
}
