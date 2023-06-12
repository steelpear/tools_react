import Head from 'next/head'
import { MainLayout } from '../components/MainLayout'

export default function Users () {
  return (
    <>
    <Head>
      <title>Пользователи / Инструменты</title>
    </Head>
    <MainLayout>
      <main>
        Users
      </main>
    </MainLayout>
    </>
  )
}
