import {useState} from 'react'
import {useRouter} from 'next/router'
import { EventBus } from '../components/EventBus'
import { ClearCache } from '../components/ClearCache'
import 'primeicons/primeicons.css'
import { ScrollTop } from 'primereact/scrolltop'
import { Sidebar } from 'primereact/sidebar'
import { Button } from 'primereact/button'
import { Badge } from 'primereact/badge'
import { Toolbar } from 'primereact/toolbar'

export function MainLayout({ children, ...params }) {
  const router = useRouter()
  const [visible, setVisibleSide] = useState(false)

  const ToolbarStartContent = (
    <div className='card flex justify-content-center align-items-center'>
      <Sidebar visible={visible} onHide={() => setVisibleSide(false)} className='w-full md:w-10rem lg:w-18rem'>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/')} style={{color: router.route === '/' && 'red'}}><i className='pi pi-home mr-3'></i>Объекты</p>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/users')} style={{color: router.route === '/users' && 'red'}}><i className='pi pi-user mr-3'></i>Посты</p>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/ats')} style={{color: router.route === '/ats' && 'red'}}><i className='pi pi-phone mr-3'></i>Телефония</p>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/idfinder')} style={{color: router.route === '/idfinder' && 'red'}}><i className='pi pi-table mr-3'></i>ID Finder</p>
      </Sidebar>
      <Button icon='pi pi-bars' severity='secondary' rounded text onClick={() => setVisibleSide(true)} />
      <div style={{fontSize: 20,marginInline: 20}}>{params.title}{router.route === '/' && <span style={{fontSize: 14,marginInline: 10}}><Badge value={params.count} /></span>}</div>
      {router.route === '/users' && <Button icon='pi pi-plus' severity='success' rounded text size='large' onClick={() => EventBus.$emit('addpost')} tooltip="Добавить пост" tooltipOptions={{position: 'right'}} />}
    </div>
  )

const ToolbarEndContent = (
  <>
    <ClearCache />
    <Button icon='pi pi-arrow-right' severity='secondary' rounded text />
  </>
)

  return (
    <main className='main'>
      <Toolbar start={ToolbarStartContent} end={ToolbarEndContent} style={{marginBottom:'10px'}}/>
      {children}
      <ScrollTop className='bg-gray-500' />
    </main>
  )
}
