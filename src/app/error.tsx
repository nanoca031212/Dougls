'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Algo deu errado!
        </h1>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro inesperado. Tente novamente ou volte à página inicial.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
          <button 
            onClick={() => (window.location.href = '/')}
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  )
}