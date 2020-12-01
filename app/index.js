import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { ipcRenderer } from 'electron'
import { app } from '@electron/remote'
import { generatePassphrase, passphraseToBytes } from 'niceware'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import './index.css'

import DriveManager from './hyper'
import Layout from './containers/layout'
import Home from './components/home'
import InputSeed from './components/inputSeed'
import { LocalKeyContext } from './lib/context'

const APP_NAME = 'geut-dato'
const HOME_DIR = app.getPath('home')

const Container = ({ children, local }) => {
  console.log({ local })
  return (
    <LocalKeyContext.Provider value={{ localKey: local }}>
      <Router>
        <DndProvider backend={HTML5Backend}>
          <Layout>{children}</Layout>
        </DndProvider>
      </Router>
    </LocalKeyContext.Provider>
  )
}

const App = () => {
  const [showSeedInput, setShowSeedInput] = useState()
  const [seedInput, setSeedInput] = useState()
  const [manager, setManager] = useState(null)
  const [myDrive, setMyDrive] = useState(null)

  // add dialog for entering a seedkey if no seedkey on getStoreValue
  useEffect(() => {
    ;(async () => {
      const hasSeed = await ipcRenderer.invoke('getStoreValue', 'hasSeed')
      setShowSeedInput(!hasSeed)
      if (hasSeed) {
        const userSeed = await ipcRenderer.invoke('getStoreValue', 'userSeed')
        console.log({ userSeed })
        setSeedInput(userSeed)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!seedInput) return
      console.log('THE SEEDINPUT: ', seedInput)
      const m = new DriveManager({
        appName: APP_NAME,
        seedKey: passphraseToBytes(seedInput),
        homeDir: HOME_DIR,
      })
      await m.init()
      const drive = await m.getDrive()

      setManager(m)
      setMyDrive(drive)
    })()
  }, [seedInput])

  if (showSeedInput) {
    const userPhrase = generatePassphrase(32)
    return (
      <Layout>
        <InputSeed
          seed={userPhrase}
          setSeedInput={setSeedInput}
          onClose={() => setShowSeedInput(false)}
        />
      </Layout>
    )
  }

  if (manager && myDrive) {
    console.log({ myDrive })
    return (
      <Container local={myDrive.key.toString('hex')}>
        <Switch>
          <Route path='/' exact>
            <Home manager={manager} myDrive={myDrive} />
          </Route>
        </Switch>
      </Container>
    )
  }

  return <h1>Loading...</h1>
}

ReactDOM.render(<App />, document.getElementById('root'))
