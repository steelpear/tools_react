import { useState, useEffect } from 'react'
import Head from 'next/head'
import {useSWRConfig} from 'swr'
import { EventBus } from '../components/EventBus'
import useSWRImmutable from 'swr/immutable'
import { MainLayout } from '../components/MainLayout'
import { Fieldset } from 'primereact/fieldset'
import { Chip } from 'primereact/chip'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Tooltip } from 'primereact/tooltip'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Users () {
  const { data: posts } = useSWRImmutable('/api/posts', fetcher)
  const { data: users } = useSWRImmutable('/api/users', fetcher)

  const { mutate } = useSWRConfig()

  const [selectedUsers, setSelectedUsers] = useState(null)
  const [usersList, setUsersList] = useState(null)
  const [contextStaffMenu, setContextStaffMenu] = useState(false)
  const [contextPostNumMenu, setContextPostNumMenu] = useState(false)
  const [currentPostId, setCurrentPostId] = useState(null)
  const [positions, setPositions] = useState({x:0,y:0})
  const [postNum, setPostNum] = useState('')

  useEffect(() => {
    EventBus.$on('addpost', () => addPost())
    return () => {EventBus.$off('addpost')}
  }, [])

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

  const editPostNumContextMenu = (e, id) => {
    e.preventDefault()
    setPositions({x:e.pageX+90,y:e.pageY-34})
    setCurrentPostId(id)
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
                  <Fieldset legend={`Пост ${post.post_num}`} toggleable onContextMenu={(e) => editPostNumContextMenu(e,post._id)}>
                    <div className="grid">
                      <div className="col-11 flex align-items-center">
                        {post.staff.map(item => {return users && users.map(user => {if (user._id == item) {return <Chip key={user._id} label={user.lastname ? user.lastname : user.user} removable className='custom-target-chip mx-1 cursor-pointer' onRemove={() => deleteUser(post._id, user._id)} data-pr-tooltip={user.user} data-pr-position="top" />}})
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
            <InputText value={postNum} onChange={(e) => setPostNum(e.target.value)} keyfilter="int" placeholder="Номер поста" />
            <Button className='ml-2' icon='pi pi-times' severity='danger' text rounded size='large' onClick={() => setContextPostNumMenu(false)} />
            <Button icon='pi pi-check' severity='success' text rounded size='large' onClick={() => editPostNum()} />
          </div>
        }
        </main>
      </MainLayout>
    </>
  )
}
