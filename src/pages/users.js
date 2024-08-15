import { useEffect } from 'react'
import Head from 'next/head'
import useSWR, {useSWRConfig} from 'swr'
import { EventBus } from '../components/EventBus'
import useSWRImmutable from 'swr/immutable'
import { MainLayout } from '../components/MainLayout'
import { Fieldset } from 'primereact/fieldset'
import { Chip } from 'primereact/chip'
import { Button } from 'primereact/button'
import { Tooltip } from 'primereact/tooltip'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Users () {
  const { data: posts } = useSWRImmutable('/api/posts', fetcher)
  const { data: users } = useSWRImmutable('/api/users', fetcher)

  const { mutate } = useSWRConfig()

  useEffect(() => {
    EventBus.$on('addpost', () => console.log('Add Post'))
    return () => {EventBus.$off('addpost')}
  }, [])

  return (
    <>
      <Head>
        <title>Посты / Инструменты</title>
      </Head>
      <MainLayout title='Посты / Инструменты'>
        <main>
          <div className="mt-3">
            {posts && posts.map(post => {
              return (
                <div className="card mb-2" key={post._id}>
                  <Tooltip target=".custom-target-chip" />
                  <Fieldset legend={`Пост ${post.post_num}`} toggleable>
                    <div className="grid">
                      <div className="col-11 flex align-items-center">
                        {post.staff.map(item => {return users && users.map(user => {if (user._id == item) {return <Chip key={user._id} label={user.lastname ? user.lastname : user.user} removable className='custom-target-chip mx-1 cursor-pointer' onRemove={() => console.log('Remove!', user._id)} data-pr-tooltip={user.user} data-pr-position="top" />}})
                          }).sort((a, b) => a.label > b.label ? -1 : 1)}
                      </div>
                      <div className="col-1 flex align-items-center justify-content-center">
                        <Button icon='pi pi-plus' severity='success' rounded text size='large' onClick={() => closeContextMenu()} />
                        <Button icon='pi pi-times' severity='danger' rounded text size='large' onClick={() => closeContextMenu()} />
                      </div>
                    </div>
                  </Fieldset>
                </div>
              )
            })}
          </div>
        </main>
      </MainLayout>
    </>
  )
}
