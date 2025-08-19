import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"

const exclusivosProducts = [
  {
    id: 2,
    name: "A Galáxia Via Láctea",
    price: "R$ 999,99",
    rating: 4.9,
    reviews: 203,
    ages: "18+",
    pieces: 1969,
    image: "/lego-milky-way.png",
    href: "/product/2",
  },
  {
    id: 7,
    name: "LEGO Architecture Statue of Liberty",
    price: "R$ 899,99",
    rating: 4.7,
    reviews: 156,
    ages: "16+",
    pieces: 1685,
    image: "/placeholder.svg?height=300&width=300",
    href: "/product/7",
  },
]

export default function ExclusivosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Sets Exclusivos</h1>

        <div className="mb-6">
          <p className="text-gray-600">Exibindo {exclusivosProducts.length} Produtos</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {exclusivosProducts.map((product) => (
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
                  <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Exclusivo
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
