// js/pdf/pdfCertificado.js - VERSIÓN DINÁMICA COMPLETA
import { supabase } from '../../config.js';

function numALetras(n) {
    const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 
                      'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 
                      'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 
                      'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta'];
    return unidades[n] || n.toString();
}

function formatearFechaLarga(fecha) {
    const d = (fecha instanceof Date) ? fecha : new Date(fecha + 'T12:00:00');
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function calcularFechaFinLaborable(fechaInicio, diasSumar) {
    let fecha = new Date(fechaInicio + 'T12:00:00');
    let diasContados = 0;
    while (diasContados < diasSumar) {
        fecha.setDate(fecha.getDate() + 1);
        if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
            diasContados++;
        }
    }
    return fecha;
}

export async function generarCertificado(d) {
    try {
        // ============================================
        // SOLICITAR DÍAS DE REPOSO
        // ============================================
        const { value: diasReposoInput } = await Swal.fire({
            title: '📋 Días de reposo',
            text: '¿Cuántos días LABORABLES de reposo desea asignar?',
            input: 'number',
            inputValue: 15,
            inputAttributes: { min: 1, max: 90, step: 1 },
            showCancelButton: true,
            confirmButtonColor: '#0284c7',
            cancelButtonColor: '#64748b',
            confirmButtonText: '✅ Aceptar',
            cancelButtonText: '❌ Cancelar',
            inputValidator: (value) => {
                if (!value) return '⚠️ Debe ingresar un número de días';
                if (value < 1) return '⚠️ Los días deben ser al menos 1';
                if (value > 90) return '⚠️ Máximo 90 días permitidos';
            }
        });

        if (!diasReposoInput) return;
        let diasReposo = parseInt(diasReposoInput);

        // ============================================
        // OBTENER DATOS DEL MÉDICO
        // ============================================
        const { data: { user } } = await supabase.auth.getUser();
        const { data: p } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // ============================================
        // CALCULAR FECHAS
        // ============================================
        const fechaInicioDate = new Date(d.fecha_cita + 'T12:00:00');
        const fechaFinalDate = calcularFechaFinLaborable(d.fecha_cita, diasReposo);
        const fechaInicioFormal = formatearFechaLarga(fechaInicioDate);
        const fechaFinalFormal = formatearFechaLarga(fechaFinalDate);
        const diasEscritos = numALetras(diasReposo);
        const nombreCompleto = d.nombre_paciente || '';

        // ============================================
        // VARIABLES DE CONTROL DE PÁGINA
        // ============================================
        let y = 80; // Posición Y inicial después del encabezado
        let pagina = 1;
        const margenSuperior = 80;
        const margenInferior = 260;
        const lineHeight = 7;

        // Función para verificar espacio
        function checkSpace(needed) {
            if (y + needed > margenInferior) {
                doc.addPage();
                pagina++;
                y = margenSuperior;
                
                // ENCABEZADO EN CADA PÁGINA NUEVA
                doc.setFillColor(3, 105, 161);
                doc.rect(0, 0, 210, 45, 'F');

                if (p?.foto_url) {
                    try {
                        const img = new Image();
                        img.src = p.foto_url;
                        doc.addImage(img, 'PNG', 15, 7, 30, 30);
                    } catch (e) {}
                }

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text(p?.centro_medico || "PODOELITE", 55, 18);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text(`Dr(a). ${p?.nombre_doctor || 'Médico'}`, 55, 25);
                doc.text(`Reg. Médico: ${p?.registro_medico || 'N/A'}`, 55, 32);
                doc.text(`Tel: ${p?.telefono_doctor || 'N/A'}`, 55, 39);
                
                return true;
            }
            return false;
        }

        // Función para agregar texto con ajuste
        function addText(text, x = 20, bold = false, fontSize = 11) {
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", bold ? "bold" : "normal");
            
            const lines = doc.splitTextToSize(text, 170);
            
            lines.forEach(line => {
                if (y + lineHeight > margenInferior) {
                    doc.addPage();
                    pagina++;
                    y = margenSuperior;
                    
                    // ENCABEZADO EN PÁGINAS NUEVAS
                    doc.setFillColor(3, 105, 161);
                    doc.rect(0, 0, 210, 45, 'F');
                    if (p?.foto_url) {
                        try {
                            const img = new Image();
                            img.src = p.foto_url;
                            doc.addImage(img, 'PNG', 15, 7, 30, 30);
                        } catch (e) {}
                    }
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(18);
                    doc.setFont("helvetica", "bold");
                    doc.text(p?.centro_medico || "PODOELITE", 55, 18);
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.text(`Dr(a). ${p?.nombre_doctor || 'Médico'}`, 55, 25);
                    doc.text(`Reg. Médico: ${p?.registro_medico || 'N/A'}`, 55, 32);
                    doc.text(`Tel: ${p?.telefono_doctor || 'N/A'}`, 55, 39);
                }
                doc.text(line, x, y);
                y += lineHeight;
            });
            
            y += 2;
        }

        // ============================================
        // PÁGINA 1: ENCABEZADO PRINCIPAL
        // ============================================
        doc.setFillColor(3, 105, 161);
        doc.rect(0, 0, 210, 45, 'F');

        if (p?.foto_url) {
            try {
                const img = await new Promise((res, rej) => {
                    const i = new Image();
                    i.crossOrigin = "anonymous";
                    i.onload = () => res(i);
                    i.onerror = rej;
                    i.src = p.foto_url;
                });
                doc.addImage(img, 'PNG', 15, 7, 30, 30);
            } catch (e) { 
                doc.setFillColor(255, 255, 255);
                doc.circle(30, 22, 12, 'F');
                doc.setTextColor(3, 105, 161);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("P", 30, 26, { align: 'center' });
            }
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(p?.centro_medico || "PODOELITE", 55, 18);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Dr(a). ${p?.nombre_doctor || 'Médico'}`, 55, 25);
        doc.text(`Reg. Médico: ${p?.registro_medico || 'N/A'}`, 55, 32);
        doc.text(`Tel: ${p?.telefono_doctor || 'N/A'}`, 55, 39);

        // Título
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("CERTIFICADO MÉDICO", 105, 58, { align: 'center' });

        // Ubicación
        let ubicacion = "Machala, Ecuador";
        if (p?.ciudad && p?.pais_nombre) {
            ubicacion = `${p.ciudad}, ${p.pais_nombre}`;
        } else if (p?.ciudad) {
            ubicacion = p.ciudad;
        } else if (p?.pais_nombre) {
            ubicacion = p.pais_nombre;
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`${ubicacion}, ${formatearFechaLarga(new Date())}`, 190, 68, { align: 'right' });

        // ============================================
        // CUERPO DEL CERTIFICADO (FLUYE AUTOMÁTICO)
        // ============================================
  
  // 1. Quien certifica + CERTIFICO + Atención + Motivo (TODO EN UN SOLO FLUJO)
addText(`Yo, Dr(a). ${p?.nombre_doctor || 'Médico'}, con registro profesional N° ${p?.registro_medico || 'N/A'}, en mi calidad de ${p?.especialidad || 'Médico Podólogo'}, CERTIFICO que el/la paciente ${nombreCompleto}, portador(a) de la cédula de identidad N° ${d.cedula_paciente || 'N/A'}, fue atendido(a) en mi consulta el día ${fechaInicioFormal} a las ${d.hora_cita || 'N/A'}, por presentar: ${d.motivo_consulta || 'No especificado'}.`, 20, false, 11);

// 2. Diagnóstico (como texto continuo)
addText(`El diagnóstico: ${d.diagnostico || 'No especificado'}.`, 20, false, 11);

// 3. Reposo
addText(`En virtud de lo anterior, se prescribe reposo médico por el término de ${diasReposo} (${diasEscritos}) días laborables, comprendidos desde el ${fechaInicioFormal} hasta el ${fechaFinalFormal}.`, 20, false, 11);

// 4. Recomendaciones (en una sola línea)
if (d.observaciones && d.observaciones.trim() !== "") {
    addText(`Recomendaciones: ${d.observaciones}`, 20, false, 11);
} else {
    addText(`Recomendaciones: Mantener reposo relativo, evitar carga de peso, acudir a control en 7 días.`, 20, false, 11);
}

// 5. Validez legal
addText(`Este certificado se expide conforme a la normativa legal vigente, para los fines que el interesado estime convenientes.`, 20, false, 11);      // FIRMA
        // ============================================
        y += 10;
        if (y + 25 > margenInferior) {
            doc.addPage();
            pagina++;
            y = margenSuperior;
            
            // Encabezado en nueva página
            doc.setFillColor(3, 105, 161);
            doc.rect(0, 0, 210, 45, 'F');
            if (p?.foto_url) {
                try {
                    const img = new Image();
                    img.src = p.foto_url;
                    doc.addImage(img, 'PNG', 15, 7, 30, 30);
                } catch (e) {}
            }
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(p?.centro_medico || "PODOELITE", 55, 18);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Dr(a). ${p?.nombre_doctor || 'Médico'}`, 55, 25);
            doc.text(`Reg. Médico: ${p?.registro_medico || 'N/A'}`, 55, 32);
            doc.text(`Tel: ${p?.telefono_doctor || 'N/A'}`, 55, 39);
        }
        
        doc.line(70, y, 140, y);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Dr(a). ${p?.nombre_doctor || 'Médico'}`, 105, y + 7, { align: "center" });
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Reg. Médico: ${p?.registro_medico || 'N/A'}`, 105, y + 12, { align: "center" });
        doc.text(`Certificado N°: ${d.id_cita_clinica || 'N/A'}`, 105, y + 17, { align: "center" });
        doc.text("Firma y sello", 105, y + 22, { align: "center" });

        // ============================================
        // PIE DE PÁGINA (en todas las páginas)
        // ============================================
        for (let i = 1; i <= pagina; i++) {
            doc.setPage(i);
            doc.setFillColor(3, 105, 161);
            doc.rect(0, 277, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            
            let pieInfo = p?.centro_medico || 'PodoElite';
            if (p?.direccion_consultorio) {
                pieInfo += ` - ${p.direccion_consultorio}`;
            }
            doc.text(pieInfo, 105, 285, { align: 'center' });
            
            let contacto = `Tel: ${p?.telefono_doctor || 'N/A'}`;
            if (p?.correo || user?.email) {
                contacto += ` | Email: ${p?.correo || user?.email}`;
            }
            doc.text(contacto, 105, 292, { align: 'center' });
        }

        // ============================================
        // GUARDAR PDF
        // ============================================
        doc.save(`Certificado_${d.cedula_paciente || 'paciente'}.pdf`);
        return true;

    } catch (error) {
        console.error("Error al generar certificado:", error);
        throw error;
    }
}