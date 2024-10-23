import { useState, useRef, useEffect } from 'react'
import styles from './App.module.css'

const stringifyDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const App = () => {
  const [streak, setStreak] = useState("...")
  const [changed, setChanged] = useState(0)

  useEffect(() => {
    const url2 = `http://localhost:5000/api/streak/current`
    fetch(url2).then(res => {
      if (!res.ok) {
        throw new Error('Response not ok')
      }
      return res.json()
    }).then(data => {
      setStreak(data.streak)
    }).catch(err => {
      console.error(`Error fetching data ${err}`)
    })
  }, [changed])

  return (
    <>
      <div className={styles.topContainer}>
        <div className={styles.progressContainer}>
          <ProgressBar target={21} streak={streak} />
        </div>
        <div className={styles.streakContainer}>
          <div className={styles.fireIcon}>🔥</div>
          <div className={styles.streakCount}>{streak}</div>
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <Grid21 changed={changed} setChanged={setChanged} />
      </div>
    </>
  )
}

const Grid21 = ({ changed, setChanged }) => {
  const [trackData, setTrackData] = useState()
  const trackDates = useRef([])

  useEffect(() => {
    const todaysDate = new Date()
    const toDate = new Date(todaysDate.getTime() - 24*60*60*1000)
    const fromDate = new Date(toDate.getTime() - 20 * 24 * 60 * 60 * 1000)
    const toDateString = stringifyDate(toDate)
    const fromDateString = stringifyDate(fromDate)
    const trackedDates = [fromDateString]
    for (let i = 19; i >= 1; i--) {
      const date = new Date(toDate.getTime() - i * 24 * 60 * 60 * 1000)
      trackedDates.push(stringifyDate(date))
    }
    trackedDates.push(stringifyDate(toDate))

    const url1 = `http://localhost:5000/api/get-entry/${fromDateString}/${toDateString}`
    fetch(url1).then(res => {
      if (res.status == 404) {
        return {}
      }
      if (!res.ok) {
        throw new Error('Response not ok')
      }
      return res.json()
    }).then(data => {
      trackDates.current = trackedDates
      setTrackData(data)
    }).catch(err => {
      console.error(`Error fetching data ${err}`)
    })
  }, [changed])

  const handleClick = (i) => {
    const data = new URLSearchParams({
      date: trackDates.current[i], 
      success: 'TRUE'
    });
    
    fetch('http://localhost:5000/api/add-entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data.toString()
    }).then(res => {
      if (res.ok) {
        changed == 0 ? setChanged(1) : setChanged(0)
      }
    }).catch(error => console.error('Error:', error));
  }

  const handleRightClick = (e, i) => {
    e.preventDefault()
    
    const data = new URLSearchParams({
      date: trackDates.current[i], 
      success: 'FALSE'
    });
    
    fetch('http://localhost:5000/api/add-entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data.toString()
    }).then(res => {
      if (res.ok) {
        changed == 0 ? setChanged(1) : setChanged(0)
      }
    }).catch(error => console.error('Error:', error));
  }

  return (
    <>
      <div className={styles.gridContainer}>
        {trackDates.current.map((date, index) => (trackData[date] == null ? <div className={styles.gridItemStatusNull} key={index} onClick={() => { handleClick(index) }} onContextMenu={(e) => { handleRightClick(e, index) }}></div> : (trackData[date] == 0 ? <div className={styles.gridItemStatus0} key={index}></div> : <div className={styles.gridItemStatus1} key={index}></div>)))}
      </div>
    </>
  )
}

const ProgressBar = ({ target, streak }) => {
  const radius = 60
  const circum = 2 * Math.PI * radius
  const progress = isNaN(streak) ? 100 : (streak >= target ? 100 : streak * 100 / target)
  return (
    <>
      <svg className={styles.progressSvg} viewBox='25 25 150 150'>
        <circle className={styles.progressCircleBg} cx='100' cy='100' r='60' />
        <circle className={styles.progressCircleFg} cx='100' cy='100' r='60' strokeDashoffset={circum - progress * circum / 100} strokeDasharray={`${circum} ${circum}`} />
      </svg>
    </>
  )
}

export default App