const express = require('express')
const sqlite = require('sqlite3').verbose()
const router = express.Router()

router.use(express.urlencoded({ extended: true }))

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

router.use((req, res, next) => {
    req.dateObj = new Date(req.body.date)
    req.currentDate = new Date()
    req.currentYear = req.currentDate.getFullYear()
    req.currentMonth = String(req.currentDate.getMonth() + 1).padStart(2, '0')
    req.currentDay = String(req.currentDate.getDate()).padStart(2, '0')
    next()
})

const inputValidator = (req, res, next) => {
    if(req.body.success != 'FALSE' && req.body.success != 'TRUE'){
        res.status(400).send(`Invalid Input : ${req.body.success}`)
    }else{
        if(isNaN(req.dateObj.getTime())){
            res.status(400).send("Invalid Input : date")
        }else{
            next()
        }
    }
}

const dateRestrictor = (req, res, next) => {
    const timeDiff = req.currentDate.getTime() - req.dateObj.getTime()
    const daysDiff = timeDiff/(1000*60*60*24)
    if(daysDiff < 0){
        res.status(400).send("Cannot sign future days")
    } else if(daysDiff < 1){
        res.status(400).send("Cannot sign before end of the day")
    } else if(daysDiff > 15){
        res.status(400).send("Cannot sign 15 days later")
    } else {
        next()
    }

}

router.post('/', inputValidator, dateRestrictor, (req, res, next) => {
    const query = `INSERT INTO track (date, success, date_entry) VALUES ('${req.body.date}', ${req.body.success}, '${req.currentYear}-${req.currentMonth}-${req.currentDay}')`
    req.db.run(query, (err) => {
        if(err) {
            if(`${err}` == "Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: track.date"){
                res.status(400).send("Entry already exist")
            } else {
                console.log(`Error inserting entry : ${err}`)
                res.status(500).send("Internal Error")
            }
        } else {
            res.send("success")
        }
    })
})

module.exports = router