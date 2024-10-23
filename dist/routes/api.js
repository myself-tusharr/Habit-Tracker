const express = require('express')
const sqlite = require('sqlite3').verbose()
const add_entry = require('./insert')
const get_entry = require('./get')
const streak = require('./streak')

const router = express.Router()

router.use('/add-entry', add_entry)
router.use('/get-entry', get_entry)
router.use('/streak', streak)

router.use('/create-table', (req, res, next) => {
    const db = new sqlite.Database('./database.db', (err) => {
        if(err) {
            console.log(`Error connecting database : ${err}`)
        }
    })
    const query = `CREATE TABLE track (sr INTEGER PRIMARY KEY AUTOINCREMENT, date DATE NOT NULL UNIQUE, success BOOLEAN NOT NULL, date_entry DATE NOT NULL);`
    db.run(query, (err) => {
        if(err){
            console.log(`${err}`)
            res.end()
        }else{
            console.log('Table created successfully')
            res.end()
        }
    })
})

router.use('/delete-table', (req, res, next) => {
    const db = new sqlite.Database('./database.db', (err) => {
        if(err) {
            console.log(`Error connecting database : ${err}`)
        }
    })
    const query = `DROP TABLE track`
    db.run(query, (err) => {
        if(err){
            console.log(`${err} and continued......!\n`)
            res.end()
        }else{
            console.log("Table deleted.......!\n")
            res.end()
        }
    })
})

module.exports = router