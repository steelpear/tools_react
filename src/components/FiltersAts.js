import {useState, useRef} from 'react'
import {useSWRConfig} from 'swr'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { InputSwitch } from 'primereact/inputswitch'
import { Button } from 'primereact/button'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export const FiltersAts = ({...params}) => {
  const opnPost = useRef(null)
  const filterMenu = useRef(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedGroups, setSelectedGroups] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [forced, setForced] = useState(false)
  const routes = [
    {label: 'Параллельная', value: 'parallel'},
    {label: 'Карусель', value: 'roundRobin'}]

  const { mutate } = useSWRConfig()

  const openPostFilterPanel = (e) => {
    opnPost.current.toggle(e)
  }

  return (
    <div className="card flex align-items-center">
      <Dropdown value={selectedGroup} onChange={(e) => setSelectedGroup(e.value)} options={params.operatorgroups} optionLabel="name" optionValue="_id" showClear placeholder="Фильтр" className="w-full md:w-12rem" />
      <div className="flex align-items-center">
        <Dropdown value={selectedRoute} onChange={(e) => setSelectedRoute(e.value)} options={routes} optionLabel="label" optionValue="value" showClear placeholder="Маршрут" className="w-full md:w-11rem ml-2" />
        <MultiSelect value={selectedGroups} onChange={(e) => setSelectedGroups(e.value)} options={params.operatorgroups} optionLabel="name" optionValue="_id" showSelectAll={false} maxSelectedLabels={2} selectedItemsLabel={`Выбрано ${selectedGroups && selectedGroups.length > 1 ? selectedGroups.length : ''}`} showClear placeholder="Группы" className="w-full md:w-11rem ml-2" />
        <InputSwitch checked={forced} onChange={(e) => setForced(e.value)} className="ml-2" aria-haspopup tooltip="Принудительная маршрутизация" tooltipOptions={{position: 'top'}} />
        <Button icon="pi pi-forward" rounded text severity="info" size='large' onClick={() => resetFilters()} aria-haspopup tooltip="Пакетная обработка" tooltipOptions={{position: 'top'}} />
      </div>
    </div>
  )
}
 