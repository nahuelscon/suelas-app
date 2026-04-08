import { NextRequest, NextResponse } from 'next/server'

function construirPrompt(categoria: string, temporada: string, concepto: string): string {
  const esDama = categoria === 'dama'
  const esVerano = temporada === 'verano' || temporada === 'primavera'

  const tipo = esDama ? "women's shoe sole" : "children's shoe sole"
  const estilo = esVerano
    ? 'lightweight summer style, flat or low wedge'
    : 'thick winter boot sole, deep lug tread pattern'
  const material = esVerano
    ? 'smooth EVA foam rubber'
    : 'durable rubber with textured grip'
  const color = esVerano
    ? 'neutral beige, white, or warm earth tones'
    : 'black, dark brown, or deep burgundy'
  const contexto = concepto ? concepto.substring(0, 120) : ''

  return [
    `Professional product photography of a ${tipo}`,
    estilo,
    material,
    color,
    contexto,
    'isolated on a pure white background',
    'flat lay top-down view',
    'studio lighting, ultra sharp focus, high detail',
    'realistic product photo, 4K quality',
  ].filter(Boolean).join(', ')
}

// === OPENAI DALL-E 3 ===
async function generarConDallE(prompt: string, apiKey: string): Promise<string | null> {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    }),
    signal: AbortSignal.timeout(55000),
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.data?.[0]?.url || null
}

// === HUGGINGFACE FALLBACK ===
const MODELOS_HF = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-xl-base-1.0',
]

async function generarConHF(prompt: string, token: string): Promise<string | null> {
  for (const modelo of MODELOS_HF) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${modelo}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { num_inference_steps: 4, guidance_scale: 3.5 },
        }),
        signal: AbortSignal.timeout(55000),
      })

      if (!res.ok) continue
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('image')) continue

      const buf = await res.arrayBuffer()
      const b64 = Buffer.from(buf).toString('base64')
      const mime = ct.split(';')[0].trim()
      return `data:${mime};base64,${b64}`
    } catch {
      continue
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  const { categoria, temporada, concepto } = await req.json()
  const prompt = construirPrompt(categoria || 'dama', temporada || 'verano', concepto || '')

  const openaiKey = process.env.OPENAI_API_KEY
  const hfToken = process.env.HF_TOKEN

  // 1) Intentar con DALL-E 3
  if (openaiKey) {
    const url = await generarConDallE(prompt, openaiKey)
    if (url) {
      return NextResponse.json({ imagen: url, motor: 'DALL-E 3', prompt })
    }
  }

  // 2) Fallback: HuggingFace
  if (hfToken) {
    const img = await generarConHF(prompt, hfToken)
    if (img) {
      return NextResponse.json({ imagen: img, motor: 'HuggingFace', prompt })
    }
    return NextResponse.json(
      { error: 'Los modelos de IA están cargando. Intentá en 1-2 minutos.' },
      { status: 503 }
    )
  }

  return NextResponse.json(
    { error: 'No hay clave de IA configurada (OPENAI_API_KEY o HF_TOKEN).' },
    { status: 500 }
  )
}
