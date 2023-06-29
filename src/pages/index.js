import { useState, useEffect } from 'react'
import Head from 'next/head'
import mongoose from 'mongoose'
import User from '../models/User'
import Hotel from '../models/Hotel'
import City from '../models/City'
// import { Loader } from '../components/Loader'
import { MainLayout } from '../components/MainLayout'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { MultiSelect } from 'primereact/multiselect'
import { FilterMatchMode } from 'primereact/api'
import { Image } from 'primereact/image'
// import useSWR from 'swr'
        
const punycode = require('punycode/')
// const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const getServerSideProps = async (context) => {
  if (mongoose.connections[0].readyState !== 1) {mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})}
  const htls = []
  const hotels = await Hotel.find({ puma: true }, 'name city email href sat_domain portal_link phone1 phone2 site_type sat_template sat_active temporarily_disable sat_finish')
  const cities = await City.find({}, 'name')
  const usrs = await User.find({public: true}, 'user hotels')
  await hotels.forEach(hotel => {
    const city = cities.filter(item => { return item._id == hotel.city[hotel.city.length - 1] })
    const user = usrs.filter(item => { return item.hotels.includes(hotel._id) })
    const staff = user.map(item => { return { user: item.user, _id: item._id } })
    hotel.city = city[0] ? city[0].name : 'Нет региона'
    hotel.staff = staff
    hotel.site_type = hotel.site_type ? hotel.site_type : 'Нет сайта'
    htls.push(hotel)
  })
  const users = await User.find({public: true}, 'user')
  return {props: {users: JSON.stringify(users), htls: JSON.stringify(htls)}}
}

