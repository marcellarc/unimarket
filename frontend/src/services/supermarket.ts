import { api } from "@/api/client"


// 1. Definimos exatamente a interface que a requisição precisa (igual ao DTO do Java)
export interface RegisterMarketRequest {
    cdMercado?: number
    nmMercado: string
    dsCnpj: string
    dsEmail: string
    dsSenha: string
    dsLogradouro: string
    dsBairro: string
    dtCadastro: string
}

// 2. Criamos a função de serviço (igualzinho ao seu exemplo)
export async function registerMarket({
    nmMercado,
    dsCnpj,
    dsEmail,
    dsSenha,
    dsLogradouro,
    dsBairro,
    dtCadastro
}: RegisterMarketRequest) {

    // Fazemos o POST retornando a resposta (o .data do Axios)
    const response = await api.post('/supermercados', {
        cdMercado: 0,
        nmMercado,
        dsCnpj,
        dsEmail,
        dsSenha,
        dsLogradouro,
        dsBairro,
        dtCadastro
    })

    return response.data
}