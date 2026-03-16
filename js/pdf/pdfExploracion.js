// js/pdf/pdfExploracion.js
import { supabase } from '../../config.js';

export async function generarPDFExploracion(exploracionId) { // 👈 RECIBE EL ID
    try {
        console.log("🔍 Buscando exploración con ID:", exploracionId);
        
        if (!exploracionId) throw new Error("ID de exploración no válido");
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No hay sesión activa");
        
        const { data: exploracion, error } = await supabase
            .from('exploracion_fisica')
            .select('*')
            .eq('exploracion_id', exploracionId)
            .maybeSingle();
        
        if (error) throw error;
        if (!exploracion) throw new Error(`No se encontró exploración con ID: ${exploracionId}`);
        
        console.log("✅ Exploración encontrada:", exploracion);
        
        const { data: perfil, error: perfilError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (perfilError) console.warn("Perfil no encontrado, usando valores por defecto");
        
        const p = perfil || {};
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // CONFIGURACIÓN
        const CONFIG = {
            tamanioTitulo: 11,
            tamanioContenido: 10,
            tamanioEncabezado: 8,
            tamanioPie: 6.5,
            margenIzquierdo: 20,
            margenDerecho: 20,
            espaciadoLinea: 6,
            limitePagina: 270
        };

        // FUNCIÓN NUEVA PÁGINA
        function nuevaPagina() {
            doc.addPage();
            y = 30;
            
            doc.setFillColor(240, 240, 240);
            doc.rect(0, 0, 210, 10, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(CONFIG.tamanioEncabezado);
            doc.text(`Página ${pagina}`, 105, 7, { align: "center" });
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(CONFIG.tamanioContenido);
            doc.setFont("helvetica", "normal");
        }

        // ENCABEZADO
        doc.setFillColor(3, 105, 161);
        doc.rect(0, 0, 210, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(p?.centro_medico || "PODOELITE PRO", 55, 18);
        
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
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Dr(a). ${p?.nombre_doctor || user?.email || 'Médico'}`, 55, 25);
        doc.text(`Reg: ${p?.registro_medico || 'N/A'}`, 55, 32);
        doc.text(`Tel: ${p?.telefono_doctor || 'N/A'}`, 55, 39);

        // TÍTULO
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("INFORME DE EXPLORACIÓN PODOLÓGICA", 105, 58, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Paciente: ${exploracion.nombre_paciente || 'N/A'}`, 20, 70);
        doc.text(`Cédula: ${exploracion.cedula_paciente || 'N/A'}`, 20, 77);
        doc.text(`ID: ${exploracion.exploracion_id || 'N/A'}`, 20, 84);
        doc.text(`Fecha: ${exploracion.fecha || 'N/A'} - Hora: ${exploracion.hora_cita || 'N/A'}`, 20, 91);

        let y = 105;
        let pagina = 1;

        // FUNCIÓN AGREGAR SECCIÓN
        function agregarSeccion(titulo, items) {
            const itemsConValor = items.filter(([label, valor]) => 
                valor && valor !== '' && valor !== 'Seleccione' && valor !== 'No'
            );
            
            if (itemsConValor.length === 0) return;
            
            if (y > CONFIG.limitePagina - 15) {
                nuevaPagina();
            }
            
            doc.setFillColor(240, 240, 240);
            doc.rect(15, y-5, 180, 8, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(CONFIG.tamanioTitulo);
            doc.text(titulo, 20, y);
            y += 8;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(CONFIG.tamanioContenido);
            
            itemsConValor.forEach(([label, valor]) => {
                if (y > CONFIG.limitePagina) {
                    nuevaPagina();
                }
                
                let texto = `• ${label}: ${valor}`;
                if (texto.length > 80) {
                    texto = texto.substring(0, 77) + '...';
                }
                
                doc.text(texto, 25, y);
                y += CONFIG.espaciadoLinea;
            });
            
            y += 3;
        }

        // SECCIONES
        agregarSeccion("1. EXAMEN DERMATOLÓGICO", [
            ['Anhidrosis', exploracion.anhidrosis],
            ['Hiperhidrosis', exploracion.hiperhidrosis],
            ['Bromohidrosis', exploracion.bromohidrosis],
            ['Epidermofitosis', exploracion.epidermofitosis],
            ['Úlceras', exploracion.ulceras],
            ['Grietas', exploracion.grietas],
            ['Onicomicosis', exploracion.onicomicosis],
            ['Onicogrifosis', exploracion.onicogrifosis],
            ['Onicocriptosis', exploracion.onicocriptosis],
            ['Verruga Plantar', exploracion.verruga_plantar],
            ['Nevos', exploracion.nevos],
            ['LEPS', exploracion.leps],
            ['Otros', exploracion.otros_examen_dermatol]
        ]);

        agregarSeccion("2. EXAMEN ORTOPÉDICO", [
            ['Pie Plano', exploracion.pie_plano],
            ['Pie Cavo', exploracion.pie_cavo],
            ['Pie Valgo', exploracion.pie_valgo],
            ['Pie Equino', exploracion.pie_equino],
            ['Pie Talus', exploracion.pie_talus]
        ]);

        agregarSeccion("2.1 DACTILOPATÍAS", [
            ['Sindactilia', exploracion.sindactilia],
            ['Polidactilia', exploracion.polidactilia],
            ['Dedo en Garra', exploracion.dedo_en_garra],
            ['Dedo en Martillo', exploracion.dedo_en_martillo],
            ['Dedo en Maso', exploracion.dedo_en_maso],
            ['Espolón Calcáneo', exploracion.espolon_calcaneo],
            ['Exóstosis Post Superior', exploracion.exostosis_post_superior],
            ['Exóstosis Post Inferior', exploracion.exostosis_post_inferior],
            ['Quinto Dedo Varo', exploracion.quinto_dedo_varo],
            ['Otras', exploracion.otras_examen_ortopedico]
        ]);

        agregarSeccion("3. EXAMEN ORTOPODOLÓGICO", [
            ['Fórmula Cuadrado', exploracion.formula_cuadrado],
            ['Fórmula Egipcio', exploracion.formula_egipcio],
            ['Fórmula Griego', exploracion.formula_griego]
        ]);

        agregarSeccion("3.1 TIPO DE MARCHA", [
            ['Marcha Normal', exploracion.marcha_normal],
            ['Marcha Patológica', exploracion.marcha_patologica],
            ['Otro tipo', exploracion.otras_tipo_marcha]
        ]);

        agregarSeccion("3.2 DEDOS Y HALLUX", [
            ['Dedo Supraductos', exploracion.dedo_supraductos],
            ['Dedo Infraductus', exploracion.dedo_infraductus],
            ['Hallux Valgus', exploracion.hallux_valgus],
            ['Hallux Varus', exploracion.hallux_varus],
            ['Hallux Separatus', exploracion.hallux_separatus],
            ['Hallux Rígidus', exploracion.hallux_rigidus],
            ['Hallux Flexus', exploracion.hallux_flexus],
            ['Otras', exploracion.otras_hallux_dedos]
        ]);

        agregarSeccion("4. NEUROLOGÍA", [
            ['Reflejo Aquileano', exploracion.reflejo_aquileano],
            ['Reflejo Rotuliano', exploracion.reflejo_rotuliano],
            ['Anestesia', exploracion.anestesia],
            ['Parestesia', exploracion.parestesia],
            ['Hipoestesia', exploracion.hipoestesia],
            ['Otros', exploracion.otros_examen_neurologico]
        ]);

        agregarSeccion("5. EXAMEN ANGIOLÓGICO", [
            ['Insuf Arterial Crónica', exploracion.insuf_arterial_cronica],
            ['Insuf Arterial Aguda', exploracion.insuf_arterial_aguda],
            ['Varices', exploracion.varices],
            ['Microvarices', exploracion.microvarices],
            ['Linfangitis', exploracion.linfangitis],
            ['Linfedema', exploracion.linfedema],
            ['Mal Perf Plantar', exploracion.mal_perf_plantar],
            ['Flebitis', exploracion.flebitis]
        ]);

        agregarSeccion("5.1 PULSOS", [
            ['Pulso Pedio', exploracion.pulso_pedio],
            ['Pulso Tibial Posterior', exploracion.pulso_tibial_posterior],
            ['Pulso Poplíteo', exploracion.pulso_popliteo]
        ]);

        agregarSeccion("5.2 TIPO DE CALZADO", [
            ['Deportivo', exploracion.calzado_deportivo],
            ['Alto', exploracion.calzado_alto],
            ['Estrecho', exploracion.calzado_estrecho],
            ['Punta Fina', exploracion.calzado_punta_fina],
            ['Botas', exploracion.calzado_botas],
            ['Sandalias', exploracion.calzado_sandalias]
        ]);

        agregarSeccion("5.3 TIPO DE PULSO", [
            ['Fuerte Lento', exploracion.tipo_pulso_fuerte_lento],
            ['Fuerte Rápido', exploracion.tipo_pulso_fuerte_rapido],
            ['Débil Lento', exploracion.tipo_pulso_debil_lento],
            ['Débil Rápido', exploracion.tipo_pulso_debil_rapido]
        ]);

        agregarSeccion("5.4 VELLOSIDAD", [
            ['Normal', exploracion.vellosidad_normal],
            ['Disminuida', exploracion.vellosidad_disminuida],
            ['Nula', exploracion.vellosidad_nula],
            ['Otros', exploracion.otra_vellosidad]
        ]);

        agregarSeccion("6. EXAMEN PODOLÓGICO", [
            ['H. Sin Núcleo', exploracion.h_sin_nucleo],
            ['H. S. N. Complicada', exploracion.h_s_n_compl],
            ['H. Con Núcleo', exploracion.h_con_nucleo],
            ['H. C. N. Complicada', exploracion.h_c_n_compl],
            ['Queratodermia', exploracion.queratodermia],
            ['Otras', exploracion.otras_examen_podol]
        ]);

        agregarSeccion("6.1 DEFORMIDADES", [
            ['Varo Antepie', exploracion.def_varo_antepie],
            ['Varo Talón', exploracion.def_varo_talon],
            ['Valgo Antepie', exploracion.def_valgo_antepie],
            ['Valgo Talón', exploracion.def_valgo_talon],
            ['Equino', exploracion.def_equino],
            ['Mecedora', exploracion.def_mecedora]
        ]);

        agregarSeccion("7. EXÁMENES COMPLEMENTARIOS", [
            ['Pedigrafía', exploracion.pedigrafia],
            ['Pletismografía', exploracion.pletismografia],
            ['Antibiograma', exploracion.antibiograma],
            ['Hemograma', exploracion.hemograma],
            ['Examen Marcha', exploracion.examen_marcha],
            ['Podoscopia', exploracion.podoscopia],
            ['Micológico', exploracion.micologico],
            ['Roentgnograma', exploracion.roetngnograma],
            ['Coagulación', exploracion.coagulacion],
            ['Oscilometría', exploracion.oscilometria],
            ['Bacteriológico', exploracion.bacteriologico],
            ['Glucemia', exploracion.glucemia],
            ['Aneste', exploracion.aneste],
            ['Otros', exploracion.otros_complementarios]
        ]);

        // FIRMA
        if (y > CONFIG.limitePagina - 20) {
            nuevaPagina();
        } else if (y < 200) {
            y = y + 20;
        }
        
        doc.line(70, y, 140, y);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(CONFIG.tamanioTitulo);
        doc.text(`Dr(a). ${p?.nombre_doctor || 'Médico'}`, 105, y + 7, { align: "center" });
        
        doc.setFontSize(CONFIG.tamanioEncabezado);
        doc.setFont("helvetica", "normal");
        doc.text("Firma y Sello Autorizado", 105, y + 12, { align: "center" });

        // PIE DE PÁGINA
        doc.setFillColor(3, 105, 161);
        doc.rect(0, 280, 210, 17, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(CONFIG.tamanioPie);
        doc.text(`Reg: ${p?.registro_medico || 'N/A'} | Tel: ${p?.telefono_doctor || 'N/A'} | Email: ${p?.correo || user?.email || 'N/A'}`, 105, 287, { align: 'center' });
        doc.text(`Dir: ${p?.direccion_consultorio || 'No registrada'} | Dr(a). ${p?.nombre_doctor || 'Médico'} - PodoElite Pro`, 105, 292, { align: 'center' });

        doc.save(`Exploracion_${exploracion.exploracion_id || 'paciente'}.pdf`);
        console.log("✅ PDF generado correctamente");

    } catch (error) {
        console.error("❌ Error completo:", error);
        throw error; // Lanza el error para manejarlo en examen.html
    }
}