import { useState, forwardRef } from 'react'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'

export const HotelsListDialog = forwardRef(function HotelsListDialog(props, op) {
  const [value, setValue] = useState('')

  const closeOverlayPanel = (e) => {
    op.current.toggle(e)
  }

  return (
    <OverlayPanel ref={op} showCloseIcon style={{width:300}} {...props}>
      <div className="flex justify-content-center">
        <div>
          <label htmlFor="phone" className="font-medium text-center block mb-2">Информация о номере</label>
          <InputTextarea autoResize value={value} onChange={(e) => setValue(e.target.value)} rows={5} cols={30} />
        </div>
      </div>
      <div className="flex align-items-center justify-content-between mt-2">
        <Button icon="pi pi-times" rounded text severity="danger" size='large' aria-label="Close" onClick={(e) => closeOverlayPanel(e)} />
        <Button icon="pi pi-check" rounded text severity="info" size='large' aria-label="Confirm" onClick={() => closeOverlayPanel(e)} />
      </div>
    </OverlayPanel>
  )
})
 