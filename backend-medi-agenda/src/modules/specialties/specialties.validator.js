export const validateSpecialty = (data) => {
    const errors = [];
    
    if(!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        errors.push("El nombre de la especialidad  es requerido");
        return { isValid : false , errors }; 

    }

    const cleanName = data.name.trim();
// la lognitud minima es de 4 
    if(cleanName.length < 4) {
        errors.push("El nombre de la especiliadad debe tener al menos 4 caracteres")
    }

const lettersOnly = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
if(!lettersOnly.test(cleanName)){
    errors.push("El nombre solo puede contener letras y espacios , sin numeros ni caracteres raros ")
}
return {
    isValid: errors.length === 0,
    errors
};

};