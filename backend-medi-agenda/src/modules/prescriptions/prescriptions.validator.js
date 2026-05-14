const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateCreatePrescription(body) {
  // Valida la estructura de la receta 
  const { patientId, doctorId, date, medications } = body;
  if (!patientId) return { error: 'patientId es requerido' };
  if (!doctorId) return { error: 'doctorId es requerido' };
  if (!date) return { error: 'date es requerido' };
  if (!DATE_RE.test(date)) return { error: 'date debe estar en formato YYYY-MM-DD' };
  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return { error: 'medications no debe ser un arreglo vacío' };
  }
  for (const med of medications) {
    if (!med.name) return { error: 'Cada medicamento debe tener un nombre' };
    if (!med.dose) return { error: 'Cada medicamento debe tener una dosis' };
    if (!med.frequency) return { error: 'Cada medicamento debe tener una frecuencia' };
    if (!med.duration) return { error: 'Cada medicamento debe tener una duración' };
  }
  return { error: null };
}
