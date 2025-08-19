"use client"

import type React from "react"

import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log("Searching for:", searchQuery)
    }
  }

  return (
    <>
      <div className="bg-blue-600 text-white text-center py-2 text-xs md:text-sm">
        <div className="flex items-center justify-center gap-2 px-2">
          <span className="text-center">O Quebra-Cabeça Lego está no ar!</span>
          <button className="underline hidden md:inline">Saiba mais</button>
        </div>
      </div>

      <header className="bg-yellow-400 border-b border-yellow-500">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo e menu mobile */}
            <div className="flex items-center gap-2 md:gap-8">
              <Link href="/">
                <img
                  src="https://legobrasil.vtexassets.com/assets/vtex/assets-builder/legobrasil.dup-template/1.28.0/logo___40c43ea8a6afef0f36be240072a0e00d.png"
                  alt="LEGO"
                  className="h-8 md:h-10 w-auto cursor-pointer"
                />
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-black"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/categoria/novos">
                  <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                    NOVOS
                  </Button>
                </Link>
                <Link href="/categoria/exclusivos">
                  <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                    EXCLUSIVOS
                  </Button>
                </Link>
                <Link href="/categoria/ofertas">
                  <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                    OFERTAS
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-black"
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder="Buscar..."]') as HTMLInputElement
                  if (searchInput) {
                    searchInput.focus()
                  }
                }}
              >
                <Search className="w-5 h-5" />
              </Button>

              <form onSubmit={handleSearch} className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 w-60 lg:w-80 bg-white border-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Action buttons */}
              <Button variant="ghost" size="icon" className="text-black hover:bg-yellow-300">
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-black hover:bg-yellow-300 relative">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
                  0
                </span>
              </Button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden bg-yellow-400 border-t border-yellow-500 py-4">
              <nav className="flex flex-col gap-2">
                <Link href="/categoria/novos" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-black font-semibold hover:bg-yellow-300">
                    NOVOS
                  </Button>
                </Link>
                <Link href="/categoria/exclusivos" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-black font-semibold hover:bg-yellow-300">
                    EXCLUSIVOS
                  </Button>
                </Link>
                <Link href="/categoria/ofertas" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-black font-semibold hover:bg-yellow-300">
                    OFERTAS
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
