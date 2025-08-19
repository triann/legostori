"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"
import Link from "next/link"

const categories = [
  {
    name: "Novos",
    color: "bg-amber-600",
    image:
      "https://legobrasil.vtexassets.com/assets/vtex.file-manager-graphql/images/4feeb981-fba7-46b5-8b9d-72991831c64d___433bd283e0146251ce864d0b90e9039b.jpg",
    href: "/categoria/novos", // adicionando navegação para página específica
  },
  {
    name: "Harry Potter",
    color: "bg-purple-600",
    image:
      "https://legobrasil.vtexassets.com/arquivos/Updated-Home-AdvQuicklink-202504-HarryPotter.jpg",
    href: "/categoria/harrypotter", // adicionando navegação para página específica
  },
  {
    name: "Disney",
    color: "bg-red-600",
    image: "https://legobrasil.vtexassets.com/arquivos/Updated-Home-AdvQuicklink-202504-Disney.jpg",
    href: "/categoria/disney",
  }, // adicionando navegação
  {
    name: "Marvel",
    color: "bg-red-700",
    image: "https://legobrasil.vtexassets.com/arquivos/Updated-Home-AdvQuicklink-202504-Marvel.jpg?v=2",
    href: "/categoria/marvel",
  }, // adicionando navegação
  {
    name: "Icons",
    color: "bg-blue-600",
    image:
      "https://legobrasil.vtexassets.com/arquivos/Updated-Home-AdvQuicklink-202504-Icons-2.jpg",
    href: "/categoria/icons",
  }, // adicionando navegação
  {
    name: "Classic",
    color: "bg-green-600",
    image: "https://legobrasil.vtexassets.com/arquivos/Updated-Home-AdvQuicklink-202504-Classic.jpg",
    href: "/categoria/classic",
  }, // adicionando navegação
  {
    name: "Botanicals",
    color: "bg-teal-600",
    image: "https://legobrasil.vtexassets.com/arquivos/Updated-Home-AdvQuicklink-202504-Botanicals.jpg",
    href: "/categoria/botanicals",
  }, // adicionando navegação
]

const products = [
  {
    id: 1,
    name: "Disney - Mini Castelo da Disney",
    price: "R$ 329,99",
    originalPrice: null,
    rating: 4.8,
    reviews: 156,
    ages: "18+",
    pieces: 1456,
    image:
      "https://legobrasil.vtexassets.com/arquivos/ids/176770/lego_40478_Disney_Mini_Castelo_da_Disney_01.jpg?v=637732735262400000",
    isNew: true,
    href: "/product/1",
  },
  {
    id: 2,
    name: "Disney - Casa de Praia Lilo e Stitch",
    price: "R$ 899,99",
    originalPrice: null,
    rating: 4.9,
    reviews: 203,
    ages: "18+",
    pieces: 834,
    image: "https://legobrasil.vtexassets.com/arquivos/ids/188946/43268.jpg?v=638731528542870000",
    isNew: false,
    href: "/product/2",
  },
  {
    id: 3,
    name: "Mala de Viagem Amarela",
    price: "R$ 149,99",
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "7+",
    pieces: 184,
    image: "https://legobrasil.vtexassets.com/arquivos/ids/189242/40817.jpg?v=638768033043630000",
    isNew: false,
    href: "/product/3",
  },
  {
    id: 4,
    name: "Minecraft® - Ringue de luta da mansão Woodland",
    price: "R$ 479,99",
    originalPrice: null,
    rating: 4.8,
    reviews: 124,
    ages: "7+",
    pieces: 491,
    image: "https://legobrasil.vtexassets.com/arquivos/ids/189063/21272.jpg?v=638738549970430000",
    isNew: false,
    href: "/product/4",
  },
  {
    id: 5,
    name: "Speed Champions - Ferrari F40 Supercar",
    price: "R$ 249,99",
    originalPrice: null,
    rating: 4.9,
    reviews: 445,
    ages: "7+",
    pieces: 318,
    image: "https://legobrasil.vtexassets.com/arquivos/ids/187718/76934.jpg?v=638646997377600000",
    isNew: false,
    href: "/product/5",
  },
  {
    id: 6,
    name: "Harry Potter™ - Passeio de moto de Hagrid™ e Harr",
    price: "R$ 479,99",
    originalPrice: null,
    rating: 4.9,
    reviews: 445,
    ages: "7+",
    pieces: 617,
    image: "https://legobrasil.vtexassets.com/arquivos/ids/188029/76443.jpg?v=638689283624800000",
    isNew: false,
    href: "/product/6",
  },
  {
    id: 7,
    name: "Creator - Modelo 3 Em 1: Dinossauros Ferozes",
    price: "R$ 149,99",
    originalPrice: null,
    rating: 4.9,
    reviews: 445,
    ages: "7+",
    pieces: 174,
    image: "https://legobrasil.vtexassets.com/arquivos/ids/170220/31058_prod.jpg?v=637111671490100000",
    isNew: false,
    href: "/product/7",
  },
  {
    id: 8,
    name: "Ideas - Magia da Disney",
    price: "R$ 759,99",
    originalPrice: null,
    rating: 4.9,
    reviews: 445,
    ages: "7+",
    pieces: 1103,
    image: "https://legobrasil.vtexassets.com/arquivos/ids/187552/21352.jpg?v=638621859108970000",
    isNew: false,
    href: "/product/8",
  },
  {
    id: 9,
    name: "City - Avião de Passageiros",
    price: "R$ 799,99",
    originalPrice: null,
    rating: 4.9,
    reviews: 445,
    ages: "7+",
    pieces: 913,
    image:
      "https://legobrasil.vtexassets.com/arquivos/ids/184072/60367-lego-city-aviao-de-passageiros.jpg?v=638276417925400000",
    isNew: false,
    href: "/product/9",
  },
]

