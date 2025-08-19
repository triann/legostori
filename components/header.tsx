"use client"

import type React from "react"

import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { products } from "@/app/product/[id]/page"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("")
  const [sidebarSearchResults, setSidebarSearchResults] = useState<any[]>([])
  const [showSidebarSearchResults, setShowSidebarSearchResults] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  const performSearch = (query: string) => {
    const results = Object.values(products).filter(
      (product: any) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()),
    )
    setSearchResults(results)
    setShowSearchResults(true)
    console.log("Search results:", results)
  }

  const performSidebarSearch = (query: string) => {
    const results = Object.values(products).filter(
      (product: any) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()),
    )
    setSidebarSearchResults(results)
    setShowSidebarSearchResults(true)
    console.log("Sidebar search results:", results)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim().length >= 2) {
      performSearch(value)
    } else {
      setShowSearchResults(false)
      setSearchResults([])
    }
  }

  const handleSidebarSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSidebarSearchQuery(value)

    if (value.trim().length >= 2) {
      performSidebarSearch(value)
    } else {
      setShowSidebarSearchResults(false)
      setSidebarSearchResults([])
    }
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false)
    }

    if (showSearchResults) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showSearchResults])

  return (
    <>
      <div className="bg-blue-600 text-white text-center py-2 text-xs md:text-sm">
        <div className="flex items-center justify-center gap-2 px-2">
          <span className="text-center">O Quebra-Cabeça Lego está no ar!</span>
          <button className="underline hidden md:inline">Saiba mais</button>
        </div>
      </div>

      <header className="bg-yellow-400 border-b border-yellow-500 relative z-50">
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
                <Link href="/categoria/harrypotter">
                  <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                    HARRY POTTER
                  </Button>
                </Link>
                <Link href="/categoria/disney">
                  <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                    DISNEY
                  </Button>
                </Link>
                <Link href="/categoria/marvel">
                  <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                    MARVEL
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-black"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                <Search className="w-5 h-5" />
              </Button>

              <div className="relative hidden md:block">
                <form onSubmit={handleSearch} onClick={(e) => e.stopPropagation()}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-10 w-60 lg:w-80 bg-white border-gray-300"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </form>

                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-96 overflow-y-auto z-50 mt-1">
                    {searchResults.length > 0 ? (
                      <div className="p-2">
                        <div className="text-sm text-gray-600 mb-2 px-2">
                          {searchResults.length} produto(s) encontrado(s)
                        </div>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
                            onClick={() => {
                              setShowSearchResults(false)
                              setSearchQuery("")
                            }}
                          >
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-black">{product.name}</div>
                              <div className="text-sm text-gray-600">
                                R$ {product.price.toFixed(2).replace(".", ",")}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">Nenhum produto encontrado</div>
                    )}
                  </div>
                )}
              </div>

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

          {isMobileSearchOpen && (
            <div className="md:hidden py-3 border-t border-yellow-500">
              <div className="relative">
                <form onSubmit={handleSearch}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    placeholder="Buscar produtos..."
                    className="pl-10 w-full bg-white border-gray-300"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
                  />
                </form>

                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-64 overflow-y-auto z-50 mt-1">
                    {searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
                            onClick={() => {
                              setShowSearchResults(false)
                              setSearchQuery("")
                              setIsMobileSearchOpen(false)
                            }}
                          >
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-black">{product.name}</div>
                              <div className="text-sm text-gray-600">
                                R$ {product.price.toFixed(2).replace(".", ",")}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">Nenhum produto encontrado</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-yellow-400 z-50 transform transition-transform duration-300 ease-in-out md:hidden border-r-4 border-red-600 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">MENU</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-black hover:bg-yellow-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex flex-col gap-4">
            <Link href="/categoria/novos" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-black font-semibold hover:bg-yellow-300 text-lg py-6 border border-black rounded-lg"
              >
                NOVOS
              </Button>
            </Link>
            <Link href="/categoria/harrypotter" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-black font-semibold hover:bg-yellow-300 text-lg py-6 border border-black rounded-lg"
              >
                HARRY POTTER
              </Button>
            </Link>
            <Link href="/categoria/disney" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-black font-semibold hover:bg-yellow-300 text-lg py-6 border border-black rounded-lg"
              >
                DISNEY
              </Button>
            </Link>
            <Link href="/categoria/marvel" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-black font-semibold hover:bg-yellow-300 text-lg py-6 border border-black rounded-lg"
              >
                MARVEL
              </Button>
            </Link>
            <Link href="/categoria/icons" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-black font-semibold hover:bg-yellow-300 text-lg py-6 border border-black rounded-lg"
              >
                ICONS
              </Button>
            </Link>
            <Link href="/categoria/classic" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-black font-semibold hover:bg-yellow-300 text-lg py-6 border border-black rounded-lg"
              >
                CLASSIC
              </Button>
            </Link>
            <Link href="/categoria/botanicals" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-black font-semibold hover:bg-yellow-300 text-lg py-6 border border-black rounded-lg"
              >
                BOTANICALS
              </Button>
            </Link>
          </nav>

          <div className="mt-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-10 w-full bg-white border-2 border-black rounded-lg"
                value={sidebarSearchQuery}
                onChange={handleSidebarSearchChange}
              />

              {showSidebarSearchResults && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-black rounded-b-lg shadow-lg max-h-64 overflow-y-auto z-50 mt-1">
                  {sidebarSearchResults.length > 0 ? (
                    <div className="p-2">
                      <div className="text-sm text-gray-600 mb-2 px-2">
                        {sidebarSearchResults.length} produto(s) encontrado(s)
                      </div>
                      {sidebarSearchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
                          onClick={() => {
                            setShowSidebarSearchResults(false)
                            setSidebarSearchQuery("")
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-black">{product.name}</div>
                            <div className="text-sm text-gray-600">R$ {product.price.toFixed(2).replace(".", ",")}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">Nenhum produto encontrado</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
