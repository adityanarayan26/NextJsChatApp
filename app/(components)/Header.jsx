'use client'
import { Sidebar } from 'lucide-react'
import React, { useEffect } from 'react'
import { Store } from './Store'
import { useSession } from 'next-auth/react'


const Header = () => {
  const { setIsSidebarOpen, isSidebaropen, SelectedUser, loadSelectedUser } = Store();

  useEffect(() => {
    loadSelectedUser();
  }, []);

  
  return (
    <div className='w-full h-24 bg-indigo-400 px-10 flex items-center justify-between'> 
<div className='gap-x-5 flex items-center'>
    <Sidebar  className='cursor-pointer' onClick={()=>setIsSidebarOpen(!isSidebaropen)}/>
<div className='flex items-center gap-x-2'>

<img src={SelectedUser?.image} alt=""  className='size-12 rounded-full'/>
<h1 className='text-black capitalize text-2xl '>{SelectedUser && SelectedUser?.name}</h1>
</div>
</div>
<div className='flex items-center gap-x-5 rounded bg-slate-500 p-3'> 
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer text-white  hover:text-blue-500/80" >
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
</svg>
<div className='w-[1px] h-6 bg-gray-400'></div>
<svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer text-white hover:text-blue-500/80">
  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

</div>
    </div>
  )
}

export default Header
