import React from 'react'
import Nav from '../components/nav'

const Layout = ({ children, p2p }) => {
  return (
    <div>
      <Nav />
      <main>
        <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            <div className='border-4 border-dashed border-gray-200 rounded-lg h-96'>{children}</div>
          </div>
        </div>
      </main>
      <aside className='border-2 border-gray-200 rounded-lg h-8 w-8'></aside>
    </div>
  )
}

export default Layout
