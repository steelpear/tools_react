import { useState, useEffect, useRef } from 'react'
import useSWR, {useSWRConfig} from 'swr'
import useSWRImmutable from 'swr/immutable'
import Head from 'next/head'
import { Loader } from '../components/Loader'
import { MainLayout } from '../components/MainLayout'
import { PhoneNumberInfo } from '../components/PhoneNumberInfo'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { MultiSelect } from 'primereact/multiselect'
import { SelectButton } from 'primereact/selectbutton'
import { FilterMatchMode } from 'primereact/api'
import { Image } from 'primereact/image'
import { Toast } from 'primereact/toast'
import 'primeicons/primeicons.css'

const fetcher = (...args) => fetch(...args).then((res) => res.json())
const punycode = require('punycode/')

export default function Home () {
  const toast = useRef(null)
  const { mutate } = useSWRConfig()
  const btnOptions = [
    {icon: 'pi pi-check-circle', value: 'PumaOn'},
    {icon: 'pi pi-power-off', value: 'PumaOff'},
    {icon: 'pi pi-align-justify', value: 'All'}
  ]
  const [btnValue, setBtnValue] = useState(btnOptions[0].value)
  const [isMut, setIsMut] = useState(false)
  const [isPhoneUpdating, setIsPhoneUpdating] = useState(false)
  const [filters, setFilters] = useState({'global': { value: null, matchMode: FilterMatchMode.CONTAINS }})
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [contextMenu, setContextMenu] = useState(false)
  const [contextStaffMenu, setContextStaffMenu] = useState(false)
  const [positions, setPositions] = useState({x:0,y:0})
  const [currentData, setCurrentdata] = useState(null)
  const [currentPhone, setCurrentPhone] = useState(null)
  const [currentStaffData, setCurrentStaffData] = useState(null)
  const [currentId, setCurrentId] = useState(null)
  const [selectedHotels, setSelectedHotels] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState(null)
  const [staffList, setStaffList] = useState(null)

  const { data: hotels, error } = useSWR('https://broniryem.ru/api/Tools/hotels', fetcher, {revalidateOnMount: false, revalidateOnFocus: false})

  const { data: posts } = useSWRImmutable('/api/posts', fetcher)

  useEffect(() => {
    const checkBtn = () => {
      if (btnValue === 'PumaOn') return {puma: true}
      else if (btnValue === 'PumaOff') return {puma: false}
      else return 'All'
    }
    const mut = async (filter) => {
      setIsMut(true)
      await mutate('https://broniryem.ru/api/Tools/hotels', fetcher('https://broniryem.ru/api/Tools/hotels', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ filter })
      }), {revalidate: false})
      setIsMut(false)
    }
    const filter = checkBtn()
    mut(filter)
  }, [btnValue]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div>{error.message}</div>
  if (!hotels) return <Loader mutate={false} />

  const getStuffList = () => {
    const out = []
    posts.forEach(post => {
      out.push(
        {
          label: `Пост ${post.post_num}`,
          items: post.staff_id.map((item,index) => { return { label: post.staff_name[index], value: post.staff_id[index] } }).sort((a, b) => a.label > b.label ? 1 : -1)
        }
      )
    })
    setStaffList(out)
  }

  const handleContextMenu = (e,data,id,phone) => {
    e.preventDefault()
    setPositions({x:e.pageX,y:e.pageY})
    setCurrentdata(data)
    setCurrentPhone(phone)
    setCurrentId(id)
    setContextMenu(true)
  }

  const handleContextMenuStaff = (e,data,id) => {
    e.preventDefault()
    const stf = data.map(item => {return ({label: item.lastname ? item.lastname : item.user, _id: item._id})})
    setPositions({x:e.pageX-200,y:e.pageY})
    getStuffList()
    setCurrentStaffData(stf)
    setCurrentId(id)
    setContextStaffMenu(true)
  }

  const handlePumaState = async (id, puma) => {
    const res = await fetch('/api/updatehotel', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id, data: { puma: !puma } })
    })
    const response = await res.json()
    setBtnValue(response ? 'PumaOn' : 'PumaOff')
  }

  const handlePhoneState = async () => {
    setIsPhoneUpdating(true)
    await fetch('/api/updatehotel', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id: currentId, data: {[currentPhone]: currentData} })
    })
    await mutate('https://broniryem.ru/api/Tools/hotels')
    toast.current.show({severity:'success', summary: 'Готово', detail:'Изменения сохранены', life: 3000})
    setIsPhoneUpdating(false)
    setContextMenu(false)
  }

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

  const selectButtonTemplate = (option) => {
    return <i className={option.icon} style={{lineHeight: 'normal'}} />
  }

  const headerTemplate = () => {
    return (
      <div className='flex align-items-center justify-content-between'>
        <div className='flex align-items-center'>
          <Image src='letter.svg' alt='portal' width='18' style={{marginLeft:'10px'}}/>
          <span style={{margin:'0 10px 0 3px',fontWeight:'400',fontSize:13}}>Автосателлит</span>
          <Image src='satellite.svg' alt='portal' width='18'/>
          <span style={{margin:'0 10px 0 3px',fontWeight:'400',fontSize:13}}>Сателлит</span>
          <Image src='rocket.svg' alt='portal' width='18' />
          <span style={{margin:'0 10px 0 3px',fontWeight:'400',fontSize:13}}>Классический</span>
          <Image src='aa.svg' alt='portal' width='18' />
          <span style={{margin:'0 10px 0 3px',fontWeight:'400',fontSize:13}}>Автономный</span>
          <Image src='logo.svg' alt='portal' width='18' />
          <span style={{margin:'0 10px 0 3px',fontWeight:'400',fontSize:13}}>Нет сайта</span>
          <SelectButton value={btnValue} onChange={(e) => setBtnValue(e.value)} itemTemplate={selectButtonTemplate} optionLabel="value" options={btnOptions} tooltip="ПУМА on/off/all" tooltipOptions={{ position: 'top' }}style={{marginLeft: 10}} />
          <PhoneNumberInfo />
        </div>
        <div className='flex'>
          <span className='p-input-icon-left p-input-icon-right'>
            <i className='pi pi-search' />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder='Поиск'/>
            {globalFilterValue ? <i className='pi pi-times' onClick={clearFilter} style={{ cursor: 'pointer' }} /> : <i className='pi pi-times' style={{ color: 'lightgrey' }} />}
          </span>
        </div>
      </div>
    )
  }

  const nameBodyTemplate = (data) => {
    return (
    <div>
      <a href={`https://broniryem.ru/admin/collections/entry/5a5dc18e670fd819bca20da7/${data._id}`} target='_blank' style={{textDecoration:'none'}}><span style={{fontWeight:'500'}}>{data.name}</span></a>
      {data.phone1 || data.phone2 ?
      <div style={{fontSize:'12px',margin:'0px',lineHeight:'15px',color:'#444',fontWeight:500}}>
        {data.phone1 && <div onContextMenu={(e) => handleContextMenu(e,data.phone1,data._id,'phone1')}>{data.phone1}<br></br></div>}
        {data.phone2 && <div onContextMenu={(e) => handleContextMenu(e,data.phone2,data._id,'phone2')}>{data.phone2}</div>}
      </div> : <div onContextMenu={(e) => handleContextMenu(e,data.phone2,data._id,'none')}><i className='pi pi-minus' style={{lineHeight: 'normal'}} /></div>}
    </div>)
  }

  const staffBodyTemplate = (data) => {
    return <div onContextMenu={(e) => handleContextMenuStaff(e,data.staff,data._id)}>{data.staff && data.staff.length > 0 ? data.staff.map(item => {return <a key={item._id} href={`https://broniryem.ru/admin/accounts/account/${item._id}`} target='_blank' style={{textDecoration:'none'}}><div style={{fontSize:'.78rem',margin:'0px',lineHeight:'.77rem'}}>{item.lastname ? item.lastname : item.user}<br></br></div></a>}) : <i className="pi pi-minus py-3" style={{lineHeight: 'normal'}} />}</div>
  }

  const linkBodyTemplate = (data) => {
    if (data.site_type === 'Сателлит' || data.site_type === 'Автосателлит') {return data.sat_domain ? <a href={`http://${data.sat_domain}`} target='_blank' style={{textDecoration:'none'}}>{punycode.toUnicode(data.sat_domain)}</a> : <></>}
    else if (data.site_type === 'Классический' || data.site_type === 'Автономный') {return data.href ? <a href={`http://${data.href}`} target='_blank' style={{textDecoration:'none'}}>{punycode.toUnicode(data.href)}</a> : <></>}
    else if (data.site_type === 'Нет сайта') {return data.portal_link ? <a href={`http://${data.portal_link.replace(/^https?:\/\//,'')}`} target='_blank' style={{textDecoration:'none'}}>{data.portal_link.replace(/^https?:\/\//,'')}</a> : <a href={`https://broniryem.ru/search?q=${data.name}`} target='_blank' style={{textDecoration:'none'}}>{`broniryem.ru/search?q=${data.name}`}</a>}
    else { return <></> }
  }

  const siteBodyTemplate = (data) => {
    if (data.site_type === 'Сателлит') {return <div style={{textAlign:'center'}}><Image src='satellite.svg' width='18' /></div>}
    else if (data.site_type === 'Классический') {return <div style={{textAlign:'center'}}><Image src='rocket.svg' width='18' /></div>}
    else if (data.site_type === 'Автономный') {return <div style={{textAlign:'center'}}><Image src='aa.svg' width='18' /></div>}
    else if (data.site_type === 'Автосателлит') {return <div style={{textAlign:'center'}}><Image src='letter.svg' width='18' /></div>}
    else if (data.site_type === 'Нет сайта') {return <div style={{textAlign:'center'}}><Image src='logo.svg' width='18' /></div>}
    else {return <div style={{textAlign:'center'}}><Image src='nothing.svg' alt='portal' width='18' /></div>}
  }

  const pumaBodyTemplate = (data) => {
    return data.puma ? <Button icon='pi pi-check-circle' severity='success' rounded text onClick={() => handlePumaState(data._id, data.puma)} /> : <Button icon='pi pi-power-off' severity='danger' rounded text onClick={() => handlePumaState(data._id, data.puma)} />
  }

  return (
    <>
    <Head>
      <title>Все объекты / Инструменты</title>
    </Head>
    <MainLayout count={hotels && hotels.length} title='Все объекты / Инструменты'>
      <main>
        <DataTable value={hotels} size='small' selectionMode='checkbox' selectionPageOnly selection={selectedHotels} onSelectionChange={(e) => setSelectedHotels(e.value)} dataKey='_id' stripedRows removableSort paginator responsiveLayout='scroll' paginatorTemplate='CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown' currentPageReportTemplate='Строки {first} - {last} из {totalRecords}' rows={50} rowsPerPageOptions={[50,100,hotels ? hotels.length : 0]} filters={filters} globalFilterFields={['name','city','phone1','phone2','sat_domain','href','portal_link','staff','sat_template']} header={headerTemplate} emptyMessage='Даных нет.' style={{fontSize:14}} tableStyle={{ minWidth: '50rem' }}>
          <Column selectionMode='multiple' headerStyle={{ width: '3rem',backgroundColor:'white',paddingLeft:'unset' }}></Column>
          <Column header='Объект' body={nameBodyTemplate} sortable headerStyle={{ backgroundColor:'white' }}></Column>
          <Column field='city' header='Регион' sortable headerStyle={{ backgroundColor:'white' }}></Column>
          <Column header='Ссылка' body={linkBodyTemplate} headerStyle={{ backgroundColor:'white' }}></Column>
          <Column header='Менеджер' body={staffBodyTemplate} headerStyle={{ backgroundColor:'white' }}></Column>
          <Column header='Шаблон' field='sat_template' sortable headerStyle={{ backgroundColor:'white' }}></Column>
          <Column header='Пума' body={pumaBodyTemplate} headerStyle={{ backgroundColor:'white' }}></Column>
          <Column header='Сайт' body={siteBodyTemplate} headerStyle={{ backgroundColor:'white' }}></Column>
        </DataTable>
        {contextMenu &&
          <div className='context-menu-wrap' style={{top:positions.y, left:positions.x}}>
            <span className='p-float-label'>
              <InputText id='phones' type='text' className='p-inputtext-sm' value={currentData} onChange={(e) => setCurrentdata(e.target.value)} />
              <label className='label' htmlFor='phones'>{currentPhone}</label>
            </span>
            <Button className='ml-2' icon='pi pi-times' severity='danger' text rounded size='large' onClick={() => setContextMenu(false)} />
            <Button icon='pi pi-check' severity='success' text rounded size='large' loading={isPhoneUpdating} onClick={() => handlePhoneState()} />
          </div>
        }
        {contextStaffMenu &&
          <div className='context-menu-wrap' style={{top:positions.y, left:positions.x}}>
            <MultiSelect value={selectedUsers} onChange={(e) => setSelectedUsers(e.value)} options={staffList} optionLabel='label' optionValue='value' optionGroupLabel='label' optionGroupChildren='items' display='chip' filter placeholder='Менеджер' className='w-full md:w-20rem' showClear dataKey='item._id' />
            <Button className='ml-2' icon='pi pi-times' severity='danger' text rounded size='large' onClick={() => setContextStaffMenu(false)} />
            <Button icon='pi pi-check' severity='success' text rounded size='large' onClick={() => setContextStaffMenu(false)} />
          </div>
        }
        {isMut && <Loader mutate={true} />}
        <Toast ref={toast} position="top-center" />
      </main>
    </MainLayout>
    </>
  )
}
