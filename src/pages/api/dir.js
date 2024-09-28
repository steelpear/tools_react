const handler = async (req, res) => {
    const resp = await fetch('http://pbx.profpub.ru/api/directions/list-table', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Cookie: 'ssid=s%3A-0UhK5iqdBfwDzRI9xsXXpuGGnpx30Q4.ggwVpv9GtimadFAoeQnSxn9m%2FcW6viR4ydzyOwz1GTI'
      },
      body: JSON.stringify({ skip: 0, limit: 10000, sort: {} })
    })
    let response = await resp.json()
    if (req.body && req.body.mode === 'import') response = response.filter(item => req.body.data.includes(item._id))

    const prov = await fetch('http://pbx.profpub.ru/api/providers/list', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Cookie: 'ssid=s%3A-0UhK5iqdBfwDzRI9xsXXpuGGnpx30Q4.ggwVpv9GtimadFAoeQnSxn9m%2FcW6viR4ydzyOwz1GTI'
      },
      body: JSON.stringify({ skip: 0, limit: 100, sort: {} })
    })
    const providers = await prov.json()

    let directions = await response.map(item => {
      return (
        {
          _id: item._id,
          name: item.name,
          region: item.region,
          comment: item.comment,
          route: item.routeMethod,
          forced: item.forcedRouting,
          operators: item.operators.map(item => {
            return (
              {
                _id: item._id,
                lastname: item.lastName,
                auth: item.auth,
                location: item.location,
                active: item.active
              }
            )
          }),
          groups: item.operatorGroups.map(item => item.name),
          groups_ids: item.operatorGroups.map(item => item._id),
          trunks: (item.trunks && item.trunks.length > 0) ? item.trunks.map(item => {
            return (
              {
                code: item.code,
                _id: item.trunk && item.trunk._id,
                did: item.trunk && item.trunk.did,
                password: item.trunk && item.trunk.password,
                provider: item.trunk && providers.filter(el => el._id == item.trunk.provider).map(el => el.name).join(''),
                region: item.trunk && item.trunk.region,
                lastcall: item.trunk && item.trunk.lastCall
              }
            )
          }) : [],
          queue: item.queue
        }
      )
    })
    if (req.body && req.body.mode === 'filter') directions = directions.filter(item => item.groups_ids.includes(req.body.data))

    res.json(directions)
  }
  
  export default handler
  