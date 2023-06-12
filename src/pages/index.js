import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Loader } from '../components/Loader'
import { MainLayout } from '../components/MainLayout'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'
import { Image } from 'primereact/image'
import useSWR from 'swr'
        
const punycode = require('punycode/')
const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Home () {
  const [filters, setFilters] = useState({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [contextMenu, setContextMenu] = useState(false)
  const [positions, setPositions] = useState({x:0,y:0})
  const [currentData, setCurrentdata] = useState(null)
  const [currentId, setCurrentId] = useState(null)
  const [hotels, setHotels] = useState(null)
  const { data, error, isLoading } = useSWR('/api/hotels', fetcher)

  useEffect(() => { setHotels(data) }, [data])

  if (error) return <div>Ошибка загрузки...</div>
  if (isLoading) {return (<Loader />)}

  const handleContextMenu = (e,data,id) => {
    e.preventDefault()
    const positions = {
      x: e.pageX,
      y: e.pageY
    }
    setPositions(positions)
    setCurrentdata(data)
    setCurrentId(id)
    setContextMenu(true)
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }
    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const header = () => {
    return (
      <div className="flex align-items-center justify-content-between">
        <div className="flex">
          <Image src="satellite.svg" alt="portal" width="25" style={{marginLeft:"10px"}}/>
          <span style={{ margin: "0 15px 0 5px", fontWeight: "600" }}>Сателлит</span>
          <Image src="rocket.svg" alt="portal" width="25" />
          <span style={{ margin: "0 15px 0 5px", fontWeight: "600" }}>Классический</span>
          <Image src="aa.svg" alt="portal" width="25" />
          <span style={{ margin: "0 15px 0 5px", fontWeight: "600" }}>Автономный</span>
          <Image src="logo.svg" alt="portal" width="25" />
          <span style={{ margin: "0 0 0 5px", fontWeight: "600" }}>Страница на портале</span>
        </div>
        <div className="flex">
          <span className='p-input-icon-left p-input-icon-right'>
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Поиск"/>
            {globalFilterValue ? <><i className="pi pi-times" onClick={clearFilter} style={{ cursor: 'pointer' }} /></> : <><i className="pi pi-times" style={{ color: 'lightgrey' }} /></>}
          </span>
        </div>
      </div>
    )
  }

  const clearFilter = () => {
    setFilters({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
    setGlobalFilterValue('')
  }

  const nameBodyTemplate = (data) => {
    return <div style={{paddingLeft:5}}><a href={`https://broniryem.ru/admin/collections/entry/5a5dc18e670fd819bca20da7/${data._id}`} target="_blank" style={{textDecoration:"none"}}><span style={{color:"black",fontWeight:"600"}}>{data.name}</span></a>
    <p style={{fontSize:"13px",margin:"0px",lineHeight:"15px"}}>
    {data.phone1 ? <div onContextMenu={(e) => handleContextMenu(e,data.phone1,data._id)}>{data.phone1}<br></br></div> : <></>}
    {data.phone2 ? <div onContextMenu={(e) => handleContextMenu(e,data.phone2,data._id)}>{data.phone2}<br></br></div> : <></>}
    {data.email ? <div onContextMenu={(e) => handleContextMenu(e,data.email,data._id)}>{data.email}</div> : <></>}
    </p></div>
  }

  const staffBodyTemplate = (data) => {
    return data.staff.map((item,index) => {return <a href={`https://broniryem.ru/admin/accounts/account/${item._id}`} target="_blank" style={{textDecoration:"none"}}><p key={index} style={{fontSize:"13px",margin:"0px",lineHeight:"13px"}}>{item.user}<br></br></p></a>})
  }

  const linkBodyTemplate = (data) => {
    if (data.site_type === "Сателлит") {return data.sat_domain ? <><a href={`http://${data.sat_domain}`} target="_blank" style={{textDecoration:"none"}}>{punycode.toUnicode(data.sat_domain)}</a></> : <></>}
    if (data.site_type === "Классический" || data.site_type === "Автономный") {return data.href ? <><a href={`http://${data.href}`} target="_blank" style={{textDecoration:"none"}}>{punycode.toUnicode(data.href)}</a></> : <></>}
    if (data.site_type === "Нет сайта") {return data.portal_link ? <><a href={`http://${data.portal_link.replace(/^https?:\/\//,'')}`} target="_blank" style={{textDecoration:"none"}}>{data.portal_link.replace(/^https?:\/\//,'')}</a></> : <><a href={`https://broniryem.ru/search?q=${data.name}`} target="_blank" style={{textDecoration:"none"}}>{`broniryem.ru/search?q=${data.name}`}</a></>}
    return <></>
  }

  const siteBodyTemplate = (data) => {
    if (data.site_type === "Сателлит") {return <Image src="satellite.svg" width="20" />}
    if (data.site_type === "Классический") {return <Image src="rocket.svg" width="20" />}
    if (data.site_type === "Автономный") {return <Image src="aa.svg" width="20" />}
    if (data.site_type === "Нет сайта") {return <Image src="logo.svg" width="20" />}
    return <Image src="nothing.svg" alt="portal" width="20" />
  }

  const createBodyTemplate = (data) => {
    return <span style={{fontSize:13}}>{data.sat_finish ? formatDate(data.sat_finish) : '---'}</span>
  }

  const formatDate = (date) => {
    const dat = new Date(date).toLocaleDateString('ru-ru')
    const dat1 = dat.slice(0, 6)
    const dat2 = dat.slice(8)
    const dat3 = dat1 + dat2
    return dat3
  }

  return (
    <>
    <Head>
      <title>Все сайты / Инструменты</title>
    </Head>
    <MainLayout>
      <main>
        <DataTable value={hotels} size="small" selectionMode="single" dataKey="_id" stripedRows removableSort paginator responsiveLayout="scroll" paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" currentPageReportTemplate="Строки {first} - {last} из {totalRecords}" rows={50} rowsPerPageOptions={[50,100,data.length]} filters={filters} filterDisplay="row" globalFilterFields={['name','city','phone1','phone2','email','type','staff']} header={header} emptyMessage="Ничего не найдено." style={{fontSize:14}}>
          <Column key="1" header="Объект" body={nameBodyTemplate} sortable></Column>
          <Column key="2" field="city" header="Регион" sortable></Column>
          <Column key="3" header="Ссылка" body={linkBodyTemplate}></Column>
          <Column key="4" header="Менеджер" body={staffBodyTemplate}></Column>
          <Column key="5" field="sat_template" header="Шаблон" sortable></Column>
          <Column key="6" header="Сайт" body={siteBodyTemplate}></Column>
          <Column key="7" header="Создан" body={createBodyTemplate}></Column>
        </DataTable>
        {contextMenu ? (
          <div className="context-menu-wrap" style={{top:positions.y, left:positions.x}}>
            <InputText type="text" className="p-inputtext-sm" value={currentData} onChange={(e) => setCurrentdata(e.target.value)} />
            <i className="pi pi-times ml-3" style={{ fontSize: '1.2rem',color: 'red', cursor: 'pointer' }} onClick={() => setContextMenu(false)}></i>
            <i className="pi pi-check ml-3 mr-2" style={{ fontSize: '1.2rem',color: 'green', cursor: 'pointer' }} onClick={() => setContextMenu(false)}></i>
          </div>
        ) : <></>}
      </main>
    </MainLayout>
    </>
  )
}
