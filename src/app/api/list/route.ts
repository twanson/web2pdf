import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  let browser = null
  
  try {
    console.log('1. Iniciando proceso...')
    const { url } = await request.json()
    console.log('2. URL recibida:', url)

    console.log('3. Iniciando navegador...')
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox']
    })
    
    console.log('4. Navegador iniciado')
    const page = await browser.newPage()
    console.log('5. Nueva página creada')

    console.log('6. Navegando a:', url)
    await page.goto(url)
    console.log('7. Navegación completada')

    console.log('8. Extrayendo datos...')
    const items = await page.evaluate(() => {
      const elements = document.querySelectorAll('a[href*="/recipes/"]')
      return Array.from(elements).map((element) => ({
        title: element.textContent?.trim() || '',
        url: element.getAttribute('href') || '',
      }))
    })
    console.log('9. Datos extraídos:', items.length, 'items')

    await browser.close()
    console.log('10. Navegador cerrado')

    return NextResponse.json({
      success: true,
      items: items.filter(item => item.title && item.url)
    })

  } catch (error) {
    console.error('Error detallado:', error)
    console.error('Stack:', error.stack)
    
    if (browser) {
      await browser.close()
    }

    return NextResponse.json({
      success: false,
      error: `Error al procesar la página: ${error.message}`
    }, { status: 500 })
  }
}
