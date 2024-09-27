import { useState } from 'react'
import useSWR from 'swr'
import Head from 'next/head'
import { MainLayout } from '../components/MainLayout'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Operators () {
  const {data: operators, isLoading} = useSWR('/api/operators', fetcher)
  const [filters, setFilters] = useState({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
  const [globalFilterValue, setGlobalFilterValue] = useState('')

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

  const headerTemplate = () => {
    return (
      <div className='flex align-items-center justify-content-end'>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search pt-1" />
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Поиск" className='w-full md:w-16rem pr-5' />
          <InputIcon className="pi pi-times cursor-pointer -ml-4 pt-1" onClick={() => initFilters()} />
        </IconField>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>АТС / Операторы / Инструменты</title>
      </Head>
      <MainLayout title='АТС / Операторы / Инструменты'>
        <main>
          <div className="mt-3">
            <DataTable value={operators} loading={isLoading} size='small' dataKey='_id' stripedRows removableSort paginator responsiveLayout='scroll' paginatorTemplate='CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown' currentPageReportTemplate='Строки {first} - {last} из {totalRecords}' rows={50} rowsPerPageOptions={[50,100,operators ? operators.length : 0]} filters={filters} globalFilterFields={['name', 'secondName', 'lastName', 'region', 'code', 'location']} header={headerTemplate} emptyMessage='Даных нет.' style={{fontSize:14}} tableStyle={{ minWidth: '50rem' }}>
              <Column header="#" headerStyle={{width: '2.5rem'}} body={(data, options) => <div className='ml-1 text-sm'>{options.rowIndex + 1}</div>} />
              <Column header='Авт.' body={data => <div className='flex justify-content-start'>{data.auth ? <i className='pi pi-circle-fill' style={{color: 'green'}} /> : <i className='pi pi-circle-fill' style={{color: 'red'}} />}</div>} headerStyle={{width: '2.5rem', paddingLeft:'unset'}} />
              <Column header='Имя' field='lastName' sortable body={data => <a href={`http://pbx.profpub.ru/index/operators/operator/${data._id}`} target="_blank" style={{textDecoration: `${data.active ? 'none' : 'line-through'}`}}>{data.lastName} {data.name} {data.secondName}</a>} headerStyle={{backgroundColor:'white', paddingLeft:'unset'}} />
              <Column header='Регион' field='region' body={data => data.region ? <div>{data.region}</div> : '—'} sortable headerStyle={{backgroundColor:'white', paddingLeft:'unset'}} />
              <Column header='Канал' field='location' body={data => (data.location || data.locationPrevious) ? <div className='text-green-600'>{data.location} {(data.locationPrevious && data.locationPrevious !== data.location) && <span className='text-xs text-700'>{data.locationPrevious}</span>}</div> : '—'} headerStyle={{backgroundColor:'white', paddingLeft:'unset'}} />
              <Column header='Код' field='code' headerStyle={{ backgroundColor:'white', paddingLeft:'unset' }} />
            </DataTable>
          </div>
        </main>
      </MainLayout>
    </> 
  )
}
