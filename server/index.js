const express = require('express')
const api = require('./routes/api')

const app = express()
const port = 5000

//allowing cross origin access for independant development
//disable while production
const cors = require('cors')
app.use(cors())

app.use('/api', api)

app.get('/', (req, res) => {
    res.send("welcome to backend")
})

app.listen(port, () => {
    console.log(`Listenign backend at http://localhost:${port}`)
})