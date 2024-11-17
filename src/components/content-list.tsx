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
        setLoading(true)
        setError('')
        
        const response = await fetch('/api/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setItems(data.items || [])
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message || 'Error al extraer el contenido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  if (items.length === 0) return <div>No se encontraron elementos</div>

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="p-4 border rounded mb-2">
          <h3>{item.title}</h3>
          {item.description && <p>{item.description}</p>}
        </div>
      ))}
    </div>
  )
}
