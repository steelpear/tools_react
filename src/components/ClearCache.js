import { useRef } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'

export const ClearCache = () => {
  const toast = useRef(null)

  const clear = async () => {
    const res = await fetch('https://broniryem.ru/api/Tools/cache')
    const response = await res.json()
    {response.result && toast.current.show({severity:'success', summary: 'Готово', detail:'Кэш сброшен', life: 2500})}
  }

  return (
    <div className="card flex justify-content-center">
      <Button icon="pi pi-sync" rounded text severity="secondary" aria-label="Clear" onClick={() => clear()} tooltip="Сбросить кэш" tooltipOptions={{ position: 'left' }} />
      <Toast ref={toast} position="top-center" />
    </div>
  )
}
 