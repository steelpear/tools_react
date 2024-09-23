import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import {useSWRConfig} from 'swr'
import { MainLayout } from '../components/MainLayout'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputTextarea } from 'primereact/inputtextarea'
import { Fieldset } from 'primereact/fieldset'
import { Chip } from 'primereact/chip'
import { Badge } from 'primereact/badge'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputSwitch } from 'primereact/inputswitch'
import { Card } from 'primereact/card'
import { MultiSelect } from 'primereact/multiselect'
import { Tooltip } from 'primereact/tooltip'
import { Toast } from 'primereact/toast'
import { Menu } from 'primereact/menu'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Finder () {
  const { mutate } = useSWRConfig()

  const [textAreaItems, setTextAreaItems] = useState('')
  const [responseIds, setResponseIds] = useState('')
  const [regularText, setRegularText] = useState('')
  const [checkedRegular, setCheckedRegular] = useState(false)
  const [checkedSource, setCheckedSource] = useState(false)
  const [textAreaLength, setTextAreaLength] = useState(null)

  const clearArea = () => {
    setTextAreaItems('')
    setTextAreaLength(null)
    setResponseIds('')
  }

  const onChangeArea = (e) => {
    const txt = e.target.value
    let lngt = 0
    if (checkedRegular) {
      setTextAreaItems(txt.replace(regularText ? new RegExp(regularText,'gm') : /[0-9()-]/g, ''))
      lngt = txt.split('\n')
      setTextAreaLength(lngt.length)
    } else {
      setTextAreaItems(txt)
      lngt = txt.split('\n')
      setTextAreaLength(lngt.length)
    }
  }

  const findByName = async () => {
    const txt = textAreaItems.split('\n')
    const text = txt.map(item => item.trim())
    const res = await fetch('/api/finderbyname', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(text)
    })
    const resIds = await res.json()
    const ids = resIds.map(item => item._id)
    setResponseIds(ids)
 }

 const exportIds = () => {
  const ids = JSON.stringify(responseIds)
  const date = new Date()
  const name = 'id-finder_' + ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear() + '_' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '.json'
  const blob = new Blob([ids], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.download = name
  link.href = url
  link.click()
}

  return (
    <>
      <Head>
        <title>ID Finder / Инструменты</title>
      </Head>
      <MainLayout title='ID Finder / Инструменты'>
        <main>
          <div className="mt-3">
            <div className="card flex justify-content-start align-items-center">
              <InputSwitch checked={checkedRegular} onChange={(e) => setCheckedRegular(e.value)} />
              <div className="flex flex-column gap-1 mb-3 ml-2">
                <InputText value={regularText} disabled={!checkedRegular} onChange={(e) => setRegularText(e.target.value)} id="regular" aria-describedby="regular-help" placeholder='[0-9()-]'/>
                <small id="regular-help">Регулярное выражение. По умолчанию - удалить все цифры, скобки и дефисы [0-9()-]. Удалить пустые строки ^\s*[\r\n]</small>
              </div>
            </div>
            <InputTextarea value={textAreaItems} onChange={(e) => onChangeArea(e)} rows={8} className="w-full" />
            <div className="mt-2 flex justify-content-center align-items-center">
              {textAreaLength > 0 && <span className='mr-2 w-full md:w-5rem'>Строк: {textAreaLength}</span>}
              <Button icon="pi pi-times" disabled={!textAreaItems} rounded outlined severity="danger" aria-label="ClearArea" onClick={() => clearArea()} />
              <label htmlFor='switch' className='ml-4 text-xs w-full md:w-2rem'>{checkedSource ? 'Urls' : 'Name'}</label>
              <InputSwitch checked={checkedSource} onChange={(e) => setCheckedSource(e.value)} className='ml-1' inputId="switch" />
              <Button label="Найти" icon="pi pi-search" disabled={!textAreaItems} className="w-full md:w-15rem ml-4" onClick={() => findByName()} />
            </div>
          </div>
          {responseIds && <div className='flex align-items-center px-3'>
            <div className='mr-3'>Найдено ID: {responseIds.length}</div>
            <Button icon="pi pi-file-export" rounded text severity="info" onClick={() => exportIds()} aria-controls="filter_menu" aria-haspopup tooltip="Экспорт" tooltipOptions={{position: 'top'}} />
          </div>}
        </main>
      </MainLayout>
    </>
  )
}
