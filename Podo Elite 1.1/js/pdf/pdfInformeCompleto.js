// js/pdf/pdfInformeCompleto.js
import { supabase } from '../../config.js';

export async function generarInformeCompleto(currentPaciente, citas, exploraciones) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: p } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

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
            } catch (e) { console.warn("Logo no disponible"); }
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(p?.centro_medico || "PodoElite Pro", 55, 18);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Pdgo(a). ${p?.nombre_doctor || 'Médico'} | Reg: ${p?.registro_medico || 'N/A'}`, 55, 25);
        doc.text(`Dir: ${p?.direccion_consultorio || 'No registrada'}`, 55, 32);
        doc.text(`Tel: ${p?.telefono_doctor || 'N/A'}`, 55, 39);

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("INFORME CLÍNICO COMPLETO", 105, 58, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Paciente: ${currentPaciente.apellido || ''} ${currentPaciente.nombre || ''}`.trim(), 20, 70);
        doc.text(`Cédula: ${currentPaciente.cedula || 'N/A'}`, 20, 77);
        doc.text(`ID Historia: ${currentPaciente.id_historia_clinica || 'N/A'}`, 20, 84);
        doc.text(`Fecha Nacimiento: ${currentPaciente.fecha_nacimiento || 'N/A'}`, 20, 91);
        doc.text(`Teléfono: ${currentPaciente.telefono || 'N/A'}`, 20, 98);
        doc.text(`Sangre: ${currentPaciente.sangre || 'N/A'}`, 20, 105);

        let y = 120;
        let pagina = 1;

        function nuevaPagina() {
            doc.addPage();
            pagina++;
            y = 30;
            
            doc.setFillColor(240, 240, 240);
            doc.rect(0, 0, 210, 10, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text(`Página ${pagina}`, 105, 7, { align: "center" });
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
        }

        if (y > 250) nuevaPagina();

        doc.setFillColor(240, 240, 240);
        doc.rect(15, y-5, 180, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ANTECEDENTES MÉDICOS", 20, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const antecedentes = [
            { label: 'Diabetes', value: currentPaciente.diabetes, tipo: currentPaciente.tipo_diabetes },
            { label: 'Hipertensión', value: currentPaciente.hipertension },
            { label: 'Hipotensión', value: currentPaciente.hipotension },
            { label: 'Epilepsia', value: currentPaciente.epilepsia },
            { label: 'Asma', value: currentPaciente.asma },
            { label: 'Artritis', value: currentPaciente.artritis },
            { label: 'Artrosis', value: currentPaciente.artrosis },
            { label: 'VIH', value: currentPaciente.vih },
            { label: 'Pie Diabético', value: currentPaciente.pie_diabetico },
            { label: 'Hepatitis', value: currentPaciente.hepatitis, tipo: currentPaciente.tipo_hepatitis },
            { label: 'Alergia', value: currentPaciente.alergia, tipo: currentPaciente.tipo_alergia },
            { label: 'Lepra', value: currentPaciente.lepra },
            { label: 'Tuberculosis', value: currentPaciente.tuberculosis },
            { label: 'Cardiopatía', value: currentPaciente.cardiopatia },
            { label: 'Hemofilia', value: currentPaciente.hemofilia },
            { label: 'Pie Leproso', value: currentPaciente.pie_leproso },
            { label: 'Sífilis', value: currentPaciente.sifilis },
            { label: 'Pie Psoriásico', value: currentPaciente.pie_psoriasico },
            { label: 'Pie Geriátrico', value: currentPaciente.pie_geriatrico },
            { label: 'Pie Sifilítico', value: currentPaciente.pie_sifilitico },
            { label: 'Pie Sidoso', value: currentPaciente.pie_sidoso },
            { label: 'Pie Artrósico', value: currentPaciente.pie_artrosico },
            { label: 'Pie de Atleta', value: currentPaciente.pie_atleta },
            { label: 'Otros', value: currentPaciente.otros, tipo: currentPaciente.tipo_otros }
        ];

        const activos = antecedentes.filter(a => a.value);

        if (activos.length > 0) {
            activos.forEach(a => {
                if (y > 280) nuevaPagina();
                let texto = `• ${a.label}: Sí ${a.tipo ? `(${a.tipo})` : ''}`;
                doc.text(texto, 25, y);
                y += 7;
            });
        } else {
            doc.text("• Sin antecedentes registrados", 25, y);
            y += 7;
        }
        y += 5;

        if (citas && citas.length > 0) {
            if (y > 250) nuevaPagina();

            doc.setFillColor(240, 240, 240);
            doc.rect(15, y-5, 180, 8, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("HISTORIAL DE CITAS", 20, y);
            y += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            citas.forEach(cita => {
                if (y > 280) nuevaPagina();
                
                doc.setFont("helvetica", "bold");
                doc.text(`${cita.fecha_cita || 'N/A'} - ${cita.hora_cita || 'N/A'}`, 25, y);
                y += 5;
                
                doc.setFont("helvetica", "normal");
                doc.text(`Tipo: ${cita.tipo_consulta || 'N/A'}`, 30, y);
                y += 5;
                doc.text(`Motivo: ${cita.motivo_consulta || 'N/A'}`, 30, y);
                y += 5;
                doc.text(`Diagnóstico: ${cita.diagnostico || 'N/A'}`, 30, y);
                y += 5;
                doc.text(`Tratamiento: ${cita.tratamiento_evolucion || 'N/A'}`, 30, y);
                y += 7;
            });
            y += 5;
        }

        if (exploraciones && exploraciones.length > 0) {
            if (y > 250) nuevaPagina();

            doc.setFillColor(240, 240, 240);
            doc.rect(15, y-5, 180, 8, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("EXPLORACIONES FÍSICAS", 20, y);
            y += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            exploraciones.forEach(exp => {
                if (y > 280) nuevaPagina();
                
                doc.setFont("helvetica", "bold");
                doc.text(`${exp.fecha || 'N/A'} - ${exp.exploracion_id || 'N/A'}`, 25, y);
                y += 5;
                
                doc.setFont("helvetica", "normal");
                
                const hallazgos = [];
                if (exp.anhidrosis && exp.anhidrosis !== 'No') hallazgos.push(`Anhidrosis: ${exp.anhidrosis}`);
                if (exp.hiperhidrosis && exp.hiperhidrosis !== 'No') hallazgos.push(`Hiperhidrosis: ${exp.hiperhidrosis}`);
                if (exp.onicomicosis && exp.onicomicosis !== 'No') hallazgos.push(`Onicomicosis: ${exp.onicomicosis}`);
                
                if (hallazgos.length > 0) {
                    hallazgos.slice(0, 3).forEach(h => {
                        if (y > 280) nuevaPagina();
                        doc.text(`  • ${h}`, 30, y);
                        y += 5;
                    });
                } else {
                    doc.text(`  • Sin hallazgos relevantes`, 30, y);
                    y += 5;
                }
                y += 5;
            });
        }

        if (y > 250) nuevaPagina();
        
        y += 10;
        doc.line(70, y, 140, y);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Pdgo(a). ${p?.nombre_doctor || 'Médico'}`, 105, y + 7, { align: "center" });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Firma y Sello Autorizado", 105, y + 12, { align: "center" });

        doc.setFillColor(3, 105, 161);
        doc.rect(0, 280, 210, 17, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6.5);
        doc.text(`Reg: ${p?.registro_medico || 'N/A'} | Tel: ${p?.telefono_doctor || 'N/A'} | Email: ${p?.correo || user?.email || 'N/A'}`, 105, 287, { align: 'center' });
        doc.text(`Dir: ${p?.direccion_consultorio || 'No registrada'} | Dr(a). ${p?.nombre_doctor || 'Médico'} - PodoElite Pro`, 105, 292, { align: 'center' });

        doc.save(`Informe_${currentPaciente.cedula}.pdf`);
        return true;

    } catch (error) {
        console.error("Error al generar informe:", error);
        throw error;
    }
}