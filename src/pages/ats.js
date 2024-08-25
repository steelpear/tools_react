import { useState } from 'react'
import useSWR, {useSWRConfig} from 'swr'
import Head from 'next/head'
import { MainLayout } from '../components/MainLayout'
import { PhoneNumberInfo } from '../components/PhoneNumberInfo'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Tooltip } from 'primereact/tooltip'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Ats () {
  const { mutate } = useSWRConfig()
  const [selectedDirections, setSelectedDirections] = useState(null)
  const [filters, setFilters] = useState({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const { data: directions, isLoading } = useSWR('/api/dir', fetcher)

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }
    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const clearFilter = () => {
    setFilters({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
    setGlobalFilterValue('')
  }

  const headerTemplate = () => {
    return (
      <div className='flex align-items-center justify-content-between'>
        <div className='flex align-items-center'>
          <Button icon="pi pi-file-export" rounded text severity="info" size='large' onClick={() => exportIds()} aria-controls="filter_menu" aria-haspopup tooltip="Экспорт" tooltipOptions={{position: 'top'}} />
          <PhoneNumberInfo />
        </div>
        <div className='flex align-items-center p-input-icon-left p-input-icon-right'>
          <i className='pi pi-search pt-1' />
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder='Поиск'/>
          {globalFilterValue ? <i className='pi pi-times' onClick={clearFilter} style={{ cursor: 'pointer' }} /> : <i className='pi pi-times pt-1' style={{ color: 'lightgrey' }} />}
        </div>
      </div>
    )
  }

  const numberBodyTemplate = (data) => {
    return <div style={{cursor: 'pointer'}}>{data.trunks && data.trunks.length > 0 ? data.trunks.map(item => {return <a key={item._id} href={`http://pbx.profpub.ru/index/trunks/trunk/${item._id}`} target='_blank' className='trunk-item' style={{textDecoration:'none'}} data-pr-tooltip={`${item.lastcall ? new Date(item.lastcall).toLocaleDateString("ru-RU") : ''}${item.lastcall ? ' / ' : ''}${item.region}`} data-pr-position="top">{item.did}<br></br></a>}) : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />}</div>
  }

  const codeBodyTemplate = (data) => {
    return <div style={{cursor: 'pointer'}}>{data.trunks && data.trunks.length > 0 ? data.trunks.map(item => {return <div key={item._id} className='font-medium'>{item.code}<br></br></div>}) : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />}</div>
  }

  const queueBodyTemplate = (data) => {
    return data.queue ? <a href={`http://pbx.profpub.ru/index/queues/queue/${data.queue._id}`} target='_blank' style={{textDecoration:'none'}}>{data.queue.name}</a> : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />
  }

  const operatorsBodyTemplate = (data) => {
    return <div style={{cursor:'pointer', lineHeight:'1rem'}}>{data.operators && data.operators.length > 0 ? data.operators.map(item => {return <a key={item._id} href={`http://pbx.profpub.ru/index/operators/operator/${item._id}`} target='_blank' style={{textDecoration: 'none'}}><div className='operator-item' style={!item.auth ? {color:'orangered'} : {color:'inherit'}} data-pr-tooltip={`${item.location ? item.location : 'Не авторизован'}`} data-pr-position="top">{item.lastname}</div></a>}) : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />}</div>
  }

  const groupsBodyTemplate = (data) => {
    return <div style={{cursor: 'pointer'}}>{data.groups && data.groups.length > 0 ? data.groups.map((item,index) => {return <div key={index}>{item}<br></br></div>}) : <i className="pi pi-minus py-3" style={{lineHeight:'0rem'}} />}</div>
  }

  return (
    <>
    <Head>
      <title>Телефония / Инструменты</title>
    </Head>
    <MainLayout title='Телефония / Инструменты'>
      <main>
        <Tooltip target=".operator-item" />
        <Tooltip target=".trunk-item" />
        <DataTable value={directions} loading={isLoading} size='small' selectionMode='checkbox' selectionPageOnly selection={selectedDirections} onSelectionChange={(e) => setSelectedDirections(e.value)} dataKey='_id' stripedRows removableSort paginator responsiveLayout='scroll' paginatorTemplate='CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown' currentPageReportTemplate='Строки {first} - {last} из {totalRecords}' rows={50} rowsPerPageOptions={[50,100,directions ? directions.length : 0]} filters={filters} globalFilterFields={['name','region','queue.name','route','trunks.code','trunks.did']} header={headerTemplate} emptyMessage='Даных нет.' style={{fontSize:14}} tableStyle={{ minWidth: '50rem' }}>
          <Column header="#" headerStyle={{width: '2.5rem'}} body={(data, options) => <div className='ml-1 text-sm'>{options.rowIndex + 1}</div>} />
          <Column selectionMode='multiple' headerStyle={{ width: '3rem',backgroundColor:'white',paddingLeft:'unset' }} />
          <Column header='Объект' field='name' body={data => <a href={`http://pbx.profpub.ru/index/directions/direction/${data._id}`} target="_blank" style={{textDecoration:'none'}}>{data.name}</a>} headerStyle={{ backgroundColor:'white' }} />
          <Column header='Регион' field='region' sortable headerStyle={{ backgroundColor:'white' }} />
          <Column header='Номер' field='trunks.did' body={numberBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
          <Column header='Код' field='trunks.code' body={codeBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
          <Column header='Операторы' field='operators.lastname' body={operatorsBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
          <Column header='Группы' field='groups' body={groupsBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
          <Column header='Маршрут' field='route' headerStyle={{ backgroundColor:'white' }} />
          <Column header='Очередь' field='queue.name' body={queueBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
        </DataTable>
      </main>
    </MainLayout>
    </>
  )
}
