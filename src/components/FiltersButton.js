import {useState, useRef} from 'react'
import {useSWRConfig} from 'swr'
import useSWRImmutable from 'swr/immutable'
import { Menu } from 'primereact/menu'
import { OverlayPanel } from 'primereact/overlaypanel'
import { TreeSelect } from 'primereact/treeselect'
import { Button } from 'primereact/button'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const FiltersButton = () => {
  const opnRegion = useRef(null)
  const opnTemplate = useRef(null)
  const opnType = useRef(null)
  const filterMenu = useRef(null)
  const [citiesList, setCitiesList] = useState(null)
  const [selectedRegions, setSelectedRegions] = useState(null)

  const { mutate } = useSWRConfig()

  const { data: cities } = useSWRImmutable('/api/cities', fetcher)

  const getCitiesList = () => {
    const parents = cities.filter(item => item.level == 0)
    const childs = cities.filter(item => item.level == 1)
    const out = []
    parents.map((city, index) => {
      const chlds = childs.filter(child => child.parent == city._id)
      const chls = chlds.map((item, i) => {return {key: index + '-' + i, label: item.name, data: item}})
      out.push({key: index, label: city.name, data: city, children: chls})
    })
    setCitiesList(out)
  }

  const filterOfRegion = () => {
    console.log(selectedRegions)
  }

  const openRegionFilterPanel = (e) => {
    getCitiesList()
    opnRegion.current.toggle(e)
  }

  const itemRegion = (item) => (
    <div className='p-menuitem-content'>
      <a className="flex align-items-baseline p-menuitem-link" onClick={(e) => openRegionFilterPanel(e)}>
        <span className={item.icon} />
        <span className="mx-2">{item.label}</span>
      </a>
    </div>
  )

  const itemTemplate = (item) => (
    <div className='p-menuitem-content'>
      <a className="flex align-items-baseline p-menuitem-link" onClick={(e) => opnTemplate.current.toggle(e)}>
        <span className={item.icon} />
        <span className="mx-2">{item.label}</span>
      </a>
    </div>
  )

  const itemType = (item) => (
    <div className='p-menuitem-content'>
      <a className="flex align-items-baseline p-menuitem-link" onClick={(e) => opnType.current.toggle(e)}>
        <span className={item.icon} />
        <span className="mx-2">{item.label}</span>
      </a>
    </div>
  )

  const filterMenuItems = [
    {label: 'Регион', icon: 'pi pi-globe', template: itemRegion},
    {label: 'Шаблон', icon: 'pi pi-code', template: itemTemplate},
    {label: 'Тип', icon: 'pi pi-bookmark', template: itemType}
  ]

  return (
    <div className="card flex justify-content-center">
      <Menu model={filterMenuItems} popup ref={filterMenu} id="filter_menu" />
      <Button className='ml-2' icon="pi pi-filter" rounded text severity="info" size='large' onClick={(event) => filterMenu.current.toggle(event)} aria-controls="filter_menu" aria-haspopup tooltip="Фильтры" tooltipOptions={{position: 'top'}} />
      <OverlayPanel ref={opnRegion} showCloseIcon style={{width:300}}>
        <TreeSelect value={selectedRegions} onChange={(e) => setSelectedRegions(e.value)} options={citiesList} 
        filter metaKeySelection={false} className="w-full" selectionMode="checkbox" placeholder="Регион" showClear panelStyle={{width: 350}} />
        <div className='flex align-items-center justify-content-between mt-2'>
          <Button icon='pi pi-times' severity='danger' text rounded size='large' onClick={(e) => opnRegion.current.toggle(e)} />
          <Button icon='pi pi-check' severity='success' text rounded size='large' onClick={() => filterOfRegion()} />
        </div>
      </OverlayPanel>
      <OverlayPanel ref={opnTemplate} showCloseIcon style={{width:300}}>
        <div className="flex justify-content-center">
          Template
        </div>
      </OverlayPanel>
      <OverlayPanel ref={opnType} showCloseIcon style={{width:300}}>
        <div className="flex justify-content-center">
          Type
        </div>
      </OverlayPanel>
    </div>
  )
}
 