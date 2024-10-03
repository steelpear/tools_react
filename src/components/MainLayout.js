import {useState} from 'react'
import {useRouter} from 'next/router'
import { EventBus } from '../components/EventBus'
import Cookies from 'js-cookie'
import { ClearCache } from '../components/ClearCache'
import 'primeicons/primeicons.css'
import { ScrollTop } from 'primereact/scrolltop'
import { Sidebar } from 'primereact/sidebar'
import { Divider } from 'primereact/divider'
import { Button } from 'primereact/button'
import { Badge } from 'primereact/badge'
import { Toolbar } from 'primereact/toolbar'

export function MainLayout({ children, ...params }) {
  const router = useRouter()
  const [visible, setVisibleSide] = useState(false)

  const exit = () => {
    Cookies.remove('_jkNhfyGtr5-kJh5y7Ujhs')
    window.location.reload()
  }

  const ToolbarStartContent = (
    <div className='card flex justify-content-center align-items-center'>
      <Sidebar visible={visible} onHide={() => setVisibleSide(false)} className='w-full md:w-10rem lg:w-18rem'>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/')} style={{color: router.route === '/' && 'blue'}}><i className='pi pi-home mr-3'></i>Объекты</p>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/users')} style={{color: router.route === '/users' && 'blue'}}><i className='pi pi-users mr-3'></i>Посты</p>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/ats')} style={{color: router.route === '/ats' && 'blue'}}><i className='pi pi-phone mr-3'></i>Направления</p>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/operators')} style={{color: router.route === '/operators' && 'blue'}}><i className='pi pi-user mr-3'></i>Операторы</p>
        <p className='hover:text-blue-700 w-full' onClick={() => router.push('/idfinder')} style={{color: router.route === '/idfinder' && 'blue'}}><i className='pi pi-table mr-3'></i>ID Finder</p>
        <Divider />
      </Sidebar>
      <Button icon='pi pi-bars' severity='secondary' rounded text onClick={() => setVisibleSide(true)} />
      <div style={{fontSize: 20,marginInline: 20}}>{params.title}{(router.route === '/' || router.route === '/ats') && <span style={{fontSize: 14,marginInline: 10}}><Badge value={params.count} /></span>}</div>
      {router.route === '/users' && <Button icon='pi pi-plus' severity='success' rounded text size='large' onClick={() => EventBus.$emit('addpost')} tooltip="Добавить пост" tooltipOptions={{position: 'right'}} />}
    </div>
  )

const ToolbarEndContent = (
  <div className='flex align-items-center'>
    <ClearCache />
    <div className='text-sm mx-3'>{Cookies.get('_jkNhfyGtr5-kJh5y7Ujhs')}</div>
    <Button icon='pi pi-arrow-right' severity='secondary' rounded text onClick={() => exit()} />
  </div>
)

  return (
    <main className='main'>
      <Toolbar start={ToolbarStartContent} end={ToolbarEndContent} style={{marginBottom:'10px'}}/>
      {children}
      <ScrollTop className='bg-gray-500' />
    </main>
  )
}
