const express = require('express')
const api = require('./routes/api')
const path = require('path')

const app = express()
const port = process.env.PORT || 5001

app.use('/api', api)
app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res, next) => {
    const time = new Date()
    console.log("Request Recieved on : ", time)
    next()
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(port, () => {
    console.log(`Listenign dist at http://localhost:${port}`)
})
