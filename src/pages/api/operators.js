const handler = async (req, res) => {
    const filter = req.body.filter ? req.body.filter : {active: true}
    const resp = await fetch('http://pbx.profpub.ru/api/operators/list-table', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Cookie: 'ssid=s%3A-0UhK5iqdBfwDzRI9xsXXpuGGnpx30Q4.ggwVpv9GtimadFAoeQnSxn9m%2FcW6viR4ydzyOwz1GTI'
      },
      body: JSON.stringify({skip: 0, limit: 1000, filter, sort: {}})
    })
    const response = await resp.json()

    res.json(response)
  }
  
  export default handler
  