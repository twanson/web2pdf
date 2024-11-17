'use client'
import { useState, useEffect } from 'react'

interface ContentListProps {
  url: string
}

export default function ContentList({ url }: ContentListProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })
        
        if (!response.ok) {
          throw new Error('Error al extraer el contenido')
        }
        
        const data = await response.json()
        setItems(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  if (loading) return <div>Cargando contenido...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="p-4 border rounded">
          <h3 className="font-bold">{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  )
}
