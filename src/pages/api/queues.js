const handler = async (req, res) => {
    const resp = await fetch('http://pbx.profpub.ru/api/queues/list-table', {
      method: 'POST',
      headers: {
        Cookie: 'ssid=s%3A-0UhK5iqdBfwDzRI9xsXXpuGGnpx30Q4.ggwVpv9GtimadFAoeQnSxn9m%2FcW6viR4ydzyOwz1GTI'
      },
      body: JSON.stringify({ skip: 0, limit: 100, sort: {} })
    })
    const response = await resp.json()

    res.json(response.map(item => {return ({name: item.name, _id: item._id})}))
  }
  
  export default handler
  