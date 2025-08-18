import { Lock } from "lucide-react"

export function CheckoutHeader() {
  return (
    <>
      <div className="bg-blue-600 text-white text-center py-2 text-xs md:text-sm">
        <div className="flex items-center justify-center gap-2 px-2">
          <span className="text-center">A semana favorita de todo bruxo está quase chegando</span>
          <button className="underline hidden md:inline">Saiba mais</button>
        </div>
      </div>

      <header className="bg-yellow-400 border-b border-yellow-500">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center flex-row">
              <img
                src="https://legobrasil.vtexassets.com/assets/vtex/assets-builder/legobrasil.dup-template/1.28.0/logo___40c43ea8a6afef0f36be240072a0e00d.png"
                alt="LEGO"
                className="h-8 md:h-10 w-auto"
              />
            </div>

            <div className="flex items-center gap-2 text-black">
              <Lock className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-semibold text-sm md:text-base">Checkout seguro</span>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
