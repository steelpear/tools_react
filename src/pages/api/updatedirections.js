const handler = async (req, res) => {
    const resp = await fetch('http://pbx.profpub.ru/api/direction', {
      method: 'PUT',
      headers: {
        Cookie: 'ssid=s%3A-0UhK5iqdBfwDzRI9xsXXpuGGnpx30Q4.ggwVpv9GtimadFAoeQnSxn9m%2FcW6viR4ydzyOwz1GTI'
      },
      body: JSON.stringify(req.body.data)
    })
    const response = await resp.json()

    res.json(response)
  }
  
  export default handler
  