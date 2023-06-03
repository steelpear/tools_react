import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Loader } from '../components/Loader'
import { DataTable } from 'primereact/datatable'
import { Tooltip } from 'primereact/tooltip'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import { Image } from 'primereact/image'
import { ScrollTop } from 'primereact/scrolltop'
import mongoose from 'mongoose'
import Hotel from '../models/Hotel'
import City from '../models/City'
import User from '../models/User'
        
const punycode = require('punycode/')

export default function Home (hotels) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(JSON.parse(hotels.hotels))
  const [filters, setFilters] = useState({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
  const [globalFilterValue, setGlobalFilterValue] = useState('')

  useEffect(() => {if (data) {setTimeout(() => setLoading(false), 1000)}},[data])

  if (loading) {return (<Loader />)}

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
    return <>
    <a href={`https://broniryem.ru/admin/collections/entry/5a5dc18e670fd819bca20da7/${data._id}`} target="_blank" style={{textDecoration:"none"}}><span style={{color:"black",fontWeight:"600"}}>{data.name}</span></a>
    <p style={{fontSize:"13px",margin:"0px",lineHeight:"15px"}}>
    {data.phone1 ? <>{data.phone1}<br></br></> : <></>}
    {data.phone2 ? <>{data.phone2}<br></br></> : <></>}
    {data.email ? <>{data.email}</> : <></>}
    </p>
    </>
  }

  const staffBodyTemplate = (data) => {
    return data.staff.map((item,index) => {return <a href={`https://broniryem.ru/admin/accounts/account/${item._id}`} target="_blank" style={{textDecoration:"none"}}><p key={index} style={{fontSize:"13px",margin:"0px",lineHeight:"15px"}}>{item.user}<br></br></p></a>})
  }

  const linkBodyTemplate = (data) => {
    if (data.site_type === "Сателлит") {return data.sat_domain ? <><a href={`http://${data.sat_domain}`} target="_blank" style={{textDecoration:"none"}}>{punycode.toUnicode(data.sat_domain)}</a></> : <></>}
    if (data.site_type === "Классический" || data.site_type === "Автономный") {return data.href ? <><a href={`http://${data.href}`} target="_blank" style={{textDecoration:"none"}}>{punycode.toUnicode(data.href)}</a></> : <></>}
    if (data.site_type === "Нет сайта") {return data.portal_link ? <><a href={`http://${data.portal_link.replace(/^https?:\/\//,'')}`} target="_blank" style={{textDecoration:"none"}}>{data.portal_link.replace(/^https?:\/\//,'')}</a></> : <><a href={`https://broniryem.ru/search?q=${data.name}`} target="_blank" style={{textDecoration:"none"}}>{`broniryem.ru/search?q=${data.name}`}</a></>}
    return <></>
  }

  const siteBodyTemplate = (data) => {
    if (data.site_type === "Сателлит") {return <><Tooltip target=".site_type" /><Image src="satellite.svg" width="25" className="site_type" data-pr-tooltip={data.site_type} data-pr-position="left" /></>}
    if (data.site_type === "Классический") {return <Image src="rocket.svg" width="25" />}
    if (data.site_type === "Автономный") {return <Image src="aa.svg" width="25" />}
    if (data.site_type === "Нет сайта") {return <Image src="logo.svg" width="25" />}
    return <Image src="nothing.svg" alt="portal" width="25" />
  }

  return (
    <>
      <Head>
        <title>Главная | Tools</title>
      </Head>
      <main className="main">
        <DataTable value={data} size="small" selectionMode="single" dataKey="_id" stripedRows removableSort paginator responsiveLayout="scroll" paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" currentPageReportTemplate="Строки {first} - {last} из {totalRecords}" rows={50} rowsPerPageOptions={[50,100,data.length]} filters={filters} filterDisplay="row" globalFilterFields={['name','city','phone1','phone2','email','type','staff']} header={header} emptyMessage="Ничего не найдено.">
          <Column header="Объект" body={nameBodyTemplate} sortable></Column>
          <Column field="city" header="Регион" sortable></Column>
          <Column header="Ссылка" body={linkBodyTemplate}></Column>
          <Column header="Менеджер" body={staffBodyTemplate}></Column>
          <Column field="sat_template" header="Шаблон" sortable className="sat_template"></Column>
          <Column header="Сайт" body={siteBodyTemplate}></Column>
        </DataTable>
      </main>
      <ScrollTop className="bg-gray-500" style={{right:"5px"}} />
    </>
  )
}

export const getServerSideProps = async () => {
  if (!mongoose.connections[0].readyState) {mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})}
  const out = []
  const hotels = await Hotel.find({ puma: true }, 'name city email href sat_domain portal_link phone1 phone2 site_type sat_template sat_active temporarily_disable sat_finish')
  const cities = await City.find({}, 'name')
  const users = await User.find({public: true}, 'user hotels')
  hotels.forEach(hotel => {
    const city = cities.filter(item => { return item._id == hotel.city[hotel.city.length - 1] })
    const user = users.filter(item => { return item.hotels.includes(hotel._id) })
    const staff = user.map(item => { return { user: item.user, _id: item._id } })
    hotel.city = city[0] ? city[0].name : 'Нет региона'
    hotel.staff = staff
    hotel.site_type = hotel.site_type ? hotel.site_type : 'Нет сайта'
    out.push(hotel)
  })
  return {props: {hotels: JSON.stringify(out)}}
}
