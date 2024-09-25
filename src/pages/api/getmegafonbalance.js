const handler = async (req, res) => {
    const resp = await fetch('https://sm.megafon.ru/sm/client/balance?login=' + req.body.login + '&password=' + req.body.password, {
        headers: {
          Cookie: 'BIGipServerMultifon_sm-80=2165248966.20480.0000'
        }
      })
    const response = await resp.text()
    res.send(response)
  }
  
  export default handler
  