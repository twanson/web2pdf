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
      const recipeElements = Array.from(document.querySelectorAll('[class*="recipe-card"], [class*="RecipeCard"]'))
      
      if (recipeElements.length === 0) {
        const elements = document.querySelectorAll('a[href*="/recipes/"]')
        return Array.from(elements)
          .filter(element => {
            const href = element.getAttribute('href') || ''
            const text = element.textContent?.trim() || ''
            
            const collectionKeywords = [
              'colección',
              'collection',
              'recetas-faciles',
              'recetas-vegetarianas',
              'recetas-familiares',
              'recetas-con-pesto',
              'recetas-asiaticas',
              'recetas-bajas-en-calorias',
              'recetas-caseras',
              'gourmet',
              'más de',
              'más recetas',
              'descubre'
            ]

            const isRecipe = 
              href.includes('/recipes/') && 
              !collectionKeywords.some(keyword => 
                href.toLowerCase().includes(keyword) || 
                text.toLowerCase().includes(keyword)
              ) &&
              (text.includes('kcal') || 
               text.includes('minutos') ||
               text.includes('Fácil') ||
               text.includes('Medio'))

            return isRecipe
          })
          .map((element) => {
            const rawTitle = element.textContent?.trim() || ''
            
            // Limpieza del título
            let title = rawTitle
              // Separar palabras pegadas por mayúsculas
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              // Separar palabras pegadas por números
              .replace(/(\d+)([A-Za-z])/g, '$1 $2')
              // Normalizar espacios
              .replace(/\s+/g, ' ')
              // Separar números y unidades
              .replace(/(\d+)(kcal|minutos)/g, '$1 $2')
              // Separar etiquetas comunes
              .replace(/(FAMILIA|VEGETARIANO|PICANTE|MENOS CO2)(\d+)/g, '$1 $2')
              // Separar palabras pegadas con "con"
              .replace(/([a-z])(con)([A-Z])/gi, '$1 con $3')
              // Normalizar "Fácil"
              .replace(/Facil/gi, 'Fácil')
              // Separar etiquetas del tiempo
              .replace(/(\d+)minutos/g, '$1 minutos')
              // Capitalizar primera letra de cada palabra importante
              .split(' ')
              .map((word, index) => {
                // Palabras que siempre van en minúsculas
                const commonWords = ['con', 'de', 'y', 'en', 'el', 'la', 'los', 'las', 'al', 'del', 'a', 'para']
                // Palabras que siempre van en mayúsculas
                const upperWords = ['co2', 'una']
                
                if (upperWords.includes(word.toLowerCase())) {
                  return word.toUpperCase()
                }
                if (index === 0 || !commonWords.includes(word.toLowerCase())) {
                  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                }
                return word.toLowerCase()
              })
              .join(' ')
              // Limpiar espacios alrededor de barras
              .replace(/\s*\|\s*/g, ' | ')
              // Eliminar espacios múltiples finales
              .trim()

            return {
              title,
              url: element.getAttribute('href') || '',
            }
          })
      }
      
      return recipeElements.map(element => ({
        title: element.querySelector('h3, [class*="title"]')?.textContent?.trim() || '',
        url: element.querySelector('a')?.getAttribute('href') || '',
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
