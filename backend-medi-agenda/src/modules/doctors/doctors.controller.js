import { doctorsRepository } from './doctors.repository.js';

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorsRepository.findAll();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener médicos", error: error.message });
    }
};

export const createDoctor = async (req, res) => {
    try {
        const { name, specialtyId, email, phone } = req.body;
        
        if (!name || !specialtyId) {
            return res.status(400).json({ message: "Nombre y Especialidad son obligatorios" });
        }

        const result = await doctorsRepository.create({ 
            name, 
            specialtyId, 
            email: email || "", 
            phone: phone || "" 
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error al crear médico", error: error.message });
    }
};
export const toggleDoctorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await doctorsRepository.findById(id);

        if (!doctor) return res.status(404).json({ message: "Médico no encontrado 💁🏻" });

        const newStatus = doctor.status === 'active' ? 'inactive' : 'active';
        const result = await doctorsRepository.updateStatus(id, newStatus);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar estatus 💁🏻", error: error.message });
    }
};