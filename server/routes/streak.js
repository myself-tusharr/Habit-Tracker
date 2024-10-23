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

router.get('/current', (req, res) => {
    const query = `WITH track_plus AS (SELECT *, CASE WHEN julianday(LAG(date) OVER (ORDER BY date DESC)) - julianday(date) IS NULL THEN TRUE WHEN julianday(LAG(date) OVER (ORDER BY date DESC)) - julianday(date) = 1 THEN TRUE  ELSE FALSE END AS continuous FROM track),
    track_pro AS (SELECT *, ROW_NUMBER() OVER (ORDER BY date DESC) AS by_date, ROW_NUMBER() OVER (PARTITION BY continuous ORDER BY date DESC) AS by_continuity, ROW_NUMBER() OVER (PARTITION BY success ORDER BY date DESC) AS by_success FROM track_plus)
    SELECT COUNT(*) AS streak FROM track_pro WHERE by_continuity = by_date AND by_date = by_success AND success = 1`
    req.db.get(query, (err, row) => {
        if (err) {
            console.log(`Error fetching data ${err}`)
            res.status(500).send("Internal error")
        } else if (row) {
            res.json(row)
        } else {
            res.status(404).send("No entries found")
        }
    })
})

module.exports = router
