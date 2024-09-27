import { useState } from 'react'
import Head from 'next/head'
import { MainLayout } from '../components/MainLayout'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputSwitch } from 'primereact/inputswitch'

export default function Finder () {
  const [textAreaItems, setTextAreaItems] = useState('')
  const [responseIds, setResponseIds] = useState('')
  const [regularText, setRegularText] = useState('')
  const [checkedRegular, setCheckedRegular] = useState(false)
  const [checkedSource, setCheckedSource] = useState(false)
  const [checkedMode, setCheckedMode] = useState(false)
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

  const findIds = () => {
    const txt = textAreaItems.split('\n')
    const text = txt.map(item => item.trim())
    if (checkedMode) {
      const out = []
      text.map(item => {
        fetch(checkedSource ? '/api/finderbyurl' : '/api/finderbyname', {
          method: 'POST',
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({data: item, mode: 'estimated'})})
        .then((response) => {return response.json()})
        .then((data) => {if (data && data.length > 0) {out.push(data[0]._id)}})
        .catch(error => console.log(error))
      })
      setResponseIds(out)
    } else {
      fetch(checkedSource ? '/api/finderbyurl' : '/api/finderbyname', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({data: text, mode: 'exact'})})
      .then((response) => {return response.json()})
      .then((data) => {setResponseIds(data.map(item => item._id))})
      .catch(error => console.log(error))
    }
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
              <label htmlFor='switch' className='ml-4 text-sm w-full md:w-3rem'>{checkedSource ? 'URL' : 'Name'}</label>
              <InputSwitch checked={checkedSource} onChange={(e) => setCheckedSource(e.value)} className='ml-1' inputId="switch" />
              <label htmlFor='switch1' className='ml-4 text-sm w-full md:w-4rem'>{checkedMode ? 'Вхожд.' : 'Точное'}</label>
              <InputSwitch checked={checkedMode} onChange={(e) => setCheckedMode(e.value)} className='ml-1' inputId="switch1" />
              <Button label="Найти" icon="pi pi-search" disabled={!textAreaItems} className="w-full md:w-15rem ml-4" onClick={() => findIds()} />
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
