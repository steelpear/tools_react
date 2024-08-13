import Head from 'next/head'
import useSWR, {useSWRConfig} from 'swr'
import useSWRImmutable from 'swr/immutable'
import { MainLayout } from '../components/MainLayout'
import { Fieldset } from 'primereact/fieldset'
import { Chip } from 'primereact/chip'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Users () {
  const { data: posts } = useSWRImmutable('/api/posts', fetcher)
  const { data: users } = useSWRImmutable('/api/users', fetcher)

  const { mutate } = useSWRConfig()

  return (
    <>
      <Head>
        <title>Пользователи / Инструменты</title>
      </Head>
      <MainLayout title='Пользователи / Инструменты'>
        <main>
          <div className="mt-3">
            {posts && posts.map(post => {
              return <div className="card mb-2">
                <Fieldset legend={`Пост ${post.post_num}`}>
                  <p className="m-0">
                    {
                      post.staff.map(item => {return users && users.map(user => {if (user._id == item) {return <Chip label={user.lastname ? user.lastname : user.user} removable className='mx-1' onRemove={() => console.log('Remove!', user._id)} />}})
                      }).sort((a, b) => a.label > b.label ? -1 : 1)
                    }
                  </p>
                </Fieldset>
              </div>
            })}
          </div>
        </main>
      </MainLayout>
    </>
  )
}
