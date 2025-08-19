"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
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
    name: "Exclusivos",
    color: "bg-purple-600",
    image:
      "https://legobrasil.vtexassets.com/assets/vtex.file-manager-graphql/images/dbba9da0-fef8-4752-8da3-4dd10e5fdae4___dff3250cc485e56c1e8392f20b546919.jpg",
    href: "/categoria/exclusivos", // adicionando navegação para página específica
  },
  { name: "Ofertas", color: "bg-red-600", image: "/lego-discount.png", href: "/categoria/ofertas" }, // adicionando navegação
  { name: "Todos os sets", color: "bg-red-700", image: "/lego-collection.png", href: "/categoria/todos-os-sets" }, // adicionando navegação
  { name: "LEGO ONE PIECE", color: "bg-blue-600", image: "/lego-one-piece-set.png", href: "/categoria/one-piece" }, // adicionando navegação
  { name: "Presentes", color: "bg-green-600", image: "/lego-gift-sets.png", href: "/categoria/presentes" }, // adicionando navegação
  {
    name: "Volta às Aulas",
    color: "bg-teal-600",
    image: "/colorful-brick-backpack.png",
    href: "/categoria/volta-as-aulas",
  }, // adicionando navegação
  {
    name: "Desbloqueie Recompensas",
    color: "bg-purple-700",
    image: "/lego-vip-rewards.png",
    href: "/categoria/recompensas",
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
    name: "A Galáxia Via Láctea",
    price: "R$ 999,99",
    originalPrice: null,
    rating: 4.9,
    reviews: 203,
    ages: "18+",
    pieces: 1969,
    image: "/lego-milky-way.png",
    isNew: false,
    href: "/product/2",
  },
  {
    id: 3,
    name: "Vincent van Gogh - Girassóis",
    price: "R$ 999,99",
    originalPrice: null,
    rating: 4.7,
    reviews: 89,
    ages: "18+",
    pieces: 2316,
    image: "/lego-van-gogh-sunflowers.png",
    isNew: false,
    href: "/product/3",
  },
  {
    id: 4,
    name: "Venom vs. Groot - The Starry Night",
    price: "$349.99",
    originalPrice: null,
    rating: 4.8,
    reviews: 124,
    ages: "18+",
    pieces: 2807,
    image: "/placeholder.svg?height=300&width=300",
    isNew: false,
    href: "/product/4",
  },
  {
    id: 5,
    name: "LEGO® Titanic",
    price: "$679.99",
    originalPrice: null,
    rating: 4.9,
    reviews: 445,
    ages: "18+",
    pieces: 9090,
    image: "/placeholder.svg?height=300&width=300",
    isNew: false,
    href: "/product/5",
  },
]

export function ProductGrid() {
  const [currentSlide, setCurrentSlide] = useState(0)

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

        <div className="relative flex justify-center">
          <div
            className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollBehavior: "smooth",
            }}
            onMouseDown={(e) => {
              const slider = e.currentTarget
              let isDown = false
              let startX = 0
              let scrollLeft = 0

              const handleMouseDown = (e: MouseEvent) => {
                isDown = true
                slider.classList.add("active:cursor-grabbing")
                startX = e.pageX - slider.offsetLeft
                scrollLeft = slider.scrollLeft
              }

              const handleMouseLeave = () => {
                isDown = false
                slider.classList.remove("active:cursor-grabbing")
              }

              const handleMouseUp = () => {
                isDown = false
                slider.classList.remove("active:cursor-grabbing")
              }

              const handleMouseMove = (e: MouseEvent) => {
                if (!isDown) return
                e.preventDefault()
                const x = e.pageX - slider.offsetLeft
                const walk = (x - startX) * 2
                slider.scrollLeft = scrollLeft - walk
              }

              slider.addEventListener("mousedown", handleMouseDown)
              slider.addEventListener("mouseleave", handleMouseLeave)
              slider.addEventListener("mouseup", handleMouseUp)
              slider.addEventListener("mousemove", handleMouseMove)

              return () => {
                slider.removeEventListener("mousedown", handleMouseDown)
                slider.removeEventListener("mouseleave", handleMouseLeave)
                slider.removeEventListener("mouseup", handleMouseUp)
                slider.removeEventListener("mousemove", handleMouseMove)
              }
            }}
            onTouchStart={(e) => {
              const slider = e.currentTarget
              let startX = 0
              let scrollLeft = 0

              const handleTouchStart = (e: TouchEvent) => {
                startX = e.touches[0].pageX - slider.offsetLeft
                scrollLeft = slider.scrollLeft
              }

              const handleTouchMove = (e: TouchEvent) => {
                const x = e.touches[0].pageX - slider.offsetLeft
                const walk = (x - startX) * 2
                slider.scrollLeft = scrollLeft - walk
              }

              slider.addEventListener("touchstart", handleTouchStart)
              slider.addEventListener("touchmove", handleTouchMove)

              return () => {
                slider.removeEventListener("touchstart", handleTouchStart)
                slider.removeEventListener("touchmove", handleTouchMove)
              }
            }}
          >
            {categories.map((category, index) => (
              <Link key={index} href={category.href}>
                <Card
                  className={`cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0 w-24 md:w-32 relative overflow-hidden p-0 border-0 mx-auto`}
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
      </div>

      {/* Products section */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-8">Mais Vendidos </h2>

        <div className="relative flex justify-center">
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing max-w-sm mx-auto"
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
                <div key={product.id} className="w-full flex-shrink-0 px-4 flex justify-center">
                  <Card className="group cursor-pointer hover:shadow-lg transition-shadow max-w-sm mx-auto">
                    <CardContent className="p-4 md:p-6">
                      <div className="relative mb-4 md:mb-6">
                        <a href={product.href}>
                          <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="object-contain rounded mx-auto"
                              style={{ width: "250px", height: "250px" }}
                            />
                          </div>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white w-8 h-8 md:w-10 md:h-10"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        {product.isNew && (
                          <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                            Novo
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 md:space-y-3">
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
                          <h3 className="font-semibold text-lg md:text-xl hover:text-blue-600">{product.name}</h3>
                        </a>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl md:text-2xl">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-gray-500 line-through text-sm">{product.originalPrice}</span>
                          )}
                        </div>

                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm md:text-base py-3">
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
