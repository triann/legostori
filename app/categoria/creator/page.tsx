import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"
import { products } from "@/app/product/[id]/page"

const creatorProducts = Object.values(products).filter((product) => product.categories?.includes("creator"))

export default function CreatorPage({ searchParams }: { searchParams: { discount?: string } }) {
  const discount = searchParams?.discount ? Number.parseInt(searchParams.discount) : 0

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Creator</h1>

        {discount > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-center">
            <h2 className="text-xl font-bold">🎉 Parabéns! Você conquistou {discount}% de desconto!</h2>
            <p className="text-sm opacity-90">Desconto aplicado em todos os produtos desta categoria</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-600">Exibindo {creatorProducts.length} Produtos</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {creatorProducts.map((product) => {
            const originalPrice = product.price
            const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice
            const isDiscounted = discount > 0

            return (
              <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-6">
                  <div className="relative mb-4 md:mb-6">
                    <a href={`/product/${product.id}${discount > 0 ? `?discount=${discount}` : ""}`}>
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
                    {isDiscounted && (
                      <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discount}%
                      </span>
                    )}
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
                    <a href={`/product/${product.id}${discount > 0 ? `?discount=${discount}` : ""}`}>
                      <h3 className="font-semibold text-sm md:text-xl hover:text-blue-600 line-clamp-2">
                        {product.name}
                      </h3>
                    </a>
                    <div className="flex items-center gap-2">
                      {isDiscounted ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 line-through">
                            R$ {originalPrice.toFixed(2).replace(".", ",")}
                          </span>
                          <span className="font-bold text-lg md:text-2xl text-green-600">
                            {discount === 100 ? "GRÁTIS!" : `R$ ${discountedPrice.toFixed(2).replace(".", ",")}`}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-lg md:text-2xl">
                          R$ {originalPrice.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs md:text-sm py-2">
                      {discount === 100 ? "Resgatar Grátis" : "Adicionar à sacola"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      <Footer />
    </div>
  )
}
