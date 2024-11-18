import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  let browser = null
  
  try {
    console.log('1. Iniciando proceso PDF')
    const { urls } = await request.json()
    console.log('2. URLs recibidas:', urls)
    
    if (!Array.isArray(urls) || urls.length === 0) {
      console.log('3. Error: No hay URLs válidas')
      return NextResponse.json({
        success: false,
        error: 'No se proporcionaron URLs válidas'
      }, { status: 400 })
    }

    console.log('4. Iniciando navegador')
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })

    // Array para almacenar el contenido de todas las recetas
    const recipes = []

    // Procesar cada URL
    for (const url of urls) {
      console.log('Procesando URL:', url)
      await page.goto(url, { waitUntil: 'networkidle0' })
      
      // Extraer contenido de la receta
      const recipeContent = await page.evaluate(() => {
        // Intentar diferentes selectores para el título
        const title = document.querySelector('h1, [class*="title"]')?.textContent?.trim() || 'Sin título'
        
        // Intentar diferentes selectores para ingredientes
        const ingredients = Array.from(
          document.querySelectorAll('[class*="ingredient"], [class*="Ingredient"]')
        ).map(el => el.textContent?.trim()).filter(Boolean)

        // Intentar diferentes selectores para instrucciones
        const instructions = Array.from(
          document.querySelectorAll('[class*="instruction"], [class*="Instruction"], [class*="step"], [class*="Step"]')
        ).map(el => el.textContent?.trim()).filter(Boolean)

        // Intentar obtener tiempo y porciones
        const time = document.querySelector('[class*="time"], [class*="Time"]')?.textContent?.trim() || ''
        const servings = document.querySelector('[class*="serving"], [class*="Serving"]')?.textContent?.trim() || ''

        return { title, ingredients, instructions, time, servings }
      })

      console.log('Contenido extraído:', recipeContent.title)
      recipes.push(recipeContent)
    }

    // Generar HTML para el PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .recipe {
              margin-bottom: 40px;
              page-break-after: always;
              padding: 20px;
            }
            h1 {
              color: #2563eb;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            h2 {
              color: #1e40af;
              margin-top: 20px;
            }
            .meta {
              color: #666;
              font-style: italic;
              margin: 10px 0;
            }
            ul, ol {
              margin-left: 20px;
              margin-bottom: 20px;
            }
            li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          ${recipes.map(recipe => `
            <div class="recipe">
              <h1>${recipe.title}</h1>
              ${recipe.time || recipe.servings ? `
                <div class="meta">
                  ${recipe.time ? `⏱️ ${recipe.time}` : ''}
                  ${recipe.time && recipe.servings ? ' | ' : ''}
                  ${recipe.servings ? `👥 ${recipe.servings}` : ''}
                </div>
              ` : ''}
              <div class="ingredients">
                <h2>Ingredientes:</h2>
                <ul>
                  ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
              </div>
              <div class="instructions">
                <h2>Instrucciones:</h2>
                <ol>
                  ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
                </ol>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `

    // Generar PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true
    })

    await browser.close()

    // Devolver el PDF
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="recetas.pdf"'
      }
    })

  } catch (error) {
    console.error('Error:', error)
    
    if (browser) {
      await browser.close()
    }

    return NextResponse.json({
      success: false,
      error: 'Error al generar el PDF'
    }, { status: 500 })
  }
}
