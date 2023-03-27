import {useState, useEffect} from 'react'
import { ProgressSpinner } from 'primereact/progressspinner'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

export const Loader = () => {
  const [height, setHeight] = useState(null)

  useEffect(() => {setHeight(window.innerHeight)}, [])

  if (height) {
    return (
      <>
        <div className="card flex justify-content-center align-items-center" style={{ height: height, marginTop: -60}}>
          <ProgressSpinner style={{width: '120px', height: '120px'}} strokeWidth="3" />
        </div>
      </>
    )
  } else {return (<></>)}
}
 