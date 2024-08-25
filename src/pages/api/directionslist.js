  const handler = async (req, res) => {
    const resp = await fetch('http://pbx.profpub.ru/api/directions/list-table', {
      method: 'POST',
      headers: {
        Cookie: 'ssid=s%3A-0UhK5iqdBfwDzRI9xsXXpuGGnpx30Q4.ggwVpv9GtimadFAoeQnSxn9m%2FcW6viR4ydzyOwz1GTI'
      },
      body: JSON.stringify({ skip: 0, limit: 10000, sort: {} })
    })
    const directions = await resp.json()

    res.json(directions)
  }
  
  export default handler
  