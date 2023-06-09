import {useState} from 'react'
import Link from 'next/link'
import Head from 'next/head'
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
        <Link href="/"><p><i className="pi pi-home"></i>&ensp;Все сайты</p></Link>
        <Link href="/users"><p><i className="pi pi-user"></i>&ensp;Пользователи</p></Link>
        <Link href="/ats"><p><i className="pi pi-phone"></i>&ensp;Телефония</p></Link>
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
    <>
      <Head>
        <title>Инструменты</title>
        <meta name="description" content="Инструменты" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="main">
      <Toolbar start={ToolbarStartContent} end={ToolbarEndContent} style={{marginBottom:"10px"}}/>
        {children}
      </main>
      <ScrollTop className="bg-gray-500" />
    </>
  )
}
