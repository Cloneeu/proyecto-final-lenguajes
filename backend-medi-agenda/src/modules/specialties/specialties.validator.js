export const validateSpecialty = (data) => {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 4) {
        errors.push("El nombre de la especialidad debe tener al menos 4 caracteres. 🧐");
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};