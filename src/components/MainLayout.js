import {useState} from 'react'
import {useRouter} from 'next/router'
import 'primeicons/primeicons.css'
import { ScrollTop } from 'primereact/scrolltop'
import { Sidebar } from 'primereact/sidebar'
import { Button } from 'primereact/button'
import { Toolbar } from 'primereact/toolbar'

export function MainLayout({ children }) {
  const router = useRouter()
  const [visible, setVisibleSide] = useState(false)

  const ToolbarStartContent = (
    <div className="card flex justify-content-center">
      <Sidebar visible={visible} onHide={() => setVisibleSide(false)} className="w-full md:w-10rem lg:w-18rem">
        <p onClick={() => router.push('/')}><i className="pi pi-home mr-3"></i>Все сайты</p>
        <p onClick={() => router.push('/users')}><i className="pi pi-user mr-3"></i>Пользователи</p>
        <p onClick={() => router.push('/ats')}><i className="pi pi-phone mr-3"></i>Телефония</p>
      </Sidebar>
      <Button icon="pi pi-bars" severity="secondary" rounded text onClick={() => setVisibleSide(true)} />
    </div>
  )

const ToolbarEndContent = (
    <>
      <Button icon="pi pi-arrow-right" severity="secondary" rounded text />
    </>
)

  return (
    <main className="main">
      <Toolbar start={ToolbarStartContent} end={ToolbarEndContent} style={{marginBottom:"10px"}}/>
      {children}
      <ScrollTop className="bg-gray-500" />
    </main>
  )
}
