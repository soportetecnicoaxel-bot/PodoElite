// js/pdf/pdfCita.js
import { supabase } from '../../config.js';

export async function generarPDFCita(d) {
    try {
        const { data: { user } } = await supabase.auth.getUser(); // Cambiar client por supabase
        const { data: p } = await supabase                     // Cambiar client por supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Encabezado azul
        doc.setFillColor(3, 105, 161);
        doc.rect(0, 0, 210, 45, 'F');

        // Logo
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
            } catch (e) { console.warn("Logo no disponible"); }
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text(p?.centro_medico || "PodoElite Pro", 55, 18);
        
        doc.setFontSize(10);
        doc.text(`Dr(a). ${p?.nombre_doctor || 'Médico'} | Reg: ${p?.registro_medico || 'N/A'}`, 55, 25);
        doc.text(`Dir: ${p?.direccion_consultorio || 'No registrada'}`, 55, 32);
        doc.text(`Tel: ${p?.telefono_doctor || 'N/A'}`, 55, 39);

        // Título
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("DETALLE DE CITA MÉDICA", 105, 58, { align: "center" });

        // Tabla de datos
        doc.autoTable({
            startY: 65,
            margin: { left: 15, right: 15 },
            theme: 'grid',
            head: [['ÍNDICE', 'DETALLE']],
            body: [
                ['ID CITA', d.id_cita_clinica || 'N/A'],
                ['PACIENTE', (d.nombre_paciente || '').toUpperCase()],
                ['CÉDULA', d.cedula_paciente || 'N/A'],
                ['FECHA', d.fecha_cita || 'N/A'],
                ['HORA', d.hora_cita || 'N/A'],
                ['MOTIVO', d.motivo_consulta || 'N/A'],
                ['DIAGNÓSTICO', d.diagnostico || 'N/A'],
                ['TRATAMIENTO', d.tratamiento_evolucion || 'N/A'],
                ['OBSERVACIONES', d.observaciones || 'Sin observaciones']
            ],
            headStyles: { fillColor: [3, 105, 161], fontSize: 10 },
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45, fillColor: [240, 240, 240] } }
        });

        // Firma
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.line(70, finalY, 140, finalY);
        doc.setFont("helvetica", "bold");
        doc.text(`Pdgo(a). ${p?.nombre_doctor || 'Médico'}`, 105, finalY + 7, { align: "center" });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Firma y Sello Autorizado", 105, finalY + 12, { align: "center" });

        // Pie de página
        doc.setFillColor(3, 105, 161);
        doc.rect(0, 270, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        
        doc.text(`Reg. Médico: ${p?.registro_medico || 'N/A'}`, 15, 280);
        doc.text(`Tel: ${p?.telefono_doctor || 'N/A'}`, 15, 285);
        doc.text(`Email: ${p?.correo || user?.email || 'N/A'}`, 15, 290);
        
        doc.text(`Dir: ${p?.direccion_consultorio || 'No registrada'}`, 130, 280);
        doc.text(`Dr(a). ${p?.nombre_doctor || 'Médico'}`, 130, 285);

        doc.save(`Cita_${d.id_cita_clinica || 'cita'}.pdf`);
        return true;

    } catch (error) {
        console.error("Error al generar PDF:", error);
        throw error;
    }
}