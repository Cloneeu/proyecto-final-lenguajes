import { doctorsService } from './doctors.service.js';
import { validateDoctor } from './doctors.validator.js';

export const getAllDoctors = async (req, res) => {
    try {
        // Aqui se  pide los datos al servicio
        const doctors = await doctorsService.getAllDoctors();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener médicos", error: error.message });
    }
};

export const createDoctor = async (req, res) => {
    try {
        // Usamos el validador antes de procesar nada
        const { isValid, errors } = validateDoctor(req.body);
        if (!isValid) {
            return res.status(400).json({ message: "Datos inválidos 🧐", errors });
        }

        const { name, specialtyId, email, phone } = req.body;

        // Se le pasan  los datos limpios al servicio
        // El servicio se encargará de revisar si la especialidad existe y guardarlo
        const result = await doctorsService.createDoctor({
            name,
            specialtyId,
            email: email || "",
            phone: phone || ""
        });

        res.status(201).json(result);
    } catch (error) {
        // Si el servicio lanza el error de "La especialidad no existe", cae aquí
        res.status(400).json({ message: error.message });
    }
};

export const toggleDoctorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await doctorsService.toggleStatus(id);

        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};