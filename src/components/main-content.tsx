'use client'
import { useState } from 'react'
import ContentList from './content-list'

const MainContent = () => {
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = () => {
    if (!url) {
      alert('Por favor, introduce una URL')
      return
    }
    setIsAnalyzing(true)
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center mb-8">
        Extractor de Contenido Web
      </h1>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Introduce la URL de la página"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Analizar
          </button>
        </div>
        
        {isAnalyzing && url && <ContentList url={url} />}
      </div>
    </main>
  )
}

export default MainContent