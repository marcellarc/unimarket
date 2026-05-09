import { api } from '@/api/client'
import type { CepLocationResponse } from '@/types/location'

export async function findLocationByCep(cep: string) {
    const response = await api.get<CepLocationResponse>(`/location/cep/${cep.replace(/\D/g, '')}`)
    return response.data
}
