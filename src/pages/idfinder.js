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
import { MultiSelect } from 'primereact/multiselect'
import { Tooltip } from 'primereact/tooltip'
import { Toast } from 'primereact/toast'
import { Menu } from 'primereact/menu'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Finder () {
  const { mutate } = useSWRConfig()

  const [textAreaItems, setTextAreaItems] = useState('')
  const [regularText, setRegularText] = useState('')
  const [checkedRegular, setCheckedRegular] = useState(false)

  const clearArea = () => {
    setTextAreaItems('')
  }

  const onChangeArea = (e) => {
    const txt = e.target.value
    if (checkedRegular) {
      setTextAreaItems(txt.replace(regularText ? new RegExp(regularText,'gm') : /[0-9()-]/g, ''))
    } else {
      setTextAreaItems(txt)
    }
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
              <div className="flex flex-column gap-1 mb-2 ml-2">
                <InputText value={regularText} disabled={!checkedRegular} onChange={(e) => setRegularText(e.target.value)} id="regular" aria-describedby="regular-help" placeholder='[0-9()-]'/>
                <small id="regular-help">Регулярное выражение. По умолчанию - удалить все цифры, скобки и дефисы [0-9()-]. Удалить пустые строки ^\s*[\r\n]</small>
              </div>
            </div>
            <InputTextarea value={textAreaItems} onChange={(e) => onChangeArea(e)} rows={8} className="w-full" />
            <div className="mt-2 flex justify-content-center">
              <Button icon="pi pi-times" disabled={!textAreaItems} rounded outlined severity="danger" aria-label="Cancel" onClick={() => clearArea()} />
              <Button label="Найти" icon="pi pi-search" disabled={!textAreaItems} className="w-full md:w-15rem ml-3" />
            </div>
          </div>
        </main>
      </MainLayout>
    </>
  )
}
