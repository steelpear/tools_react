import { useState, useRef } from 'react'
import useSWR, {useSWRConfig} from 'swr'
import useSWRImmutable from 'swr/immutable'
import Head from 'next/head'
import { EventBus } from '../components/EventBus'
import { MainLayout } from '../components/MainLayout'
import { Loader } from '../components/Loader'
import { FiltersAts } from '../components/FiltersAts'
import { PhoneNumberInfo } from '../components/PhoneNumberInfo'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Tooltip } from 'primereact/tooltip'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Ats () {
  const megafonToast = useRef(null)
  const copyToast = useRef(null)
  const inputFile = useRef(null)
  const { mutate } = useSWRConfig()

  const [isMut, setIsMut] = useState(false)
  const [expandedRows, setExpandedRows] = useState(null)
  const [selectedDirections, setSelectedDirections] = useState(null)
  const [filters, setFilters] = useState({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const { data: directions, isLoading } = useSWR('/api/dir', fetcher)
  const { data: operatorgroups } = useSWRImmutable('/api/operatorgroups', fetcher)
  const { data: queues } = useSWRImmutable('/api/queues', fetcher)

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }
    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const initFilters = () => {
    setFilters({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
    setGlobalFilterValue('')
  }

  const copyToClipboard = (e, did) => {
    e.preventDefault()
    navigator.clipboard.writeText(did)
    copyToast.current.show({severity:'info', detail:'Скопировано в буфер обмена', life: 2000})
  }

  const importIds = async e => {
    const { files } = e.target
    if (files && files.length) {
      const reader = new FileReader()
      reader.readAsText(files[0])
      reader.onload = async () => {
        setIsMut(true)
        await mutate('/api/dir', fetcher('/api/dir', {
          method: 'POST',
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({mode: 'import', data: JSON.parse(reader.result)})
        }), {revalidate: false, revalidateOnFocus: false})
        setIsMut(false)
      }
    }
  }

  const exportIds = () => {
    const ids = JSON.stringify(selectedDirections.map(item => item._id))
    const date = new Date()
    const name = 'export-directions-list_' + ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear() + '_' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '.json'
    const blob = new Blob([ids], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = name
    link.href = url
    link.click()
  }

  const resetFilters = async () => {
    EventBus.$emit('reset')
    setIsMut(true)
    await mutate('/api/dir')
    setIsMut(false)
  }

  const getBalnce = async (login, password) => {
    const resp = await fetch('/api/getmegafonbalance', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({login, password})
    })
    const response = await resp.text()
    const arr = response.match(/<balance>(.*?)<\/balance>/g).map(val => val.replace(/<\/?balance>/g, ''))
    const balance = arr.join('')
    megafonToast.current.show({severity:'info', summary: 'Баланс', detail: balance, life: 3000})
  }

  const headerTemplate = () => {
    return (
      <div className='flex align-items-center justify-content-between'>
        <div className='flex align-items-center'>
          <input style={{display:"none"}} ref={inputFile} onChange={importIds} type="file" accept=".json" />
          <Button icon="pi pi-file-import" rounded text severity="info" onClick={() => inputFile.current.click()} aria-controls="import" aria-haspopup tooltip="Импорт" tooltipOptions={{position: 'top'}} />
          <Button icon="pi pi-file-export" rounded text severity="info" disabled={!selectedDirections || selectedDirections.length < 1} onClick={() => exportIds()} aria-controls="export" aria-haspopup tooltip="Экспорт" tooltipOptions={{position: 'top'}} />
          <Button icon="pi pi-filter-slash" rounded text severity="info" onClick={() => resetFilters()} aria-controls="filter_menu" aria-haspopup tooltip="Сбросить фильтры" tooltipOptions={{position: 'top'}} />
          <PhoneNumberInfo />
          <FiltersAts operatorgroups={operatorgroups} sel={selectedDirections} queues={queues} />
        </div>
        <div className="flex justify-content-center">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search pt-1" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Поиск" className='w-full md:w-16rem pr-5' />
            <InputIcon className="pi pi-times cursor-pointer -ml-4 pt-1" onClick={() => initFilters()} />
          </IconField>
        </div>
      </div>
    )
  }

  const numberBodyTemplate = (data) => {
    return <div style={{cursor: 'pointer'}}>{data.trunks && data.trunks.length > 0 ? data.trunks.map(item => {return <a key={item._id} href={`http://pbx.profpub.ru/index/trunks/trunk/${item._id}`} target='_blank' style={{textDecoration:'none'}} data-pr-tooltip={`${item.provider} / ${item.region}${item.lastcall ? ' / ' : ''}${item.lastcall ? new Date(item.lastcall).toLocaleDateString("ru-RU") : ''}`} data-pr-position="top" onContextMenu={e => copyToClipboard(e, item.did)}>{item.did}<br></br></a>}) : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />}</div>
  }

  const codeBodyTemplate = (data) => {
    return <div style={{cursor: 'pointer'}}>{data.trunks && data.trunks.length > 0 ? data.trunks.map(item => {return <div key={item._id} className='font-medium'>{item.code}<br></br></div>}) : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />}</div>
  }

  const queueBodyTemplate = (data) => {
    return data.queue ? <a href={`http://pbx.profpub.ru/index/queues/queue/${data.queue._id}`} target='_blank' style={{textDecoration:'none'}}>{data.queue.name}</a> : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />
  }

  const operatorsBodyTemplate = (data) => {
    return <div style={{cursor:'pointer', lineHeight:'1rem', paddingLeft: 2}}>{data.operators && data.operators.length > 0 ? data.operators.map(item => {return <a key={item._id} href={`http://pbx.profpub.ru/index/operators/operator/${item._id}`} target='_blank' style={{textDecoration: 'none'}}><div className='text-sm' style={!item.auth ? {color:'orangered'} : {color:'inherit'}} data-pr-tooltip={`${item.location ? item.location : 'Не авторизован'}`} data-pr-position="top">{item.lastname}</div></a>}) : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />}</div>
  }

  const groupsBodyTemplate = (data) => {
    return <div style={{cursor: 'pointer'}}>{data.groups && data.groups.length > 0 ? data.groups.map((item,index) => {return <div key={index}>{item}<br></br></div>}) : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />}</div>
  }

  const forcedBodyTemplate = (data) => {
    return <div className='flex justify-content-center'>{data.forced ? <i className='pi pi-check' style={{color: 'green'}} /> : <i className='pi pi-times' style={{color: 'red'}} />}</div>
  }

  const allowExpansion = (rowData) => { return rowData }

  const rowExpansionTemplate = (data) => {
    return (
      <div className='flex align-items-baseline px-3 py-2 ml-4'>
        <div>{(data.trunks && data.trunks.length > 0) && data.trunks.map(item => {
          return (
            <div key={item._id} className='flex align-items-center'>
              <i className='pi pi-phone mr-1' />
              <div className='mr-1'>{item.did} (<span style={{ color: `${item.provider === 'Мегафон' && '#00B956' || item.provider === 'Мультифон' && '#00B944' || item.provider === 'Билайн' && '#FFCC01' || item.provider === 'Задарма' && '#D8232A'}` }}>{item.provider}</span> / {item.region}{item.lastcall && ' / '}{item.lastcall && new Date(item.lastcall).toLocaleDateString("ru-RU")})</div>
              {(item.provider === 'Мегафон' || item.provider === 'Мультифон') && <Button icon='pi pi-dollar' rounded text severity='info' onClick={() => getBalnce(item.did, item.password)} aria-controls='balance' aria-haspopup tooltip='Баланс' tooltipOptions={{ position: 'top' }} />}
            </div>
        )})}</div>
        {data.comment && <div>
            <i className='pi pi-comment mx-2' />
            <span className='text-xs'>{data.comment}</span>
          </div>}
      </div>
    )
  }

  return (
    <>
    <Head>
      <title>АТС / Направления / Инструменты</title>
    </Head>
    <MainLayout title='АТС / Направления / Инструменты'>
      <main>
        <Tooltip target=".operator-item" />
        <Tooltip target=".trunk-item" />
        <DataTable value={directions} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)} rowExpansionTemplate={rowExpansionTemplate} loading={isLoading} size='small' selectionMode='checkbox' selectionPageOnly selection={selectedDirections} onSelectionChange={(e) => setSelectedDirections(e.value)} dataKey='_id' stripedRows removableSort paginator responsiveLayout='scroll' paginatorTemplate='CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown' currentPageReportTemplate='Строки {first} - {last} из {totalRecords}' rows={50} rowsPerPageOptions={[50,100,directions ? directions.length : 0]} filters={filters} globalFilterFields={['name','region','route','queue.name','trunkscode','trunksdid','lastname']} header={headerTemplate} emptyMessage='Даных нет.' style={{fontSize:14}} tableStyle={{ minWidth: '50rem' }}>
          <Column expander={allowExpansion} style={{ width: '2.1rem' }} />
          <Column header="#" headerStyle={{width: '2.5rem'}} body={(data, options) => <div className='ml-1 text-sm'>{options.rowIndex + 1}</div>} />
          <Column selectionMode='multiple' headerStyle={{ width: '3rem', paddingLeft:'unset' }} />
          <Column header='Объект' body={data => <a href={`http://pbx.profpub.ru/index/directions/direction/${data._id}`} target="_blank" style={{textDecoration:'none'}}>{data.name}</a>} />
          <Column header='Регион' field='region' sortable />
          <Column header='Номер' body={numberBodyTemplate} />
          <Column header='Код' body={codeBodyTemplate} />
          <Column header='Операторы' body={operatorsBodyTemplate} />
          <Column header='Группы' body={groupsBodyTemplate} />
          <Column header='Маршрут' field='route' sortable />
          <Column header='Очередь' sortable body={queueBodyTemplate} />
          <Column header='Принуд.' body={forcedBodyTemplate} />
        </DataTable>
        {isMut && <Loader mutate={true} />}
        <Toast ref={copyToast} position="top-center" />
        <Toast ref={megafonToast} position="top-center" />
      </main>
    </MainLayout>
    </>
  )
}
