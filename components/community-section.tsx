import { Button } from "@/components/ui/button"

export function CommunitySection() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Community builds section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-2">Veja o que todos estão construindo</h2>
        <p className="text-center text-gray-600 mb-8">
          Um olhar mais próximo dos momentos LEGO® que valem a pena descobrir - desde diversão sazonal até momentos
          especiais.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src="/images/const1.webp"
              alt="LEGO Star Wars AT-AT"
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/const2.webp"
              alt="LEGO Pirate Ship"
              className="w-full h-32 object-cover rounded-lg"
            />
            <img
              src="/images/const3.webp"
              alt="LEGO Mining Truck"
              className="w-full h-32 object-cover rounded-lg"
            />
            <img
              src="/images/const4.webp"
              alt="LEGO Medieval Castle"
              className="w-full h-32 object-cover rounded-lg"
            />
            <img
              src="/images/const5.webp"
              alt="LEGO Viking Ship"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <img
              src="/images/const6.webp"
              alt="LEGO Submarine"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Spotlight section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl text-white p-8 relative overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Destaque da semana</h2>
            <p className="text-purple-100">
              Um olhar mais próximo dos momentos LEGO® que valem a pena descobrir - desde diversão sazonal até momentos
              especiais.
            </p>
            <div className="flex gap-4">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-6">Ver Coleção</Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 rounded-full px-6 bg-transparent"
              >
                Saiba mais
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="/placeholder.svg?height=400&width=500"
              alt="LEGO Hogwarts Castle"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Decorative LEGO bricks */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-green-400 rounded opacity-80"></div>
        <div className="absolute top-16 right-8 w-6 h-6 bg-yellow-400 rounded opacity-60"></div>
        <div className="absolute bottom-8 left-16 w-4 h-4 bg-red-400 rounded opacity-70"></div>
      </section>
    </div>
  )
}
