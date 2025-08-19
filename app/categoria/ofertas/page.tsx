import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"

const ofertasProducts = [
  {
    id: 3,
    name: "Vincent van Gogh - Girassóis",
    price: "R$ 799,99",
    originalPrice: "R$ 999,99",
    rating: 4.7,
    reviews: 89,
    ages: "18+",
    pieces: 2316,
    image: "/lego-van-gogh-sunflowers.png",
    href: "/product/3",
    discount: "20%",
  },
  {
    id: 8,
    name: "LEGO Technic Lamborghini",
    price: "R$ 1.599,99",
    originalPrice: "R$ 1.999,99",
    rating: 4.8,
    reviews: 234,
    ages: "18+",
    pieces: 3696,
    image: "/placeholder.svg?height=300&width=300",
    href: "/product/8",
    discount: "20%",
  },
]

export default function OfertasPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Ofertas Especiais</h1>

        <div className="mb-6">
          <p className="text-gray-600">Exibindo {ofertasProducts.length} Produtos</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {ofertasProducts.map((product) => (
            <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-3 md:p-6">
                <div className="relative mb-4 md:mb-6">
                  <a href={product.href}>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full object-cover rounded"
                      style={{ aspectRatio: "277/250" }}
                    />
                  </a>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    -{product.discount}
                  </span>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600">
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
                    <h3 className="font-semibold text-sm md:text-xl hover:text-blue-600 line-clamp-2">
                      {product.name}
                    </h3>
                  </a>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg md:text-2xl">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-500 line-through text-xs md:text-sm">{product.originalPrice}</span>
                    )}
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs md:text-sm py-2">
                    Adicionar ao carrinho
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
