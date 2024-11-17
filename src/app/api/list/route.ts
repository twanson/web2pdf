import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    console.log('URL recibida:', url)

    // Usar cors-anywhere como proxy
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`
    console.log('URL del proxy:', proxyUrl)
    
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'http://localhost:3000'
      }
    })

    console.log('Estado de la respuesta:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    console.log('Longitud del HTML:', html.length)
    console.log('Primeros 200 caracteres:', html.substring(0, 200))

    const $ = cheerio.load(html)
    const items: any[] = []

    // Buscar elementos específicamente
    console.log('Buscando elementos...')
    
    $('div, article').each((_, element) => {
      const $element = $(element)
      const classNames = $element.attr('class') || ''
      console.log('Clase encontrada:', classNames)
      
      if (classNames.toLowerCase().includes('recipe')) {
        const title = $element.find('h1, h2, h3, h4').first().text().trim()
        const description = $element.find('p').first().text().trim()
        console.log('Elemento potencial:', { title, description })
        
        if (title || description) {
          items.push({ title, description, selected: false })
        }
      }
    })

    console.log('Total de elementos encontrados:', items.length)

    return new NextResponse(JSON.stringify({ items }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })

  } catch (error) {
    console.error('Error completo:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error al procesar la página',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
}
