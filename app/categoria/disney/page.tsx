import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"
import { products } from "@/app/product/[id]/page"

const novosProducts = Object.values(products).filter((product) => product.categories?.includes("novos"))

export default function NovosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Disney</h1>

        <div className="mb-6">
          <p className="text-gray-600">Exibindo {novosProducts.length} Produtos</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {novosProducts.map((product) => (
            <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-3 md:p-6">
                <div className="relative mb-4 md:mb-6">
                  <a href={`/product/${product.id}`}>
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full object-cover rounded"
                      style={{ aspectRatio: "277/250" }}
                    />
                  </a>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                    Disney
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
                  <a href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-sm md:text-xl hover:text-blue-600 line-clamp-2">
                      {product.name}
                    </h3>
                  </a>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg md:text-2xl">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs md:text-sm py-2">
                    Adicionar à sacola
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
