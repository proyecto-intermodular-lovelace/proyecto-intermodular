import { useState } from 'react'
import apiFetch from '../../services/api'
import { Card, Button } from '../../components/ui'

export default function ProductsImportPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

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

  const onProcess = async (policy = 'skip') => {
    if (!file) return alert('Selecciona un archivo CSV')
    setProcessing(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('policy', policy)
    try {
      const res = await apiFetch('/products/import/process', { method: 'POST', body: fd })
      setResult(res)
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
        <div className="px-6 py-4 bg-cifp-neutral-50 border-b border-cifp-neutral-200 flex items-center gap-4">
          <div className="flex-1">
            <input
              className="file-input"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="text-sm text-cifp-neutral-600 mt-2">Usa el formato CSV con columnas: code, name, unitType, unitPrice, supplierId, categoryId, description, stock, stockMinimo</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onPreview} className="min-w-[120px]">Vista previa</Button>
            <Button onClick={() => onProcess('skip')} disabled={processing} variant="secondary">Procesar (skip)</Button>
            <Button onClick={() => onProcess('update')} disabled={processing} variant="secondary">Procesar (update)</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {preview ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Preview ({preview.totalRows} filas)</h3>
                <div className="text-sm text-cifp-neutral-600">Errores totales: <span className="font-semibold">{preview.errorCount}</span></div>
              </div>

              {preview.headers && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {preview.headers.map((h) => (
                    <span key={h} className="text-xs px-2 py-1 bg-cifp-neutral-100 text-cifp-neutral-700 rounded-lg">{h}</span>
                  ))}
                </div>
              )}

              <table className="w-full">
                <thead className="bg-cifp-neutral-100 text-cifp-neutral-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Code</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Name</th>
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
              <div>Procesadas: <strong>{result.processed}</strong></div>
              <div>Creadas: <strong>{result.created}</strong></div>
              <div>Actualizadas: <strong>{result.updated}</strong></div>
              <div>Errores: <strong>{result.errors?.length || 0}</strong></div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
