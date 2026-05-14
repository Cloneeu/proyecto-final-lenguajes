const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function validateCreateAppointment(body, user) {
  const { patientId, doctorId, date, startTime, endTime } = body;
  // El paciente no envía patientId; el backend lo inyecta desde el token
  if (user?.role !== 'patient' && !patientId) return { error: 'patientId es requerido' };
  if (!doctorId) return { error: 'doctorId es requerido' };
  // La fecha debe seguir el formato de YYYY-MM-DD.
  if (!date) return { error: 'Date es requerida' };
  if (!DATE_RE.test(date)) return { error: 'Date debe estar en formato YYYY-MM-DD' };
  // Las horas se validan en formato de 24 horas HH:MM.
  if (!startTime) return { error: 'startTime es Requerido' };
  if (!TIME_RE.test(startTime)) return { error: 'startTime debe estar en formato HH:MM' };
  if (!endTime) return { error: 'endTime es requerido' };
  if (!TIME_RE.test(endTime)) return { error: 'endTime debe estar en formato HH:MM' };
  // La cita no puede terminar antes de empezar.
  if (startTime >= endTime) return { error: 'startTime debe empezar antes de endTime' };
  return { error: null };
}

export function validateUpdateStatus(body) {
  // El cambio de estado solo debe acepta valores conocidos.
  if (!body.status) return { error: 'status es requerido' };
  if (!VALID_STATUSES.includes(body.status)) {
    return { error: `status de ser uno de estos: ${VALID_STATUSES.join(', ')}` };
  }
  return { error: null };
}
