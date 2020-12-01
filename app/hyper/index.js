import { join, basename, posix } from 'path'
import { createReadStream, promises as fs } from 'fs'

import { keyPair } from 'hypercore-protocol'
import Corestore from 'corestore'
import Networker from '@corestore/networker'
import Hyperdrive from '@geut/hyperdrive-promise'
import RAF from 'random-access-file'
import dft from 'diff-file-tree'
import { isText } from 'istextorbinary'
import pump from 'pump'

const DEFAULT_OPTS = {
  applicationName: 'geut-dato',
  sparse: true,
  preferredPort: 42777,
}

class DriveManager {
  constructor(opts = {}) {
    this.opts = {
      ...DEFAULT_OPTS,
      ...opts,
    }

    console.log({ opts: this.opts })

    if (!this.opts.homeDir) {
      throw new Error('missing params: homeDir')
    }
    if (!this.opts.appName) {
      throw new Error('missing params: appName')
    }

    this.appDir = join(this.opts.homeDir, this.opts.appName)
    this.ready = false
    this.drives = new Map()
  }

  async init() {
    if (this.ready) return

    const storageFn = (file) => RAF(join(this.appDir, file))
    this.store = new Corestore(storageFn, {
      masterKey: this.opts.seedKey,
      sparse: this.opts.sparse,
    })
    this.store.ready()

    const noiseSeed = await this.deriveSecret(this.opts.applicationName, 'replication-keypair')
    this.keyPair = keyPair(noiseSeed)

    this.networker = new Networker(this.store, {
      keyPair: this.keyPair,
      preferredPort: this.opts.preferredPort,
    })

    this.ready = true
  }

  async deriveSecret(namespace, name) {
    return this.store.inner._deriveSecret(namespace, name)
  }

  async getDrive(key, seedOpts = { lookup: true, announce: true }) {
    // get or create
    let drive = this.drives.get(key)
    if (!drive) {
      drive = Hyperdrive(this.store)
      await drive.ready()
      if (drive.writable) {
        this.localDrive = drive
        // create index json
        await drive.writeFile(
          'index.json',
          JSON.stringify({
            title: 'My Dato Drive',
            description: 'dato drive',
          })
        )
        console.log('index.json created')
      }
      this.drives.set(key, drive)
      this.networker.configure(drive.discoveryKey, seedOpts)
    }
    return drive
  }

  async syncDrive(key, files) {
    if (!this.ready) {
      throw new Error('Drive manager needs to be initialized first: call manager.init()')
    }

    const drive = await this.getDrive(key)

    if (!drive.writable) {
      throw new Error('drive is not writable')
    }

    const syncFiles = async (files = [], tmpHyperPath = { 0: '/' }, level = 0) => {
      const getPath = (hyperPath) => posix.join(...Object.values(hyperPath))

      for (const file of files) {
        // check file
        const statFile = await fs.stat(file.path ? file.path : join(...fsPath, file))
        const name = file.name ? basename(file.name) : file

        if (statFile.isDirectory()) {
          console.log({ file })
          try {
            const statDir = await drive.stat(name)
            // TODO: ask for replace confirmation
            throw new Error('file already exists')
          } catch (_) {
            // create dir
            level++
            tmpHyperPath[level] = name
            await drive.mkdir(getPath(tmpHyperPath))
            const newFiles = await fs.readdir(file.path)

            const newMappedFiles = newFiles.map((item) => ({
              name: item,
              path: join(file.path, item),
            }))

            await syncFiles(newMappedFiles, tmpHyperPath, level)
          }
        } else {
          // copy file with streams!
          const encoding = isText(file.path) ? 'utf8' : 'binary'
          const readable = createReadStream(file.path, { encoding })
          const writable = drive.createWriteStream(posix.join(getPath(tmpHyperPath), name), {
            encoding,
          })
          await new Promise((resolve, reject) => {
            pump(readable, writable, (err) => {
              if (err) {
                return reject(err)
              }
              return resolve()
            })
          })
        }
      }
    }
    await syncFiles(files)
  }
}

export default DriveManager
