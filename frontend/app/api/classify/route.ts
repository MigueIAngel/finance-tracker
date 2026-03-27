import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${GEMINI_API_KEY}`

export async function POST(request: NextRequest) {
  const { note, categories } = await request.json() as {
    note: string
    categories: Array<{ id: number; name: string; type: string }>
  }

  const categoryList = categories.map(c => c.name).join(', ')
  const prompt = `Clasifica esta transacción en una de las siguientes categorías. Responde SOLO con el nombre exacto de la categoría, sin explicación ni puntuación adicional.

Transacción: "${note}"

Categorías disponibles: ${categoryList}

Categoría:`

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 20, temperature: 0 },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.error?.message ?? 'Gemini error' }, { status: 502 })
  }

  const data = await res.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

  // Find exact or partial match against known category names
  const match = categories.find(
    c => c.name.toLowerCase() === raw.toLowerCase()
  ) ?? categories.find(
    c => raw.toLowerCase().includes(c.name.toLowerCase())
  )

  if (!match) {
    return NextResponse.json({ error: `No match for: "${raw}"` }, { status: 422 })
  }

  return NextResponse.json({ categoryId: match.id, categoryName: match.name })
}
