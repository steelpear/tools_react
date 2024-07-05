import {useState, useRef} from 'react'
import { InputMask } from "primereact/inputmask"
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'

export const PhoneNumberInfo = () => {
  const op = useRef(null)
  const [phoneValue, setPhoneValue] = useState()
  const [phoneData, setPhoneData] = useState()
  const [phoneDataLoading, setPhoneDataLoading] = useState(false)

  const getPhoneInfo = async () => {
    setPhoneDataLoading(true)
    const reg = new RegExp(/[-()/\\ ]/g)
    const res = await fetch(`https://broniryem.ru/api/Puma/phoneinfo?num=${phoneValue.replace(reg,'')}`)
    const response = await res.json()
    setPhoneData(response)
    setPhoneDataLoading(false)
  }

  const closeOverlayPanel = (e) => {
    op.current.toggle(e)
    setPhoneData('')
    setPhoneValue('')
  }

  return (
    <div className="card flex justify-content-center">
      <Button icon="pi pi-mobile" rounded text severity="info" size='large' aria-label="Region" onClick={(e) => op.current.toggle(e)} tooltip="Информация о номере" tooltipOptions={{ position: 'top' }} />
      <OverlayPanel ref={op} showCloseIcon style={{width:300}}>
        <div className="flex justify-content-center">
          <div>
            <label htmlFor="phone" className="font-medium text-center block mb-2">Информация о номере</label>
            <InputMask id="phone" value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} mask="9 (999) 999-99-99" placeholder="x (xxx) xxx-xx-xx" />
          </div>
        </div>
        <div className="flex align-items-center justify-content-between mt-2">
          <Button icon="pi pi-times" rounded text severity="danger" size='large' aria-label="Close" onClick={(e) => closeOverlayPanel(e)} tooltip="Очистить и закрыть" tooltipOptions={{ position: 'left' }} disabled={!phoneValue} />
          <Button icon="pi pi-check" rounded text severity="info" size='large' aria-label="GetInfo" onClick={() => getPhoneInfo()} tooltip="Получить информацию" tooltipOptions={{ position: 'right' }} loading={phoneDataLoading} disabled={!phoneValue} />
        </div>
        {phoneData &&
        <div>
          <div className='mb-1'>Номер: <span className="font-medium">+7{phoneData.full_num}</span></div>
          <div className='mb-1'>Оператор: <span className="font-medium">{phoneData.operator}</span></div>
          {phoneData.old_operator && <div className='mb-1'>Прошлый оператор: <span className="font-medium">{phoneData.old_operator}</span></div>}
          <div>Регион: <span className="font-medium">{phoneData.region}</span></div>
        </div>}
      </OverlayPanel>
    </div>
  )
}
 