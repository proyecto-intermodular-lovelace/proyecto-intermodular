import { useState } from 'react'
import apiFetch from '../../services/api'
import { Card, Button, Tooltip } from '../../components/ui'

export default function ProductsImportPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [productType, setProductType] = useState('auto')

  const onPreview = async () => {
    if (!file) return alert('Selecciona un archivo CSV')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await apiFetch('/products/import/preview', { method: 'POST', body: fd })
      setPreview(res)
      setResult(null)
    } catch (e) {
      alert(e.body?.message || e.message)
    }
  }

  const pollJob = async (jobId) => {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 1000))
      try {
        const job = await apiFetch(`/products/import/jobs/${jobId}`)
        if (job.status === 'DONE' || job.status === 'FAILED') {
          return {
            processed: job.processed ?? 0,
            created: job.createdCount ?? 0,
            updated: job.updatedCount ?? 0,
            errors: job.errors ?? [],
            status: job.status,
          }
        }
      } catch { /* retry */ }
    }
    return { processed: 0, created: 0, updated: 0, errors: [{ message: 'Timeout esperando resultado' }], status: 'TIMEOUT' }
  }

  const onProcess = async (policy = 'skip') => {
    if (!file) return alert('Selecciona un archivo CSV')
    setProcessing(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('policy', policy)
    if (productType !== 'auto') fd.append('defaultProductType', productType)
    try {
      const res = await apiFetch('/products/import/process', { method: 'POST', body: fd })
      if (res.jobId) {
        const jobResult = await pollJob(res.jobId)
        setResult(jobResult)
      } else {
        setResult(res)
      }
      setPreview(null)
    } catch (e) {
      alert(e.body?.message || e.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6 p-4 short:pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Importar productos (CSV)</h2>
      </div>

      <Card>
        <div className="px-6 py-4 bg-cifp-neutral-50 border-b border-cifp-neutral-200 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                className="file-input"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="text-sm text-cifp-neutral-600 mt-2">
                Sube un CSV exportado desde Ingredientes o Materiales. Si el CSV incluye columna <strong>tipo</strong> (INGREDIENT/MATERIAL), se respeta automáticamente.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-cifp-neutral-700 whitespace-nowrap flex items-center gap-1">
                Tipo por defecto:
                <Tooltip text="Si tu CSV no tiene columna 'tipo', este valor se asignará a todos los productos. Selecciona 'Auto' para respetar lo que indique el CSV." asIcon />
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="border border-cifp-neutral-300 rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                <option value="auto">Auto (del CSV)</option>
                <option value="INGREDIENT">Ingredientes</option>
                <option value="MATERIAL">Materiales</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end items-center">
            <Tooltip text="Muestra las primeras filas del CSV para verificar que las columnas se mapean correctamente antes de importar.">
              <Button onClick={onPreview} className="min-w-[120px]">Vista previa</Button>
            </Tooltip>
            <Tooltip text="Importa los productos. Si un código ya existe en la base de datos, lo ignora y no lo modifica.">
              <Button onClick={() => onProcess('skip')} disabled={processing} variant="secondary">Procesar (skip)</Button>
            </Tooltip>
            <Tooltip text="Importa los productos. Si un código ya existe, actualiza sus datos con los valores del CSV.">
              <Button onClick={() => onProcess('update')} disabled={processing} variant="secondary">Procesar (update)</Button>
            </Tooltip>
          </div>
        </div>

        <div className="overflow-x-auto">
          {preview ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Preview ({preview.totalRows} filas)</h3>
                <div className="text-sm text-cifp-neutral-600 flex items-center gap-1">
                  Errores totales: <span className="font-semibold">{preview.errorCount}</span>
                  <Tooltip text="Número de campos con problemas de validación (ej: SKU vacío, precio no numérico). Corrige el CSV y vuelve a previsualizar." asIcon />
                </div>
              </div>

              {preview.headers && (
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                  <span className="text-xs text-cifp-neutral-500 mr-1">Columnas detectadas:</span>
                  {preview.headers.map((h) => (
                    <span key={h} className="text-xs px-2 py-1 bg-cifp-neutral-100 text-cifp-neutral-700 rounded-lg">{h}</span>
                  ))}
                  <Tooltip text="Estas son las cabeceras detectadas en tu CSV. Se mapean automáticamente a los campos del sistema (ej: 'nombre' → name, 'precio' → unitPrice)." asIcon />
                </div>
              )}

              <table className="w-full">
                <thead className="bg-cifp-neutral-100 text-cifp-neutral-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Code</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Unit Type</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Errors</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-cifp-neutral-200">
                  {preview.preview.map((r) => (
                    <tr key={r.row} className="hover:bg-cifp-neutral-50">
                      <td className="px-4 py-2 text-sm font-mono text-cifp-neutral-600">{r.row}</td>
                      <td className="px-4 py-2 text-sm text-cifp-neutral-900">{r.data.code || r.raw?.code || r.raw?.sku || '—'}</td>
                      <td className="px-4 py-2 text-sm text-cifp-neutral-900">{r.data.name || Object.values(r.raw || {}).slice(0,1).join('') || '—'}</td>
                      <td className="px-4 py-2 text-sm text-cifp-neutral-700">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.data.productType === 'MATERIAL' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                          {r.data.productType || r.raw?.tipo || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-cifp-neutral-700">{r.data.unitType || r.raw?.unitType || r.raw?.unit_type || '—'}</td>
                      <td className="px-4 py-2 text-sm text-right text-cifp-neutral-700">{typeof r.data.unitPrice === 'number' && !isNaN(r.data.unitPrice) ? r.data.unitPrice : (r.raw?.unitPrice || r.raw?.unit_price || '—')}</td>
                      <td className="px-4 py-2 text-sm text-cifp-red">{r.errors?.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-sm text-cifp-neutral-600">Sube un CSV y pulsa "Vista previa" para ver las primeras filas y validar columnas.</div>
          )}
        </div>
      </Card>

      {result && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Resultado</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1">Procesadas: <strong>{result.processed}</strong> <Tooltip text="Total de filas del CSV que se intentaron importar." asIcon /></div>
              <div className="flex items-center gap-1">Creadas: <strong>{result.created}</strong> <Tooltip text="Productos nuevos añadidos a la base de datos." asIcon /></div>
              <div className="flex items-center gap-1">Actualizadas: <strong>{result.updated}</strong> <Tooltip text="Productos existentes cuyos datos se actualizaron (solo en modo 'update')." asIcon /></div>
              <div className="flex items-center gap-1">Errores: <strong>{result.errors?.length || 0}</strong> <Tooltip text="Filas que no se pudieron importar por datos incorrectos o incompletos." asIcon /></div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
