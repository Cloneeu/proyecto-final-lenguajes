import { specialtiesRepository } from './specialties.repository.js';

export const getAllSpecialties = async (req, res) => {
    try {
        const specialties = await specialtiesRepository.findAll();
        res.status(200).json(specialties);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener especialidades 😨", error: error.message });
    }
};

export const createSpecialty = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "El nombre es obligatorio 🧐" });
        }

        const result = await specialtiesRepository.create(name);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la especialidad 💁🏻", error: error.message });
    }
};