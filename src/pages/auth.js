import {useState, useEffect, useRef} from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Cookies from 'js-cookie'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'

export default function Auth() {
  const toast = useRef(null)
  const router = useRouter()
  const [height, setHeight] = useState(null)
  const [user, setUser] = useState('')

  useEffect(() => {setHeight(window.innerHeight - 30)}, [])

  const checkLogin = async () => {
    const res = await fetch('/api/checkuser', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(user)
    })
    const response = await res.json()
    if (response[0] && response[0].user === user) {
      Cookies.set('_jkNhfyGtr5-kJh5y7Ujhs', user, {
        expires: 30,
        path: '/',
        sameSite: 'None',
        secure: true 
      })
      setUser('')
      toast.current.show({ severity: 'success', summary: `Удачно, ${user}!`, detail: 'Вы авторизованы.' })
      setTimeout(() => router.push('/'), 500)
    } else {toast.current.show({ severity: 'error', summary: 'Ошибка!', detail: 'Ошибка авторизации!' })}
  }

  if (height) {
    return (
      <>
        <Head>
          <title>Инструменты | Авторизация</title>
          <meta name="description" content="Инструменты" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="card flex justify-content-center align-items-center flex-column" style={{height: height, marginTop: '-30px'}}>
          <h2 style={{margin: '0', color: 'dimgrey'}}>Инструменты</h2>
          <h3 style={{margin: '5px 0 15px 0', color: 'dimgrey'}}>Авторизация</h3>
          <div style={{width: '280px'}}>
            <div className="flex justify-content-center">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-user mr-3 text-sm" />
                <InputText value={user} onChange={(e) => setUser(e.target.value)} placeholder='Введите логин' />
              </IconField>
            </div>
            <Button disabled={!user} label="Войти" icon="pi pi-check" onClick={() => checkLogin()} className="p-button-success p-button-raised mt-3 w-full"/>
          </div>
        </div>
        <Toast ref={toast} position="top-center" />
      </>
    )
  } else {return (<></>)}
}