export function ProductGrid() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const categoriesScrollRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      {/* Category navigation */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 overflow-x-auto">
          <h2 className="text-base md:text-lg font-semibold whitespace-nowrap">Em Alta</h2>
          <span className="text-gray-500 text-sm md:text-base whitespace-nowrap">Temas</span>
          <span className="text-gray-500 text-sm md:text-base whitespace-nowrap">Idade</span>
        </div>

        <div
          ref={categoriesScrollRef}
          className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
          }}
        >
          {categories.map((category, index) => (
            <Link key={index} href={category.href}>
              <Card
                className={`cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0 w-24 md:w-32 relative overflow-hidden p-0 border-0`}
              >
                <div className="w-full" style={{ aspectRatio: "5/7" }}>
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                </div>
                <div className="absolute top-2 left-0 right-0 text-center">
                  <p className="text-white text-xs md:text-sm font-semibold drop-shadow-lg">{category.name}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Products section */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-8">Mais Vendidos </h2>

        <div className="relative w-full max-w-md mx-auto">
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => {
              let startX = e.touches[0].clientX
              let moved = false

              const handleTouchMove = (e: TouchEvent) => {
                moved = true
                const currentX = e.touches[0].clientX
                const diff = startX - currentX
                const threshold = 80

                if (Math.abs(diff) > threshold) {
                  if (diff > 0 && currentSlide < products.length - 1) {
                    setCurrentSlide((prev) => prev + 1)
                    startX = currentX
                  } else if (diff < 0 && currentSlide > 0) {
                    setCurrentSlide((prev) => prev - 1)
                    startX = currentX
                  }
                }
              }

              const handleTouchEnd = () => {
                document.removeEventListener("touchmove", handleTouchMove)
                document.removeEventListener("touchend", handleTouchEnd)
              }

              document.addEventListener("touchmove", handleTouchMove, { passive: true })
              document.addEventListener("touchend", handleTouchEnd)
            }}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {products.map((product) => (
                <div key={product.id} className="w-full flex-shrink-0">
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow w-full">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <a href={product.href}>
                          <div className="flex justify-center items-center bg-gray-50 rounded-lg p-2">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="object-contain rounded w-full h-auto max-w-[280px]"
                              style={{ aspectRatio: "1/1" }}
                            />
                          </div>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white w-8 h-8"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        {product.isNew && (
                          <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                            Novo
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{product.ages}</span>
                          <span>•</span>
                          <span>{product.pieces} pcs</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating}</span>
                          </div>
                        </div>

                        <a href={product.href}>
                          <h3 className="font-semibold text-lg hover:text-blue-600">{product.name}</h3>
                        </a>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-gray-500 line-through text-sm">{product.originalPrice}</span>
                          )}
                        </div>

                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm py-3">
                          Adicionar à sacola
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white z-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white z-10"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="flex justify-center gap-2 mt-4">
            {products.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-orange-500" : "bg-gray-300"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
