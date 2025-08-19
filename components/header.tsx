import { Search, Heart, ShoppingBag, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
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
              <img
                src="https://legobrasil.vtexassets.com/assets/vtex/assets-builder/legobrasil.dup-template/1.28.0/logo___40c43ea8a6afef0f36be240072a0e00d.png"
                alt="LEGO"
                className="h-8 md:h-10 w-auto"
              />

              <Button variant="ghost" size="icon" className="md:hidden text-black">
                <Menu className="w-5 h-5" />
              </Button>

              {/* Navigation desktop */}
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                  COMPRAR
                </Button>
                <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                  DESCOBRIR
                </Button>
                <Button variant="ghost" className="text-black font-semibold hover:bg-yellow-300">
                  AJUDA
                </Button>
                <Button variant="ghost" className="bg-red-600 text-white font-semibold hover:bg-red-700">
                  NOVO
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Search mobile */}
              <Button variant="ghost" size="icon" className="md:hidden text-black">
                <Search className="w-5 h-5" />
              </Button>

              {/* Search desktop */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input placeholder="Buscar..." className="pl-10 w-60 lg:w-80 bg-white border-gray-300" />
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
        </div>
      </header>
    </>
  )
}
