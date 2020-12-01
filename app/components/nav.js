import React, { useContext } from 'react'

import useClipboard from 'react-use-clipboard'
import { CubeIcon, DrawingPinIcon, DrawingPinSolidIcon } from '@modulz/radix-icons'
import { Button, ButtonIcon } from './button'
import { LocalKeyContext } from '../lib/context'

const Nav = () => {
  const { localKey } = useContext(LocalKeyContext)
  const [isCopied, setCopied] = useClipboard(localKey)

  return (
    <header className='bg-white shadow'>
      <nav className='flex justify-between w-full text-gray-900'>
        <div className='bg-black pb-2 pl-14 pr-4 pt-8'>
          <h1 className='text-2xl font-light text-gray-50 tracking-wider antialiased'>Dato</h1>
        </div>
        <div className='items-center w-full flex pb-2 pl-2 pr-4 pt-8'>
          <div className='mr-2 leading-none'>
            <Button text={localKey.substring(0, 6)} onClick={setCopied}>
              <ButtonIcon>
                <CubeIcon />
              </ButtonIcon>
            </Button>
          </div>
          <div className='mr-2 leading-none'>
            <Button>
              <ButtonIcon>
                <DrawingPinIcon />
              </ButtonIcon>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Nav
