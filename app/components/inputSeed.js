import React, { useState, useRef } from 'react'
import { ipcRenderer } from 'electron'

const ModalTitle = ({ title }) => {
  return (
    <div className='flex justify-between items-center pb-3'>
      <p className='text-2xl font-bold'>{title}</p>
      <div className='modal-close cursor-pointer z-50'>
        <svg
          className='fill-current text-black'
          xmlns='http://www.w3.org/2000/svg'
          width='18'
          height='18'
          viewBox='0 0 18 18'
        >
          <path d='M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z'></path>
        </svg>
      </div>
    </div>
  )
}

const ModalBody = ({ children }) => {
  return <div className='my-5'>{children}</div>
}

const ModalAction = ({ onCancel, onConfirm }) => {
  return (
    <div className='flex justify-end pt-2'>
      <button
        className='focus:outline-none px-4 bg-blue-400 hover:bg-blue-dark text-white font-bold p-3 ml-3 rounded-lg'
        onClick={onConfirm}
      >
        Confirm the seed
      </button>
    </div>
  )
}

const TextArea = ({ label, initial, onKeyPress, customRef }) => {
  return (
    <div class='relative w-full appearance-none label-floating'>
      <textarea
        ref={customRef}
        class='autoexpand tracking-wide py-2 px-4 mb-3 leading-relaxed appearance-none block w-full bg-gray-200 border border-gray-200 rounded focus:outline-none focus:bg-white focus:border-gray-500'
        id='textarea'
        type='text'
        defaultValue={initial.join(' ')}
        onKeyPress={onKeyPress}
      ></textarea>
      <label
        htmlFor='textarea'
        class='absolute tracking-wide py-2 px-4 mb-4 opacity-0 leading-tight block top-0 left-0 cursor-text'
      >
        {label}
      </label>
    </div>
  )
}

const InputSeed = ({ seed, setSeedInput, onClose }) => {
  const textareaEl = useRef(null)

  const submitSeed = async (e) => {
    e.preventDefault()
    const currentSeed =
      textareaEl.current && textareaEl.current.value ? textareaEl.current.value : seed

    const currentSeedArr = Array.isArray(currentSeed) ? currentSeed : currentSeed.split(' ')
    console.log({ currentSeedArr })
    await ipcRenderer.invoke('setStoreValue', 'hasSeed', true)
    await ipcRenderer.invoke('setStoreValue', 'userSeed', currentSeedArr)
    setSeedInput(currentSeedArr)
    onClose()
  }

  return (
    <div className='main-modal fixed w-full h-100 inset-0 z-50 overflow-hidden flex justify-center items-center animated fadeIn faster'>
      <div className='border border-teal-500 shadow-lg modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto'>
        <div className='modal-content py-4 text-left px-6'>
          <ModalTitle title='Seed Key Generator' />
          <ModalBody>
            <p>
              Hey, we just generate a seed key for you. Just copy it and keep it in a safe place{' '}
            </p>
            <p>
              If you need to regenerate your <em>dato</em>, just enter the same seed key.{' '}
            </p>
          </ModalBody>
          <TextArea label={'Your seed key'} initial={seed} customRef={textareaEl} />
          <ModalAction onConfirm={submitSeed} />
        </div>
      </div>
    </div>
  )
}

export default InputSeed
