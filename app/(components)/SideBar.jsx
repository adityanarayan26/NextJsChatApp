'use client'
import React, { useEffect, useRef } from 'react'
import { Seed } from './seed'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bolt, ChevronDown, ChevronsUpDownIcon, CopyPlus, Files, Layers2, LogOut, Send, User } from 'lucide-react';
import { Store } from './Store';
import { Dots_v1, Dots_v4 } from '@/components/ui/spinner';
import { useSession, signIn, signOut } from "next-auth/react"
import axios from 'axios';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
const SideBar = () => {
    const searchUserRef = useRef()
    const dialogCloseRef = useRef()
  const { data: session } = useSession()
const [UserList, setUserList] = React.useState([])
    const {isSidebaropen,setIsSidebarOpen,setSelectedUser}= Store()
    const [searchUser, setSearchUser] = React.useState('')
    const handleEnterClick = (e) => {
        if (e.key === 'Enter') {
            searchUserRef.current.click()
            setIsSidebarOpen(false)
        }
    }
const filteredUsers = UserList?.filter((user) =>
  user.name.toLowerCase().includes(searchUser.toLowerCase())
);
useEffect(() => {
  if (!session?.user?.id) return;

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/getUser', {
        params: { userId: session.user.id }
      });

      setUserList(response.data);
      console.log('response, user fetched', response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  fetchUsers();
}, [session?.user?.id]);

  return (
    <div className={`${ isSidebaropen ? " w-[25rem]" : "w-0" } overflow-hidden relative ease duration-300 h-full bg-neutral-200 flex flex-col  `}>

<div className='w-full flex items-center gap-2 p-2 bg-zinc-700'>

      <input
        type="text"
        value={searchUser}
        onChange={(e) => setSearchUser(e.target.value)}
        placeholder='Search user...'
        onKeyDown={handleEnterClick}
        className='flex-1 rounded bg-white/90 text-black border border-blue-400 text-sm p-2 outline-none'
      />
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" ref={searchUserRef} onClick={()=>setIsSidebarOpen(false)}>Search</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden">
        <ScrollArea className="flex max-h-full flex-col">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="px-6 py-3 bg-zinc-600 text-white flex items-center gap-2 justify-between">Searched Users 
                <input type="text" value={searchUser} onChange={(e)=>setSearchUser(e.target.value)} className='border border-blue-300 bg-white/50 rounded text-black px-2 py-1 shadow outline-none' placeholder='search for user...'/>
            </DialogTitle>
            <DialogDescription asChild className='h-[20rem]'>
              <div>
                {searchUser.trim() === '' ? (
                  <div className='flex items-center justify-center h-full text-blue-500'>

<div className="flex justify-center items-center h-full">
                    <p className="text-gray-500 text-lg">Search for user</p>
                  </div>

                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user?.email} onClick={()=>{setSelectedUser({ name: user.name, image: user.image }),dialogCloseRef.current.click(),setSearchUser('')}} className='flex items-center gap-3 p-3 hover:bg-blue-100 cursor-pointer rounded-lg transition'>
                      <div className='flex items-center gap-x-2'>
                      <img src={user.image} alt="user" className='w-10 h-10 rounded-full' />
                        <div className='flex flex-col'>

                        <h1 className='text-lg font-semibold'>{user.name}</h1>
                        <p className='text-sm text-gray-500'>{user.email}</p>
                        </div>
                      </div>
                      <Send className='size-5 text-blue-500'/>
                    </div>
                  ))
                ) : (
                  <div className='flex items-center justify-center h-full'>
                    <User className='w-10 h-10 text-gray-500' />
                    <p className='text-gray-500'>No users found</p>
                  </div>
                )  
                }
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogClose>
            <button className='hidden' ref={dialogCloseRef}></button>
          </DialogClose>
        </ScrollArea>
      </DialogContent>
    </Dialog>
</div>
      <div className='h-full w-full overflow-y-auto px-2 py-1 space-y-1'>
        {UserList.map((user) => (
            <div key={user?._id} onClick={()=>setSelectedUser({ name: user.name, image: user.image })} className='flex items-center gap-3 p-3 hover:bg-blue-200 cursor-pointer rounded-lg transition'>
                <img src={user?.image} alt="user" className='w-10 h-10 rounded-full' />
                <div>
                <h1 className='text-lg font-semibold'>{user?.name}</h1>
                <p className='text-sm text-gray-500'>{user?.email}</p>
                </div>
            </div>
        ))}
      </div>
      <div className='w-full h-fit py-4 px-4 bg-zinc-800 text-white'>
        <div className='flex items-center gap-3'>
         
              <DropdownMenu>
      <DropdownMenuTrigger asChild>
         <div className='flex items-center gap-2 px-2 cursor-pointer'>

            {session?.user?.image && (
              <img src={session?.user.image} alt="user" className='w-10 h-10 rounded-full' />
            )}
            <div>
                <h1 className='text-lg font-semibold'>{session?.user?.name}</h1>
                <p className='text-sm text-gray-300'>{session?.user?.email}</p>
        
            <ChevronsUpDownIcon className='size-5 text-white'/>
            </div>
            </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
       
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          
          <DropdownMenuItem className="text-destructive focus:text-destructive">

           <button onClick={()=>signOut()} className=' cursor-pointer flex items-center gap-2   ease duration-200'>
            <LogOut className='size-5 text-red-500' />
            <p className='text-md font-semibold'>Logout</p>
        </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
           
        </div>
        
      </div>
    </div>
  )
}

export default SideBar
