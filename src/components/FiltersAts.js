import {useState, useRef} from 'react'
import {useSWRConfig} from 'swr'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { TriStateCheckbox } from 'primereact/tristatecheckbox'
import { Button } from 'primereact/button'
import { Loader } from '../components/Loader'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const FiltersAts = ({...params}) => {
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedGroups, setSelectedGroups] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [selectedQueue, setSelectedQueue] = useState(null)
  const [forced, setForced] = useState(null)
  const [isMut, setIsMut] = useState(false)
  const routes = [
    {label: 'Параллель', value: 'parallel', icon: 'pi pi-pause'},
    {label: 'Карусель', value: 'roundRobin', icon: 'pi pi-refresh'}]

  const { mutate } = useSWRConfig()

  const filterOfGroup = async (e) => {
    if (e.value) {
      setIsMut(true)
      await mutate('/api/dir', fetcher('/api/dir', {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({mode: 'filter', data: e.value})
      }), {revalidate: false, revalidateOnFocus: false})
      setIsMut(false)
    }
  }

  const selectedGroupFilter = (e) => {
    setSelectedGroup(e.value)
    filterOfGroup(e)
  }

  const selectedGroupTemplate = (option, props) => {
    if (option) return <div className='text-sm'>{option.name}</div>
    return <span className='text-sm'>{props.placeholder}</span>
  }

  const itemGroupsTemplate = (option) => {
    return <div className='text-sm'>{option.name}</div>
  }

  const selectedGroupsTemplate = (option) => {
    if (option) return <div className='text-sm'>{option.name}</div>
    return <span className='text-sm'>Группы</span>
  }

  const selectedRouteTemplate = (option, props) => {
    if (option) return <div className='text-sm'>{option.label}</div>
    return <span className='text-sm'>{props.placeholder}</span>
  }

  const selectedQueueTemplate = (option, props) => {
    if (option) return <div className='text-sm'>{option.name}</div>
    return <span className='text-sm'>{props.placeholder}</span>
  }

  const routeOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center py-0">
          <i className={`${option.icon} pt-1`} />
          <div className='text-sm pl-2'>{option.label}</div>
      </div>
    )
  }

  const groupOptionTemplate = (option) => {
    return <div className='text-sm py-0'>{option.name}</div>
  }

  const queueOptionTemplate = (option) => {
    return <div className='text-sm py-0'>{option.name}</div>
  }

  return (
    <div className="card flex align-items-center ml-1">
      <Dropdown value={selectedGroup} onChange={(e) => selectedGroupFilter(e)} options={params.operatorgroups} optionLabel="name" optionValue="_id" showClear placeholder="Фильтр" valueTemplate={selectedGroupTemplate} itemTemplate={groupOptionTemplate} disabled={params.sel && params.sel.length > 0} className="w-full md:w-10rem" />
      {(params.sel && params.sel.length > 0) && <div className="flex align-items-center ml-2">
        <i className="pi pi-arrow-right" style={{ color: 'slateblue', fontSize: '1.3rem' }} />
        <Dropdown value={selectedRoute} onChange={(e) => setSelectedRoute(e.value)} options={routes} optionLabel="label" optionValue="value" showClear placeholder="Маршрут" valueTemplate={selectedRouteTemplate} itemTemplate={routeOptionTemplate} className="w-full md:w-10rem ml-1" />
        {selectedRoute == 'roundRobin' &&<Dropdown value={selectedQueue} onChange={(e) => setSelectedQueue(e.value)} options={params.queues} optionLabel="name" optionValue="_id" showClear placeholder="Очередь" valueTemplate={selectedQueueTemplate} itemTemplate={queueOptionTemplate} className="w-full md:w-10rem ml-2" />}
        <MultiSelect value={selectedGroups} onChange={(e) => setSelectedGroups(e.value)} options={params.operatorgroups} optionLabel="name" showSelectAll={false} maxSelectedLabels={2} selectedItemsLabel={`Выбрано ${selectedGroups && selectedGroups.length > 1 ? selectedGroups.length : ''}`} showClear placeholder="Группы" filter={false} selectedItemTemplate={selectedGroupsTemplate} itemTemplate={itemGroupsTemplate} className="w-full md:w-10rem ml-2" />
        <TriStateCheckbox value={forced} onChange={(e) => setForced(e.value)} className="ml-2" aria-haspopup tooltip="Принудительная маршрутизация" tooltipOptions={{position: 'top'}} />
        <Button icon="pi pi-forward" rounded text severity="info" size='large' onClick={() => resetFilters()} aria-haspopup tooltip="Пакетная обработка" tooltipOptions={{position: 'top'}} />
      </div>}
      {isMut && <Loader mutate={true} />}
    </div>
  )
}
 