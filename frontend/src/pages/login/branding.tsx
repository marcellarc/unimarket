export function Branding() {
    return (
        <div className="relative overflow-hidden">

            <div
                className="absolute right-[-35%] top-[-10%] h-[120%] w-[90%]
                   rounded-[60%]"
            />
            <div className="relative z-10 flex h-full flex-col justify-center px-20">
                <h1 className="text-6xl font-bold text-black">UniMarket</h1>

                <p className="mt-6 max-w-md text-2xl text-black">
                    Encontre o melhor preço sem sair de casa.
                </p>
            </div>
        </div>
    )
}