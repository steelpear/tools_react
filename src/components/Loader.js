import {useState, useEffect} from 'react'
import Head from 'next/head'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Skeleton } from 'primereact/skeleton'

export const Loader = () => {
  const [height, setHeight] = useState(null)
  const [width, setWidth] = useState(null)
  const size = 120

  const Row = () => {
    const count = 10
    const arr = []
    for (let i = 0; i < count; i++) {
        arr.push(
          <div className="flex justify-content-center align-items-center mt-4" key={i}>
            <Skeleton width="3rem" height="2rem" className="mb-1 mr-2"></Skeleton>
            <Skeleton width="50rem" height="2rem" className="mb-1 mr-2"></Skeleton>
            <Skeleton className="mb-1" height="2rem"></Skeleton>
          </div>
        )
    }
    return <div className="skeleton_wrap">{arr}</div>
  }

  useEffect(() => {
    setHeight(window.innerHeight)
    setWidth(window.innerWidth)
  },[])

  if (height) {
    return (
      <>
        <Head>
          <title>Загрузка / Инструменты</title>
        </Head>
        <Row />
        <div style={{ position: "absolute", top: (height / 2) - (size / 2), left: (width / 2) - (size / 2)}}>
          <ProgressSpinner style={{width: size, height: size}} strokeWidth="3" />
        </div>
      </>
    )
  } else {return (<></>)}
}
 