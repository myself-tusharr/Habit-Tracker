const express = require('express')
const sqlite = require('sqlite3').verbose()
const router = express.Router()

router.use((req, res, next) => {
    const db = new sqlite.Database('./database.db', (err) => {
        if(err){
            console.log(`Error connecting database : ${err}`)
            res.status(500).send("Internal Error")
        }else{
            req.db = db
            next()
        }
    })
})

router.get('/:date', (req, res) => {
    const query = `SELECT * FROM track WHERE date = ?`
    req.db.get(query, [req.params.date], (err, row) => {
        if (err) {
            console.log(`Error fetching data ${err}`)
            res.status(500).send("Internal error")
        } else if (row) {
            res.send(row.success.toString())
        } else {
            res.status(404).send("Entry not found")
        }
    })
})

router.get('/:from/:to', (req, res) => {
    const query = `SELECT date, success FROM track WHERE date BETWEEN ? AND ?`
    req.db.all(query, [req.params.from, req.params.to], (err, rows) => {
        if (err) {
            console.log(`Error fetching data ${err}`)
            res.status(500).send("Internal error")
        } else if (rows.length > 0) {
            const data = {}
            rows.forEach((row) => {
                data[row.date] = row.success
            })
            res.json(data)
        } else {
            res.status(404).send("No entries found")
        }
    })
})

module.exports = router
