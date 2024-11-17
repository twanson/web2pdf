import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: Request) {
  try {
    console.log('Recibida petición POST')

    const body = await req.json()
    console.log('Body recibido:', body)

    const testData = {
      total: 2,
      items: [
        {
          id: '1',
          title: 'Test 1',
          description: 'Descripción 1'
        },
        {
          id: '2',
          title: 'Test 2',
          description: 'Descripción 2'
        }
      ]
    }

    return new NextResponse(JSON.stringify(testData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error en POST:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
}
