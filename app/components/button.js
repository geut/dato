import React from 'react'
import classNames from 'classnames'

export const ButtonIcon = ({ children }) => <span className='w-4 h-4'>{children}</span>

export const Button = ({ children, onClick, text, classes = {} }) => {
  const buttonStyles = classNames(
    [
      'bg-transparent',
      'hover:bg-gray-200',
      'border',
      'text-grey-700',
      'font-bold',
      'py-2',
      'px-4',
      'rounded inline-flex',
      'items-center',
      'cursor-pointer',
    ],
    classes
  )

  return (
    <button className={buttonStyles} onClick={onClick}>
      {children}
      {text ? <span className='ml-2'>{text}</span> : ''}
    </button>
  )
}
