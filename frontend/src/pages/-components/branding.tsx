import logoImg from '@/assets/logo-unimarket-auth.png'

export function Branding() {
    return (
        <section
            id="sobre-unimarket"
            className="relative order-first hidden h-[560px] w-full items-center justify-center lg:flex"
            aria-label="Apresentação do UniMarket"
        >
            <div className="relative flex h-full w-full items-center justify-center">
                <svg
                    viewBox="0 0 600 600"
                    className="absolute inset-0 h-full w-full"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="auth-blob" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e8f5ff" />
                            <stop offset="100%" stopColor="#d8e9ff" />
                        </linearGradient>
                        <linearGradient id="auth-blob-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a7d6ff" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#ffcf37" stopOpacity="0.36" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#auth-blob-ring)"
                        className="text-primary"
                        d="M464,128 C520,176 552,260 524,344 C496,428 408,512 312,520 C216,528 112,460 76,372 C40,284 72,176 152,116 C232,56 360,52 416,84 C432,96 448,112 464,128 Z"
                        transform="translate(20 10)"
                    />
                    <path
                        fill="url(#auth-blob)"
                        className="text-primary"
                        d="M444,148 C500,196 524,272 496,348 C468,424 388,488 304,492 C220,496 132,440 100,360 C68,280 92,176 168,124 C244,72 356,72 408,104 C420,116 432,132 444,148 Z"
                    />
                </svg>

                <svg
                    viewBox="0 0 80 80"
                    className="absolute left-[8%] top-[18%] h-16 w-16 drop-shadow-md animate-[auth-illustration-float_6s_ease-in-out_infinite]"
                    aria-hidden="true"
                >
                    <path
                        d="M20 28 H60 L56 70 H24 Z"
                        fill="#fff8df"
                        stroke="#003a93"
                        strokeWidth="2.5"
                    />
                    <path
                        d="M30 28 V22 a10 10 0 0 1 20 0 V28"
                        fill="none"
                        stroke="#003a93"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                    />
                    <circle cx="34" cy="44" r="3" fill="#ffcf37" />
                    <circle cx="46" cy="44" r="3" fill="#ffcf37" />
                </svg>

                <svg
                    viewBox="0 0 80 80"
                    className="absolute right-[6%] top-[22%] h-14 w-14 drop-shadow-md animate-[auth-illustration-float_7s_ease-in-out_infinite_0.8s]"
                    aria-hidden="true"
                >
                    <path
                        d="M10 38 L42 6 H72 V36 L40 68 Z"
                        fill="#ffcf37"
                        stroke="#003a93"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                    />
                    <circle cx="56" cy="22" r="5" fill="#ffffff" stroke="#003a93" strokeWidth="2.5" />
                    <text x="34" y="44" fontSize="18" fontWeight="800" fill="#003a93" transform="rotate(-45 34 44)">
                        %
                    </text>
                </svg>

                <div className="absolute right-[14%] bottom-[18%] h-3 w-3 rounded-full bg-[#ffcf37] animate-[auth-illustration-float_5s_ease-in-out_infinite_0.4s]" />
                <div className="absolute left-[14%] bottom-[24%] h-2 w-2 rounded-full bg-primary animate-[auth-illustration-float_8s_ease-in-out_infinite_1.2s]" />
                <div className="absolute left-[22%] top-[32%] h-2.5 w-2.5 rounded-full bg-[#4aa3ff] opacity-70" />

                <svg
                    viewBox="0 0 100 60"
                    className="absolute right-[10%] bottom-[14%] h-14 w-20 opacity-80 animate-[auth-illustration-float_9s_ease-in-out_infinite_0.6s]"
                    aria-hidden="true"
                >
                    <path
                        d="M6 8 H18 L26 38 H78 L88 14 H28"
                        fill="none"
                        stroke="#0056df"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                    />
                    <circle cx="34" cy="50" r="5" fill="#ffcf37" stroke="#003a93" strokeWidth="2" />
                    <circle cx="72" cy="50" r="5" fill="#ffcf37" stroke="#003a93" strokeWidth="2" />
                </svg>

                <img
                    src={logoImg}
                    alt="UniMarket"
                    className="relative z-10 w-[58%] max-w-[360px] object-contain drop-shadow-[0_24px_40px_rgba(0,58,147,0.25)]"
                />

                <div className="absolute bottom-4 left-1/2 max-w-md -translate-x-1/2 text-center">
                    <h1 className="auth-title text-4xl font-extrabold text-primary">UniMarket</h1>
                    <p className="auth-support mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                        Compare mercados próximos, acompanhe preços reais e escolha melhor antes de sair de casa.
                    </p>
                </div>
            </div>
        </section>
    )
}
