import {useState, useRef} from 'react'
import {useSWRConfig} from 'swr'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { InputSwitch } from 'primereact/inputswitch'
import { Button } from 'primereact/button'
import { Loader } from '../components/Loader'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const FiltersAts = ({...params}) => {
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedGroups, setSelectedGroups] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [forced, setForced] = useState(false)
  const [isMut, setIsMut] = useState(false)
  const routes = [
    {label: 'Параллельная', value: 'parallel'},
    {label: 'Карусель', value: 'roundRobin'}]

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
      setSelectedGroup(null)
    }
  }

  const selectedGroupFilter = (e) => {
    setSelectedGroup(e.value)
    filterOfGroup(e)
  }

  return (
    <div className="card flex align-items-center">
      <Dropdown value={selectedGroup} onChange={(e) => selectedGroupFilter(e)} options={params.operatorgroups} optionLabel="name" optionValue="_id" showClear placeholder="Фильтр" className="w-full md:w-12rem" />
      {(params.sel && params.sel.length > 0) &&<div className="flex align-items-center ml-2">
        <i className="pi pi-arrow-right" style={{ color: 'slateblue', fontSize: '1.3rem' }} />
        <Dropdown value={selectedRoute} onChange={(e) => setSelectedRoute(e.value)} options={routes} optionLabel="label" optionValue="value" showClear placeholder="Маршрут" className="w-full md:w-11rem ml-1" />
        <MultiSelect value={selectedGroups} onChange={(e) => setSelectedGroups(e.value)} options={params.operatorgroups} optionLabel="name" optionValue="_id" showSelectAll={false} maxSelectedLabels={2} selectedItemsLabel={`Выбрано ${selectedGroups && selectedGroups.length > 1 ? selectedGroups.length : ''}`} showClear placeholder="Группы" className="w-full md:w-11rem ml-2" />
        <InputSwitch checked={forced} onChange={(e) => setForced(e.value)} className="ml-2" aria-haspopup tooltip="Принудительная маршрутизация" tooltipOptions={{position: 'top'}} />
        <Button icon="pi pi-forward" rounded text severity="info" size='large' onClick={() => resetFilters()} aria-haspopup tooltip="Пакетная обработка" tooltipOptions={{position: 'top'}} />
      </div>}
      {isMut && <Loader mutate={true} />}
    </div>
  )
}
 