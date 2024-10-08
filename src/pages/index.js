import { useState, useEffect, useRef } from 'react'
import useSWR, {useSWRConfig} from 'swr'
import useSWRImmutable from 'swr/immutable'
import Head from 'next/head'
import { Loader } from '../components/Loader'
import { MainLayout } from '../components/MainLayout'
import { FiltersButton } from '../components/FiltersButton'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
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
  const inputFile = useRef(null)
  const { mutate } = useSWRConfig()
  const btnOptions = [
    {icon: 'pi pi-check-circle', value: 'PumaOn'},
    {icon: 'pi pi-power-off', value: 'PumaOff'},
    {icon: 'pi pi-align-justify', value: 'All'}
  ]
  const [btnValue, setBtnValue] = useState(btnOptions[0].value)
  const [isMut, setIsMut] = useState(false)
  const [counter, setCounter] = useState(0)
  const [isUpdated, setIsUpdated] = useState('')
  const [isPhoneUpdating, setIsPhoneUpdating] = useState(false)
  const [isStuffUpdating, setIsStuffUpdating] = useState(false)
  const [isTwoPhones, setIsTwoPhones] = useState(false)
  const [isAddPhone2, setIsAddPhone2]= useState(false)
  const [filters, setFilters] = useState({global: {value: null, matchMode: FilterMatchMode.CONTAINS}})
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [contextMenu, setContextMenu] = useState(false)
  const [contextEmptyMenu, setContextEmptyMenu] = useState(false)
  const [contextStaffMenu, setContextStaffMenu] = useState(false)
  const [positions, setPositions] = useState({x:0,y:0})
  const [currentData, setCurrentdata] = useState('')
  const [currentPhone, setCurrentPhone] = useState('')
  const [currentPhone1, setCurrentPhone1] = useState('')
  const [currentPhone2, setCurrentPhone2] = useState('')
  const [currentStaffData, setCurrentStaffData] = useState(null)
  const [currentId, setCurrentId] = useState(null)
  const [selectedHotels, setSelectedHotels] = useState([])
  const [selectedUsers, setSelectedUsers] = useState(null)
  const [staffList, setStaffList] = useState(null)

  const { data: hotels, error } = useSWR('https://broniryem.ru/api/Tools/hotels', fetcher, {revalidateOnMount: false, revalidateOnFocus: false})
  const { data: posts } = useSWRImmutable('/api/posts', fetcher)
  const { data: users } = useSWRImmutable('/api/users', fetcher)

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
      setCounter(0)
      setIsMut(false)
    }
    const filter = checkBtn()
    mut(filter)
  }, [btnValue]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div>{error.message}</div>
  if (!hotels) return <Loader mutate={false} />

  const getStuffList = () => {
    const out = []
    const postsStaff = []
    posts.forEach(post => {
      out.push(
        {
          label: `Пост ${post.post_num}`,
          items: post.staff.map(item => {return {
            label: users.map(user => {if (user._id == item) {return user.lastname ? user.lastname : user.user}}),
            value: item
          }}).sort((a, b) => a.label > b.label ? -1 : 1)
        }
      )
      postsStaff.push(post.staff)
    })
    let outPosts = []
    outPosts = outPosts.concat.apply(outPosts, postsStaff)
    const notPosts = {
      label: 'Вне постов',
      items: users.map(user => {
        if (!outPosts.includes(user._id)) {
          return {
            label: user.lastname ? <div>{user.lastname} (<span className='text-xs'>{user.user}</span>)</div> : user.user,
            value: user._id
          }
        }
      }).sort((a, b) => a.label > b.label ? -1 : 1).filter(item => item !== undefined)
    }
    out.push(notPosts)
    setStaffList(out)
  }

  const handleContextMenu = (e,data,id,phone,mode) => {
    e.preventDefault()
    setPositions({x:e.pageX,y:e.pageY})
    setCurrentdata(data)
    setCurrentPhone(phone)
    setCurrentId(id)
    setIsTwoPhones(mode)
    setContextMenu(true)
  }

  const handleContextEmptyMenu = (e,id) => {
    e.preventDefault()
    setPositions({x:e.pageX,y:e.pageY})
    setCurrentId(id)
    setContextMenu(false)
    setContextStaffMenu(false)
    setContextEmptyMenu(true)
  }

  const closeContextEmptyMenu = () => {
    setCurrentPhone1('')
    setCurrentPhone2('')
    setIsAddPhone2(false)
    setContextEmptyMenu(false)
  }

  const closeContextMenu = () => {
    setIsAddPhone2(false)
    setContextMenu(false)
  }

  const handleContextMenuStaff = (e,data,id) => {
    e.preventDefault()
    const stf = data.map(item => item._id)
    setPositions({x:e.pageX-200,y:e.pageY})
    setCurrentStaffData(stf)
    setSelectedUsers(stf)
    setCurrentId(id)
    getStuffList()
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
    toast.current.show({severity:'success', summary: 'Готово', detail:'Изменения сохранены', life: 2500})
  }

  const handlePhoneState = async (mode) => {
    let data = null
    if (mode == 'empty') {
      data = {phone1:currentPhone1, phone2:currentPhone2}
    } else if (mode == 'add') {
      data = {phone1:currentData, phone2:currentPhone2}
    } else {
      data = {[currentPhone]: currentData}
    }
    setIsPhoneUpdating(true)
    await fetch('/api/updatehotel', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({id: currentId, data})
    })
    await mutate('https://broniryem.ru/api/Tools/hotels')
    toast.current.show({severity:'success', summary: 'Готово', detail:'Изменения сохранены', life: 2500})
    setIsPhoneUpdating(false)
    mode == 'empty' ? closeContextEmptyMenu() : closeContextMenu()
  }

  const copyToClipboard = (data) => {
    navigator.clipboard.writeText(data.replace(/[^\d]/g,'').slice(1))
    toast.current.show({severity:'info', detail:'Скопировано в буфер обмена', life: 2000})
  }

  const handleStuffList = async () => {
    setIsStuffUpdating(true)
    const resp = await fetch('/api/deleteusershotel', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ids: currentStaffData, data: currentId})
    })
    const responze = await resp.json()
    setIsUpdated(responze.modifiedCount != 0 ? 'Ok' : 'Error')
    if (selectedUsers !== null) {
      const res = await fetch('/api/updateusershotels', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ids: selectedUsers, data: currentId})
      })
      const response = await res.json()
      setIsUpdated(response.modifiedCount != 0 ? 'Ok' : 'Error')
    }
    setIsStuffUpdating(false)
    setContextStaffMenu(false)
    await mutate('https://broniryem.ru/api/Tools/hotels')
    if (isUpdated == 'Ok') {
      toast.current.show({severity:'success', summary: 'Готово', detail:'Изменения сохранены', life: 2500})
    } else if (isUpdated === 'Error') {
      toast.current.show({severity:'error', summary: 'Ошибка!', detail:'Что-то пошло не так', life: 2500})
    }
  }

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

  const resetFilters = async () => {
    if (btnValue === 'PumaOn') await mutate('https://broniryem.ru/api/Tools/hotels')
    else setBtnValue('PumaOn')
  }

  const exportIds = () => {
    const ids = JSON.stringify(selectedHotels.map(item => item._id))
    const date = new Date()
    const name = 'export-hotels-list_' + ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear() + '_' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '.json'
    const blob = new Blob([ids], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = name
    link.href = url
    link.click()
  }

  const importIds = e => {
    const { files } = e.target
    if (files && files.length) {
      const reader = new FileReader()
      reader.readAsText(files[0])
      reader.onload = async () => {
        const filter = {_id: {$in:JSON.parse(reader.result)}}
        if (btnValue === 'PumaOn') { filter.puma = true }
        else if (btnValue === 'PumaOff') { filter.puma = false }
        await mutate('https://broniryem.ru/api/Tools/hotels', fetcher('https://broniryem.ru/api/Tools/hotels', {
          method: 'POST',
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({ filter })
        }), {revalidate: false})
      }
    }
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
          <SelectButton value={btnValue} onChange={(e) => setBtnValue(e.value)} itemTemplate={selectButtonTemplate} optionLabel="value" options={btnOptions} tooltip="ПУМА on/off/all" tooltipOptions={{position: 'top'}}style={{marginInline: 10}} />
          <Button icon="pi pi-file-import" rounded text severity="info" onClick={() => inputFile.current.click()} aria-controls="filter_menu" aria-haspopup tooltip="Импорт" tooltipOptions={{position: 'top'}} />
          <input style={{display:"none"}} ref={inputFile} onChange={importIds} type="file" accept=".json" />
          <FiltersButton mode={btnValue} templates={hotels['templates']} />
          <Button icon="pi pi-filter-slash" rounded text severity="info" onClick={() => resetFilters()} aria-controls="filter_menu" aria-haspopup tooltip="Сбросить фильтры" tooltipOptions={{position: 'top'}} />
          <Button icon="pi pi-file-export" disabled={selectedHotels.length < 1} rounded text severity="info" onClick={() => exportIds()} aria-controls="filter_menu" aria-haspopup tooltip="Экспорт" tooltipOptions={{position: 'top'}} />
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

  const nameBodyTemplate = (data) => {
    return (
    <div>
      <a href={`https://broniryem.ru/admin/collections/entry/5a5dc18e670fd819bca20da7/${data._id}`} target='_blank' style={{textDecoration:'none'}}><span style={{fontWeight:'400', fontSize:'.9rem'}}>{data.name}</span></a>
      <div className='text-xs -mt-1 font-italic'>{data.type}</div>
      {data.phone1 || data.phone2 ?
      <div className='phones_wrap'>
        {data.phone1 && <div className='phones_wrap_item' onClick={() => copyToClipboard(data.phone1)} onContextMenu={(e) => handleContextMenu(e,data.phone1,data._id,'phone1', data.phone1 && data.phone2 ? true : false)}>{data.phone1}</div>}
        {data.phone2 && <div className='phones_wrap_item' onClick={() => copyToClipboard(data.phone2)} onContextMenu={(e) => handleContextMenu(e,data.phone2,data._id,'phone2', data.phone1 && data.phone2 ? true : false)}>{data.phone2}</div>}
      </div> : <div onContextMenu={(e) => handleContextEmptyMenu(e,data._id)}><i className='pi pi-minus' style={{lineHeight: 'normal', cursor: 'pointer'}} /></div>}
    </div>)
  }

  const staffBodyTemplate = (data) => {
    return <div style={{cursor: 'pointer'}} onContextMenu={(e) => handleContextMenuStaff(e,data.staff,data._id)}>{data.staff && data.staff.length > 0 ? data.staff.map(item => {return <a key={item._id} href={`https://broniryem.ru/admin/accounts/account/${item._id}`} target='_blank' style={{textDecoration:'none'}}><div style={{fontSize:'.75rem',margin:'0px',lineHeight:'.77rem'}}>{item.lastname ? item.lastname : item.user}<br></br></div></a>}) : <i className="pi pi-minus py-3" style={{lineHeight:'normal', cursor:'pointer'}} />}</div>
  }

  const linkBodyTemplate = (data) => {
    if (data.site_type === 'Сателлит' || data.site_type === 'Автосателлит') {return data.sat_domain ? <a href={`http://${data.sat_domain}`} target='_blank' style={{textDecoration:'none'}}>{punycode.toUnicode(data.sat_domain)}</a> : <></>}
    else if (data.site_type === 'Классический' || data.site_type === 'Автономный') {return data.href ? <a href={`http://${data.href}`} target='_blank' style={{textDecoration:'none'}}>{punycode.toUnicode(data.href)}</a> : <></>}
    else if (data.site_type === 'Нет сайта') {return data.portal_link ? <a href={`http://${data.portal_link.replace(/^https?:\/\//,'')}`} target='_blank' style={{textDecoration:'none'}}>{data.portal_link.replace(/^https?:\/\//,'')}</a> : <a href={`https://broniryem.ru/hotel/${data.city_slug}/${data.name_slug}`} target='_blank' style={{textDecoration:'none'}}>{`broniryem.ru/hotel/${data.city_slug}/${data.name_slug}`}</a>}
    else { return <></> }
  }

  const siteBodyTemplate = (data) => {
    if (data.site_type === 'Сателлит') {return <div style={{textAlign:'center'}}><Image src='satellite.svg' alt="satellite" width='18' /></div>}
    else if (data.site_type === 'Классический') {return <div style={{textAlign:'center'}}><Image src='rocket.svg' alt="rocket" width='18' /></div>}
    else if (data.site_type === 'Автономный') {return <div style={{textAlign:'center'}}><Image src='aa.svg' alt="aa" width='18' /></div>}
    else if (data.site_type === 'Автосателлит') {return <div style={{textAlign:'center'}}><Image src='letter.svg' alt="letter" width='18' /></div>}
    else if (data.site_type === 'Нет сайта') {return <div style={{textAlign:'center'}}><Image src='logo.svg' alt="logo" width='18' /></div>}
    else {return <div style={{textAlign:'center'}}><Image src='nothing.svg' alt='portal' width='18' /></div>}
  }

  const pumaBodyTemplate = (data) => {
    return data.puma ? <Button icon='pi pi-check-circle' severity='success' rounded text onClick={() => handlePumaState(data._id, data.puma)} /> : <Button icon='pi pi-power-off' severity='danger' rounded text onClick={() => handlePumaState(data._id, data.puma)} />
  }

  return (
    <>
    <Head>
      <title>Объекты / Инструменты</title>
    </Head>
    <MainLayout count={counter > 0 ? counter : hotels['hotels'].length} title='Объекты / Инструменты'>
      <main>
        <DataTable value={hotels['hotels']} size='small' selectionMode='checkbox' selectionPageOnly selection={selectedHotels} onSelectionChange={(e) => setSelectedHotels(e.value)} dataKey='_id' stripedRows removableSort paginator responsiveLayout='scroll' paginatorTemplate='CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown' currentPageReportTemplate='Строки {first} - {last} из {totalRecords}' rows={50} rowsPerPageOptions={[50,100,counter > 0 ? counter : hotels['hotels'].length]} filters={filters} globalFilterFields={['name','city','phone1','phone2','sat_domain','href','portal_link','staff','sat_template','lastname']} header={headerTemplate} emptyMessage='Даных нет.' style={{fontSize:14}} tableStyle={{ minWidth: '50rem' }} onValueChange={(e) => setCounter(e.length)}>
          <Column header="#" headerStyle={{width: '2.5rem'}} body={(data, options) => <div className='ml-1 text-sm'>{options.rowIndex + 1}</div>} />
          <Column selectionMode='multiple' headerStyle={{ width: '3rem',backgroundColor:'white',paddingLeft:'unset' }} />
          <Column header='Объект' field='name' body={nameBodyTemplate} sortable headerStyle={{ backgroundColor:'white' }} />
          <Column field='city' body={data => <div className='ml-1 text-sm' onClick={() => copyToClipboard(data.city)}>{data.city}</div>} header='Регион' sortable headerStyle={{ backgroundColor:'white' }} />
          <Column header='Ссылка' body={linkBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
          <Column header='Менеджер' body={staffBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
          <Column header='Шаблон' field='sat_template' body={data => <div className='ml-1 text-sm' onClick={() => copyToClipboard(data.sat_template)}>{data.sat_template}</div>} sortable headerStyle={{ backgroundColor:'white' }} />
          <Column header='Пума' body={pumaBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
          <Column header='Сайт' body={siteBodyTemplate} headerStyle={{ backgroundColor:'white' }} />
        </DataTable>
        {contextMenu &&
          <div className={`context-menu-wrap ${isAddPhone2 && 'block'}`} style={{top:positions.y, left:positions.x}}>
            <span className='p-float-label'>
              <InputText id='phone1' type='text' className='p-inputtext-sm' value={currentData} onChange={(e) => setCurrentdata(e.target.value)} />
              <label className='label' htmlFor='phone1'>{currentPhone}</label>
            </span>
            {isAddPhone2 &&
              <span className='p-float-label mt-1'>
              <InputText id='phone2' type='text' className='p-inputtext-sm' value={currentPhone2} onChange={(e) => setCurrentPhone2(e.target.value)} />
              <label className='label' htmlFor='phone2'>phone2</label>
            </span>}
            <div className='flex align-items-center justify-content-between'>
              <Button className={`${!isAddPhone2 && 'ml-1'}`} icon='pi pi-times' severity='danger' text rounded onClick={() => closeContextMenu()} />
              {(!isTwoPhones && !isAddPhone2) && <Button className='ml-1' icon='pi pi-plus' severity='secondary' text rounded onClick={() => setIsAddPhone2(true)} />}
              <Button icon='pi pi-check' severity='success' text rounded loading={isPhoneUpdating} onClick={() => handlePhoneState(isAddPhone2 ? 'add' : 'one')} />
            </div>
          </div>
        }
        {contextEmptyMenu &&
          <div className='context-menu-wrap block' style={{top:positions.y, left:positions.x}}>
            <div className='p-float-label'>
              <InputText id='phone1' type='text' className='p-inputtext-sm' value={currentPhone1} onChange={(e) => setCurrentPhone1(e.target.value)} />
              <label className='label' htmlFor='phone1'>phone1</label>
            </div>
            <div className='p-float-label mt-1'>
              <InputText id='phone2' type='text' className='p-inputtext-sm' value={currentPhone2} onChange={(e) => setCurrentPhone2(e.target.value)} disabled={!currentPhone1} />
              <label className='label' htmlFor='phone2'>phone2</label>
            </div>
            <div className='flex align-items-center justify-content-between'>
              <Button icon='pi pi-times' severity='danger' text rounded onClick={() => closeContextEmptyMenu()} />
              <Button icon='pi pi-check' severity='success' text rounded disabled={!currentPhone1} loading={isPhoneUpdating} onClick={() => handlePhoneState('empty')} />
            </div>
          </div>
        }
        {contextStaffMenu &&
          <div className='context-menu-wrap' style={{top:positions.y, left:positions.x}}>
            <MultiSelect value={selectedUsers} onChange={(e) => setSelectedUsers(e.value)} options={staffList} optionLabel='label' optionValue='value' optionGroupLabel='label' optionGroupChildren='items' display='chip' filter placeholder='Менеджер' className='w-full md:w-20rem' showClear dataKey='item._id' />
            <Button className='ml-2' icon='pi pi-times' severity='danger' text rounded onClick={() => setContextStaffMenu(false)} />
            <Button icon='pi pi-check' severity='success' text rounded size='large' disabled={(currentStaffData == null || currentStaffData.length == 0) && (selectedUsers == null || selectedUsers.length == 0) || (selectedUsers == currentStaffData)} loading={isStuffUpdating} onClick={() => handleStuffList()} />
          </div>
        }
        {isMut && <Loader mutate={true} />}
        <Toast ref={toast} position="top-center" />
      </main>
    </MainLayout>
    </>
  )
}
