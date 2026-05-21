export const MAX_PROFILE_NAME_LENGTH = 60
export const MAX_PROFILE_IMAGE_FILE_SIZE_MB = 1
export const MAX_PROFILE_IMAGE_FILE_SIZE_BYTES = MAX_PROFILE_IMAGE_FILE_SIZE_MB * 1024 * 1024

export function validateStrongPassword(password: string) {
    if (password.length < 8) {
        return 'A senha deve ter no mínimo 8 caracteres.'
    }

    if (password.length > 100) {
        return 'A senha deve ter no máximo 100 caracteres.'
    }

    if (!/[A-Z]/.test(password)) {
        return 'A senha deve conter pelo menos uma letra maiúscula.'
    }

    if (!/[a-z]/.test(password)) {
        return 'A senha deve conter pelo menos uma letra minúscula.'
    }

    if (!/\d/.test(password)) {
        return 'A senha deve conter pelo menos um número.'
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return 'A senha deve conter pelo menos um caractere especial.'
    }

    return null
}
