import React, { useContext, useState, useEffect, useCallback } from 'react'

import { NativeTypes } from 'react-dnd-html5-backend'
import { useDrop } from 'react-dnd'

import { LocalKeyContext } from '../lib/context'

const Home = ({ manager, myDrive }) => {
  const { localKey } = useContext(LocalKeyContext)
  const [fileList, setFileList] = useState([])

  const [collectedProps, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop(item, monitor) {
      const files = monitor.getItem().files
      console.log({ files })

      const updateLocalDrive = (files) => {
        const update = async () => {
          await manager.syncDrive(localKey, files)
        }

        update()
      }

      updateLocalDrive(files)

      setFileList(fileList.concat(files))
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  useEffect(() => {
    ;(async () => {
      // update my drive
    })()
  }, [fileList])

  useEffect(() => {
    ;(async () => {
      if (!myDrive) return
      const l = await myDrive.readdir('/')
      console.log({ l })
      setFileList(l)
    })()
  }, [myDrive])

  return (
    <div ref={drop}>
      <h2> Drag your files here :) </h2>
      <hr />
      <ul>
        {fileList.map((item, idx) => (
          <li key={`file-list-${idx}`}>
            <pre> - {item.name ? item.name : item} </pre>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Home