export default function Home ({...props}) {
  const [filters, setFilters] = useState({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [contextMenu, setContextMenu] = useState(false)
  const [contextStaffMenu, setContextStaffMenu] = useState(false)
  const [positions, setPositions] = useState({x:0,y:0})
  const [currentData, setCurrentdata] = useState(null)
  const [currentPhone, setCurrentPhone] = useState(null)
  const [currentStaffData, setCurrentStaffData] = useState(null)
  const [currentId, setCurrentId] = useState(null)
  const [hotels, setHotels] = useState([])
  // const { data } = useSWR('/api/hotels', fetcher)
  const staff = JSON.parse(props.users)

  useEffect(() => { setHotels(JSON.parse(props.htls)) }, [props.htls])

  if (hotels.length < 1) {return (<Loader />)}


  const handleContextMenu = (e,data,id,phone) => {
    e.preventDefault()
    const positions = {
      x: e.pageX,
      y: e.pageY
    }
    setPositions(positions)
    setCurrentdata(data)
    setCurrentPhone(phone)
    setCurrentId(id)
    setContextMenu(true)
  }

  const handleContextMenuStaff = (e,data,id) => {
    e.preventDefault()
    const positions = {
      x: e.pageX,
      y: e.pageY
    }
    setPositions(positions)
    setCurrentStaffData(data)
    setCurrentId(id)
    setContextStaffMenu(true)
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
    <div style={{fontSize:"13px",margin:"0px",lineHeight:"15px"}}>
    {data.phone1 && <div onContextMenu={(e) => handleContextMenu(e,data.phone1,data._id,"phone1")}>{data.phone1}<br></br></div>}
    {data.phone2 && <div onContextMenu={(e) => handleContextMenu(e,data.phone2,data._id,"phone2")}>{data.phone2}<br></br></div>}
    {data.email && <div onContextMenu={(e) => handleContextMenu(e,data.email,data._id)}>{data.email}</div>}
    </div></div>
  }

  const staffBodyTemplate = (data) => {
    return data.staff.map((item,index) => {return <a key={index} href={`https://broniryem.ru/admin/accounts/account/${item._id}`} target="_blank" style={{textDecoration:"none"}}><div style={{fontSize:"13px",margin:"0px",lineHeight:"13px"}} onContextMenu={(e) => handleContextMenuStaff(e,data.staff,data._id)}>{item.user}<br></br></div></a>})
  }

  const linkBodyTemplate = (data) => {
    if (data.site_type === "Сателлит") {return data.sat_domain ? <a href={`http://${data.sat_domain}`} target="_blank" style={{textDecoration:"none"}}>{punycode.toUnicode(data.sat_domain)}</a> : <></>}
    else if (data.site_type === "Классический" || data.site_type === "Автономный") {return data.href ? <a href={`http://${data.href}`} target="_blank" style={{textDecoration:"none"}}>{punycode.toUnicode(data.href)}</a> : <></>}
    else if (data.site_type === "Нет сайта") {return data.portal_link ? <a href={`http://${data.portal_link.replace(/^https?:\/\//,'')}`} target="_blank" style={{textDecoration:"none"}}>{data.portal_link.replace(/^https?:\/\//,'')}</a> : <a href={`https://broniryem.ru/search?q=${data.name}`} target="_blank" style={{textDecoration:"none"}}>{`broniryem.ru/search?q=${data.name}`}</a>}
    else { return <></> }
  }

  const siteBodyTemplate = (data) => {
    if (data.site_type === "Сателлит") {return <Image src="satellite.svg" width="20" />}
    else if (data.site_type === "Классический") {return <Image src="rocket.svg" width="20" />}
    else if (data.site_type === "Автономный") {return <Image src="aa.svg" width="20" />}
    else if (data.site_type === "Нет сайта") {return <Image src="logo.svg" width="20" />}
    else { return <Image src="nothing.svg" alt="portal" width="20" /> }
  }

  const createBodyTemplate = (data) => {
    return <div style={{fontSize:13}}>{data.sat_finish ? formatDate(data.sat_finish) : '---'}</div>
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
        <DataTable value={hotels} size="small" selectionMode="single" stripedRows removableSort paginator responsiveLayout="scroll" paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" currentPageReportTemplate="Строки {first} - {last} из {totalRecords}" rows={50} rowsPerPageOptions={[50,100,hotels.length]} loading={hotels.length < 1} filters={filters} filterDisplay="row" globalFilterFields={['name','city','phone1','phone2','email']} header={header} emptyMessage="Ничего не найдено." style={{fontSize:14}}>
          <Column header="Объект" body={nameBodyTemplate} sortable></Column>
          <Column field="city" header="Регион" sortable></Column>
          <Column header="Ссылка" body={linkBodyTemplate}></Column>
          <Column header="Менеджер" body={staffBodyTemplate}></Column>
          <Column field="sat_template" header="Шаблон" sortable></Column>
          <Column header="Сайт" body={siteBodyTemplate}></Column>
          <Column header="Создан" body={createBodyTemplate}></Column>
        </DataTable>
        {contextMenu ? (
          <div className="context-menu-wrap" style={{top:positions.y, left:positions.x}}>
            <span className="p-float-label">
              <InputText id="phonesmail" type="text" className="p-inputtext-sm" value={currentData} onChange={(e) => setCurrentdata(e.target.value)} />
              <label className="label" htmlFor="phonesmail">{currentPhone}</label>
            </span>
            <i className="pi pi-times ml-3" style={{ fontSize: '1.2rem',color: 'red', cursor: 'pointer' }} onClick={() => setContextMenu(false)}></i>
            <i className="pi pi-check ml-3 mr-2" style={{ fontSize: '1.2rem',color: 'green', cursor: 'pointer' }} onClick={() => setContextMenu(false)}></i>
          </div>
        ) : <></>}
        {contextStaffMenu ? (
          <div className="context-menu-wrap" style={{top:positions.y, left:positions.x}}>
            <MultiSelect value={currentStaffData} onChange={(e) => setCurrentStaffData(e.value)} options={staff} optionLabel="user" display="chip" maxSelectedLabels={6} />
            <i className="pi pi-times ml-3" style={{ fontSize: '1.2rem',color: 'red', cursor: 'pointer' }} onClick={() => setContextStaffMenu(false)}></i>
            <i className="pi pi-check ml-3 mr-2" style={{ fontSize: '1.2rem',color: 'green', cursor: 'pointer' }} onClick={() => setContextStaffMenu(false)}></i>
          </div>
        ) : <></>}
      </main>
    </MainLayout>
    </>
  )
}
