export interface CepLocationResponse {
    zipCode: string
    streetAddress?: string | null
    neighborhood?: string | null
    city?: string | null
    state?: string | null
    latitude?: number | null
    longitude?: number | null
    hasCoordinates: boolean
    source?: string | null
    service?: string | null
}
