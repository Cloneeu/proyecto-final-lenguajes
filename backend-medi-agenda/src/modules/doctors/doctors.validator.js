export const validateDoctor = (data) => {
    const errors = [];
    if (!data.name || data.name.trim().length < 3) errors.push("El nombre del Doctor  debe tener al menos 3 caracteres.");
    if (!data.specialtyId) errors.push("La especialidad es obligatoria.");
    if (data.email && !data.email.includes("@")) errors.push("El formato del correo es inválido.");
    
    return {
        isValid: errors.length === 0,
        errors
    };
};