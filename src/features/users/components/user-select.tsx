"use client"

import {
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Search,
} from "lucide-react"

import {
  Input,
} from "@/components/ui/input"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import {
  SelectOption,
} from "@/shared/ui/select-option/select-option"

import type {
  User,
} from "../types/user.types"

type Props = {

  value?:User

  items:User[]

  placeholder:string

  onChange:(
    user?:User
  )=>void

  disabled?:boolean

}

export function UserSelect({

  value,

  items,

  placeholder,

  onChange,

  disabled=false,

}:Props){

  const [open,setOpen]=
    useState(false)

  const [query,setQuery]=
    useState("")

  const inputRef=
    useRef<HTMLInputElement>(null)

  const filteredItems=
    useMemo(()=>{

      const search=
        query
          .trim()
          .toLowerCase()

      const source=

        search

          ? items.filter(
              user=>

                user.name
                  .toLowerCase()
                  .includes(search)
            )

          : items

      if(!value){

        return source

      }

      return [

        ...source.filter(
          user=>
            user.id===value.id
        ),

        ...source.filter(
          user=>
            user.id!==value.id
        ),

      ]

    },[
      items,
      query,
      value,
    ])

  const close=()=>{

    setOpen(false)

    setQuery("")

  }

  return(

    <Popover
      open={disabled?false:open}
      onOpenChange={nextOpen=>{

        if(disabled){
          return
        }

        setOpen(nextOpen)

        if(!nextOpen){

          setQuery("")

          return

        }

        requestAnimationFrame(()=>{

          inputRef.current?.focus()

        })

      }}
    >

      <PopoverTrigger asChild>

        <button
          type="button"
          disabled={disabled}
          className="flex w-full min-w-0 items-center disabled:cursor-not-allowed"
        >

          <DynamicBadge
            label={
              value?.name ??
              placeholder
            }
            color={
              value
                ? value.color
                : "#64748B"
            }
            icon={value?.icon}
            placeholder={!value}
            width="field"
            showChevron={!disabled}
            chevronOpen={open}
          />

        </button>

      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-72 border border-white/10 bg-[#101012] p-2"
      >

        <Command
          value={value?.name}
          className="bg-transparent"
        >

          <div className="sticky top-0 z-20 mb-2 flex items-center gap-2 bg-[#101012] px-2 pb-2">

            <Search
              size={14}
              className="text-white/35"
            />

            <Input
              ref={inputRef}
              value={query}
              onChange={event=>

                setQuery(
                  event.target.value
                )

              }
              placeholder="Buscar..."
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />

          </div>

          <CommandList
            className="max-h-64 overflow-y-auto erp-scrollbar"
          >

            <CommandEmpty>

              Sin resultados

            </CommandEmpty>

            <CommandGroup>

              {filteredItems.map(user=>(

                <SelectOption
                  key={user.id}
                  label={user.name}
                  icon={user.icon}
                  color={user.color}
                  selected={
                    value?.id===user.id
                  }
                  onSelect={()=>{

                    onChange(user)

                    close()

                  }}
                />

              ))}

            </CommandGroup>

          </CommandList>

        </Command>

      </PopoverContent>

    </Popover>

  )

}