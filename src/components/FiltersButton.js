import {useState, useRef} from 'react'
import {useSWRConfig} from 'swr'
import useSWRImmutable from 'swr/immutable'
import { Menu } from 'primereact/menu'
import { OverlayPanel } from 'primereact/overlaypanel'
import { MultiSelect } from 'primereact/multiselect'
import { TreeSelect } from 'primereact/treeselect'
import { Button } from 'primereact/button'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const FiltersButton = ({...params}) => {
  const opnRegion = useRef(null)
  const opnTemplate = useRef(null)
  const opnType = useRef(null)
  const filterMenu = useRef(null)
  const [citiesList, setCitiesList] = useState(null)
  const [selectedRegions, setSelectedRegions] = useState(null)
  const [selectedTypes, setSelectedTypes] = useState(null)
  const [selectedTemplates, setSelectedTemplates] = useState(null)
  const templates = Object.values(params.templates).filter(template => template !=='' && template !==null)

  const { mutate } = useSWRConfig()

  const { data: cities } = useSWRImmutable('/api/cities', fetcher)
  const { data: types } = useSWRImmutable('/api/types', fetcher)

  const getCitiesList = () => {
    const parents = cities.filter(item => item.level == 0)
    const childs = cities.filter(item => item.level == 1)
    const out = []
    parents.map((city, index) => {
      const chlds = childs.filter(child => child.parent == city._id)
      const chls = chlds.map((item, i) => {return {key: index + '-' + i, label: item.name, data: item._id}})
      out.push({key: index, label: city.name, data: city._id, children: chls})
    })
    setCitiesList(out)
  }

  const filterOfRegion = async (e) => {
    const citiesIds = []
    for (let key in selectedRegions) {
      if (selectedRegions.hasOwnProperty(key)) {
        citiesList.forEach(item => {
          item.children.forEach(item => {
            if (item.key == key) citiesIds.push(item.data)
          })
        })
      }
    }
    const filter = {city: {$in : citiesIds}}
    if (params.mode === 'PumaOn') { filter.puma = true }
    else if (params.mode === 'PumaOff') { filter.puma = false }
    await mutate('https://broniryem.ru/api/Tools/hotels', fetcher('https://broniryem.ru/api/Tools/hotels', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ filter })
    }), {revalidate: false})
    closeRegionFilterPanel(e)
  }

  const filterOfTypes = async (e) => {
    const filter = {type: {$in : await selectedTypes.map(item => item._id)}}
    if (params.mode === 'PumaOn') { filter.puma = true }
    else if (params.mode === 'PumaOff') { filter.puma = false }
    await mutate('https://broniryem.ru/api/Tools/hotels', fetcher('https://broniryem.ru/api/Tools/hotels', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ filter })
    }), {revalidate: false})
    closeTypeFilterPanel(e)
  }

  const filterOfTemplate = async (e) => {
    const filter = {sat_template: {$in:selectedTemplates}}
    if (params.mode === 'PumaOn') { filter.puma = true }
    else if (params.mode === 'PumaOff') { filter.puma = false }
    await mutate('https://broniryem.ru/api/Tools/hotels', fetcher('https://broniryem.ru/api/Tools/hotels', {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ filter })
    }), {revalidate: false})
    closeTemplateFilterPanel(e)
  }

  const openRegionFilterPanel = (e) => {
    getCitiesList()
    opnRegion.current.toggle(e)
  }

  const closeRegionFilterPanel = (e) => {
    opnRegion.current.toggle(e)
    setSelectedRegions('')
  }

  const closeTypeFilterPanel = (e) => {
    opnType.current.toggle(e)
    setSelectedTypes('')
  }

  const closeTemplateFilterPanel = (e) => {
    opnTemplate.current.toggle(e)
    setSelectedTemplates(null)
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
        filter metaKeySelection={false} className="w-full" selectionMode="checkbox" placeholder="Регион" resetFilterOnHide panelStyle={{width: 350}} />
        <div className='flex align-items-center justify-content-between mt-2'>
          <Button icon='pi pi-times' severity='danger' text rounded size='large' onClick={(e) => closeRegionFilterPanel(e)} />
          <Button icon='pi pi-check' severity='success' text rounded size='large' onClick={(e) => filterOfRegion(e)} />
        </div>
      </OverlayPanel>
      <OverlayPanel ref={opnTemplate} showCloseIcon style={{width:300}}>
        <MultiSelect value={selectedTemplates} onChange={(e) => setSelectedTemplates(e.value)} options={templates}  filter placeholder="Шаблон сателлита" className="w-full" />
        <div className='flex align-items-center justify-content-between mt-2'>
          <Button icon='pi pi-times' severity='danger' text rounded size='large' onClick={(e) => closeTemplateFilterPanel(e)} />
          <Button icon='pi pi-check' severity='success' text rounded size='large' onClick={(e) => filterOfTemplate(e)} />
        </div>
      </OverlayPanel>
      <OverlayPanel ref={opnType} showCloseIcon style={{width:300}}>
        <MultiSelect value={selectedTypes} onChange={(e) => setSelectedTypes(e.value)} options={types} optionLabel="name" filter placeholder="Тип объекта" className="w-full" />
        <div className='flex align-items-center justify-content-between mt-2'>
          <Button icon='pi pi-times' severity='danger' text rounded size='large' onClick={(e) => closeTypeFilterPanel(e)} />
          <Button icon='pi pi-check' severity='success' text rounded size='large' onClick={(e) => filterOfTypes(e)} />
        </div>
      </OverlayPanel>
    </div>
  )
}
 