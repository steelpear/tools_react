import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import {useSWRConfig} from 'swr'
import { EventBus } from '../components/EventBus'
import useSWRImmutable from 'swr/immutable'
import { MainLayout } from '../components/MainLayout'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputTextarea } from 'primereact/inputtextarea'
import { Fieldset } from 'primereact/fieldset'
import { Chip } from 'primereact/chip'
import { Badge } from 'primereact/badge'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Tooltip } from 'primereact/tooltip'
import { Toast } from 'primereact/toast'
import { Menu } from 'primereact/menu'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Users () {
  const toast = useRef(null)
  const chipMenu = useRef(null)
  const exportDialog = useRef(null)
  const importDialog = useRef(null)
  const clearDialog = useRef(null)
  const inputFile = useRef(null)
  const { data: posts } = useSWRImmutable('/api/posts', fetcher)
  const { data: users } = useSWRImmutable('/api/users', fetcher)

  const { mutate } = useSWRConfig()

  const [selectedUsers, setSelectedUsers] = useState(null)
  const [usersList, setUsersList] = useState(null)
  const [contextStaffMenu, setContextStaffMenu] = useState(false)
  const [contextPostNumMenu, setContextPostNumMenu] = useState(false)
  const [currentPostId, setCurrentPostId] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserName, setCurrentUserName] = useState('John Doe')
  const [currentUserUser, setCurrentUserUser] = useState('')
  const [positions, setPositions] = useState({x:0,y:0})
  const [postNum, setPostNum] = useState('')
  const [importHotelsValue, setImportHotelsValue] = useState('')
  const [exportHotelsValue, setExportHotelsValue] = useState('')

  const chipMenuItems = [
    {
      label: 'Импорт отелей',
      icon: 'pi pi-file-import',
      command: e => importDialog.current.toggle(e.originalEvent)
    },
    {
      label: 'Экспорт отелей',
      icon: 'pi pi-file-export',
      command: e => exportDialog.current.toggle(e.originalEvent)
    },
    {
      label: 'Очистить отели',
      icon: 'pi pi-times',
      command: e => clearDialog.current.toggle(e.originalEvent)
    },
    {
      label: 'В аккаунт',
      icon: 'pi pi-user',
      command: () => window.open(`https://broniryem.ru/admin/accounts/account/${currentUserId}`, '_blank', 'noopener,noreferrer')
    }
  ]

  useEffect(() => {
    EventBus.$on('addpost', () => addPost())
    return () => {EventBus.$off('addpost')}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addPost = async () => {
    const cnt = await fetch('/api/countposts')
    const  count = await cnt.json()
    await fetch('/api/addpost', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ post_num: count + 1 })
    })
    mutate('/api/posts')
  }

  const deletePost = async (id) => {
    await fetch('/api/deletepost', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id })
    })
    mutate('/api/posts')
  }

  const getUsersList = () => {
    const usrlst = users.map(user => {
      return (
        { name: user.lastname ? user.lastname : user.user, id: user._id }
      )
    })
    setUsersList(usrlst)
  }

  const editPostNumContextMenu = (e, id, num) => {
    e.preventDefault()
    setPositions({x:e.pageX+90,y:e.pageY-34})
    setCurrentPostId(id)
    setPostNum(num)
    setContextPostNumMenu(true)
  }

  const editPostNum = async () => {
    setContextPostNumMenu(false)
    await fetch('/api/editpostnum', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id: currentPostId, data:  postNum })
    })
    setPostNum('')
    mutate('/api/posts')
  }

  const addUserMenu = (e, id) => {
    getUsersList()
    setPositions({x:e.pageX-250,y:e.pageY-40})
    setCurrentPostId(id)
    setContextStaffMenu(true)
  }

  const addUser = async () => {
    await fetch('/api/adduser', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id: currentPostId, data:  selectedUsers })
    })
    setContextStaffMenu(false)
    setSelectedUsers(null)
    mutate('/api/posts')
  }

  const deleteUser = async (post, user) => {
    await fetch('/api/deleteuser', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id: post, data:  user })
    })
    mutate('/api/posts')
  }

  const userHotelsListMenu = (e, id) => {
    e.preventDefault()
    const usr = users.filter(user => user._id == id)
    chipMenu.current.toggle(e)
    setCurrentUserId(id)
    setCurrentUserName(usr[0].lastname ? usr[0].lastname : usr[0].user)
    setExportHotelsValue(usr[0].hotels)
    setCurrentUserUser(usr[0].user)
  }

  const closeImportDialog = (e) => {
    importDialog.current.toggle(e)
    setImportHotelsValue([])
  }

  const closeExportDialog = (e) => {
    exportDialog.current.toggle(e)
  }

  const closeClearDialog = (e) => {
    clearDialog.current.toggle(e)
  }

  const copyToClipboard = (data) => {
    navigator.clipboard.writeText(data)
    toast.current.show({severity:'info', detail:'Скопировано в буфер обмена', life: 2000})
  }

  const exportIds = () => {
    const ids = JSON.stringify(exportHotelsValue)
    const date = new Date()
    const name = 'export-hotels-list_' + currentUserUser + '_' + ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear() + '_' + ('0' + date.getHours()).slice(-2) + '-' + ('0' + date.getMinutes()).slice(-2) + '.json'
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
      reader.onload = () => {
        const res = reader.result
        const out = res.replace(/[^a-z0-9,]/g, '').split(',')
        setImportHotelsValue(out)
      }
    }
  }

  const handleImportHotels = async(e) => {
    const res = await fetch('/api/updateuserhotels', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id: currentUserId, data:  importHotelsValue })
      // body: JSON.stringify({ id: currentUserId, data:  importHotelsValue.replace(/[^a-z0-9,]/g, '').split(',') })
    })
    const response = await res.json()
    if (response) {toast.current.show({severity:'success', detail:'Список отелей импортирован', life: 2000})}
    else {toast.current.show({severity:'danger', detail:'Что-то пошло не так', life: 2000})}
    closeImportDialog(e)
    mutate('/api/users')
  }

  const clearUserHotelsList = async (e) => {
    const res = await fetch('/api/updateuserhotels', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ id: currentUserId, data:  [] })
    })
    const response = await res.json()
    if (response) {toast.current.show({severity:'success', detail:'Список отелей очищен', life: 2000})}
    else {toast.current.show({severity:'danger', detail:'Что-то пошло не так', life: 2000})}
    clearDialog.current.toggle(e)
    mutate('/api/users')
  }

  return (
    <>
      <Head>
        <title>Посты / Инструменты</title>
      </Head>
      <MainLayout title='Посты / Инструменты'>
        <main>
          <div className="mt-3">
            {posts && posts.map(post => {
              return (
                <div className="card mb-2" key={post._id}>
                  <Tooltip target=".custom-target-chip" />
                  <Fieldset legend={<div onContextMenu={(e) => editPostNumContextMenu(e,post._id,post.post_num)}>Пост {post.post_num}</div>} toggleable >
                    <div className="grid">
                      <div className="col-11 flex align-items-center">
                        {post.staff.map(item => {return users && users.map(user => {if (user._id == item) {return (
                        <>
                          <Menu model={chipMenuItems} popup ref={chipMenu} id="popup_menu_left" />
                          <Chip key={user._id} label={user.lastname ? user.lastname : user.user} removable className="custom-target-chip mx-1 cursor-pointer" onRemove={() => deleteUser(post._id, user._id)} onContextMenu={(e) => userHotelsListMenu(e, user._id)} aria-controls="popup_menu_left" aria-haspopup data-pr-tooltip={`${user.user} (${user.hotels.length})`}data-pr-position="top" />
                        </>
                        )}})
                          }).sort((a, b) => a.label > b.label ? -1 : 1)}
                      </div>
                      <div className="col-1 flex align-items-center justify-content-center">
                        <Button icon='pi pi-plus' severity='success' rounded text size='large' onClick={(e) => addUserMenu(e, post._id)} />
                        <Button icon='pi pi-times' severity='danger' rounded text size='large' onClick={() => deletePost(post._id)} />
                      </div>
                    </div>
                  </Fieldset>
                </div>
              )
            })}
          </div>
            {contextStaffMenu &&
            <div className='context-menu-wrap' style={{top:positions.y, left:positions.x}}>
              <MultiSelect value={selectedUsers} onChange={(e) => setSelectedUsers(e.value)} options={usersList} optionLabel='name' optionValue='id' display='chip' filter placeholder='Менеджер' className='w-full md:w-12rem' showClear dataKey='item._id' />
              <Button className='ml-2' icon='pi pi-times' severity='danger' text rounded size='large' onClick={() => setContextStaffMenu(false)} />
              <Button icon='pi pi-check' severity='success' text rounded size='large' onClick={() => addUser()} />
            </div>
          }
          {contextPostNumMenu &&
            <div className='context-menu-wrap' style={{top:positions.y, left:positions.x}}>
              <InputText id="postnum" value={postNum} onChange={(e) => setPostNum(e.target.value)} keyfilter="int" placeholder="Номер поста" className="p-inputtext-sm" />
              <Button className='ml-2' icon='pi pi-times' severity='danger' text rounded size='large' onClick={() => setContextPostNumMenu(false)} />
              <Button icon='pi pi-check' severity='success' text rounded size='large' onClick={() => editPostNum()} />
            </div>
          }
          <Toast ref={toast} />
          <OverlayPanel ref={importDialog} showCloseIcon style={{width:300}}>
            <div className="flex justify-content-center">
              <div>
                <div className="font-medium text-center block">Импорт отелей</div>
                <div className="text-sm text-center block mb-2">{currentUserName}</div>
                <InputTextarea value={importHotelsValue} onChange={(e) => setImportHotelsValue(e.target.value)} rows={3} />
              </div>
            </div>
            <div className="flex align-items-center justify-content-between mt-2">
              <Button icon="pi pi-times" rounded text severity="danger" size='large' aria-label="Close" onClick={(e) => closeImportDialog(e)} />
              <Button icon="pi pi-file-import" rounded text severity="info" size='large' aria-label="Close" onClick={() => inputFile.current.click()} />
              <input style={{display:"none"}} ref={inputFile} onChange={importIds} type="file" accept=".json" />
              <Button icon="pi pi-check" rounded text severity="success" size='large' disabled={importHotelsValue.length < 1} aria-label="Confirm" onClick={(e) => handleImportHotels(e)} />
            </div>
          </OverlayPanel>
          <OverlayPanel ref={exportDialog} showCloseIcon style={{width:300}}>
            <div className="flex justify-content-center">
              <div>
                <div className="font-medium text-center block">Экспорт отелей {exportHotelsValue.length > 0 && <Badge value={exportHotelsValue.length} severity="info" />}</div>
                <div className="text-sm text-center block mb-2">{currentUserName}</div>
                <InputTextarea value={exportHotelsValue} disabled={exportHotelsValue.length < 1} onChange={(e) => setExportHotelsValue(e.target.value)} rows={3} />
              </div>
            </div>
            <div className="flex align-items-center justify-content-between mt-2">
              <Button icon="pi pi-times" rounded text severity="danger" size='large' aria-label="Close" onClick={(e) => closeExportDialog(e)} />
              <Button icon="pi pi-file-export" rounded text severity="info" size='large' disabled={exportHotelsValue.length < 1} aria-label="Close" onClick={(e) => exportIds()} />
              <Button icon="pi pi-copy" rounded text severity="info" size='large' disabled={exportHotelsValue.length < 1} aria-label="Confirm" onClick={(e) => copyToClipboard(exportHotelsValue)} />
            </div>
          </OverlayPanel>
          <OverlayPanel ref={clearDialog} showCloseIcon style={{width:300}}>
            <div className="flex justify-content-center">
              <div>
                <div className="font-medium text-center block">Очистить список отелей</div>
                <div className="text-sm text-center block mb-2">{currentUserName}</div>
              </div>
            </div>
            <div className="flex align-items-center justify-content-between mt-2">
              <Button icon="pi pi-times" rounded text severity="danger" size='large' aria-label="Close" onClick={(e) => closeClearDialog(e)} />
              <Button icon="pi pi-check" rounded text severity="success" size='large' aria-label="Clear" onClick={(e) => clearUserHotelsList(e)} />
            </div>
          </OverlayPanel>
        </main>
      </MainLayout>
    </>
  )
}
