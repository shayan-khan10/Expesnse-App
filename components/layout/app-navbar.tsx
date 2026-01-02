"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { Separator } from "../ui/separator"
import { AppAvatar } from "./app-avatar"
import { navigation, settings } from "./items"

export function AppNavbar() {

  const pathname = usePathname()
  const allItems = [...navigation, ...settings]
  const activeItem = allItems.find((item) =>
    item.url === "/"
      ? pathname === "/"
      : pathname === item.url || pathname.startsWith(`${item.url}/`)
  )

  return (
    <header className="flex h-(--header-height) m-2 shrink-0 items-center gap-2 border rounded-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-bold">{activeItem?.title}</h1>
        <div className="ml-auto flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
            orientation="vertical"
            className="data-[orientation=vertical]"
            />
            <ModeToggle />
            <Separator
            orientation="vertical"
            className="mr-1 data-[orientation=vertical]"
            />
            <AppAvatar />
        </div>
      </div>
    </header>
  )
}
