import { specialtiesService } from './specialties.service.js';
import { validateSpecialty } from './specialties.validator.js';

export const getAllSpecialties = async (req, res) => {
    try {
        //  pedimos los datos al servicio 
        const specialties = await specialtiesService.getAllSpecialties();
        res.status(200).json(specialties);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener especialidades 😨", error: error.message });
    }
};

export const createSpecialty = async (req, res) => {
    try {
        // pasamos los datos por el validador  
        const { isValid, errors } = validateSpecialty(req.body);
        if (!isValid) {
            return res.status(400).json({ message: "Datos inválidos 🧐", errors });
        }

        const { name } = req.body;
        //  Si es válido, el servicio se encarga de revisar que no esté duplicado y de guardarlo
        const result = await specialtiesService.createSpecialty(name);
        res.status(201).json(result);
    } catch (error) {
        // Si el servicio encuentra que la especialidad ya existe, marca error 
        res.status(400).json({ message: error.message });
    }
};