// js/ciudades.js - VERSIÓN CON DATOS LOCALES COMPLETOS
export async function cargarPaises() {
    return [
        { codigo: 'EC', nombre: 'Ecuador' },
        { codigo: 'CO', nombre: 'Colombia' },
        { codigo: 'PE', nombre: 'Perú' },
        { codigo: 'MX', nombre: 'México' },
        { codigo: 'ES', nombre: 'España' },
        { codigo: 'AR', nombre: 'Argentina' },
        { codigo: 'CL', nombre: 'Chile' },
        { codigo: 'US', nombre: 'Estados Unidos' },
        { codigo: 'BR', nombre: 'Brasil' },
        { codigo: 'VE', nombre: 'Venezuela' },
        { codigo: 'BO', nombre: 'Bolivia' },
        { codigo: 'PY', nombre: 'Paraguay' },
        { codigo: 'UY', nombre: 'Uruguay' },
        { codigo: 'CR', nombre: 'Costa Rica' },
        { codigo: 'PA', nombre: 'Panamá' }
    ];
}

export async function cargarCiudades(paisCodigo) {
    const ciudadesPorPais = {
        // ============================================
        // ECUADOR - TODAS LAS CIUDADES POR PROVINCIA
        // ============================================
        'EC': [
            // AZUAY
            'Cuenca', 'Gualaceo', 'Paute', 'Sígsig', 'Chordeleg', 'El Pan', 'Girón', 'Guachapala', 
            'Nabón', 'Oña', 'Pucará', 'San Fernando', 'Santa Isabel', 'Sevilla de Oro', 'Camilo Ponce Enríquez',
            
            // BOLÍVAR
            'Guaranda', 'San Miguel', 'Chillanes', 'Chimbo', 'Echeandía', 'Caluma', 'Las Naves',
            
            // CAÑAR
            'Azogues', 'Biblián', 'Cañar', 'La Troncal', 'El Tambo', 'Déleg', 'Suscal',
            
            // CARCHI
            'Tulcán', 'San Gabriel', 'El Ángel', 'Huaca', 'Bolívar', 'Mira',
            
            // CHIMBORAZO
            'Riobamba', 'Alausí', 'Guano', 'Chambo', 'Colta', 'Chunchi', 'Cumandá', 'Pallatanga', 'Penipe',
            
            // COTOPAXI
            'Latacunga', 'La Maná', 'Pujilí', 'Salcedo', 'Saquisilí', 'Sigchos',
            
            // EL ORO
            'Machala', 'Huaquillas', 'Pasaje', 'Santa Rosa', 'El Guabo', 'Arenillas', 'Zaruma', 
            'Piñas', 'Portovelo', 'Balsas', 'Marcabelí', 'Chilla', 'Atahualpa', 'Las Lajas',
            
            // ESMERALDAS
            'Esmeraldas', 'Rosa Zárate', 'San Lorenzo', 'Atacames', 'Muisne', 'Eloy Alfaro', 
            'Rioverde', 'La Concordia',
            
            // GALÁPAGOS
            'Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil',
            
            // GUAYAS
            'Guayaquil', 'Durán', 'Milagro', 'Daule', 'Samborondón', 'Playas', 'Salinas', 
            'La Libertad', 'Santa Elena', 'El Triunfo', 'Naranjal', 'Naranjito', 'Balao', 
            'Yaguachi', 'Pedro Carbo', 'Lomas de Sargentillo', 'Nobol', 'Colimes', 'Palestina', 
            'Santa Lucía', 'Coronel Marcelino Maridueña', 'Simón Bolívar', 'Isidro Ayora', 
            'General Villamil', 'El Empalme',
            
            // IMBABURA
            'Ibarra', 'Otavalo', 'Cotacachi', 'Antonio Ante', 'Pimampiro', 'Urcuquí',
            
            // LOJA
            'Loja', 'Catamayo', 'Macará', 'Cariamanga', 'Alamor', 'Celica', 'Zapotillo', 
            'Puyango', 'Paltas', 'Gonzanamá', 'Saraguro', 'Sozoranga', 'Chaguarpamba', 
            'Olmedo', 'Quilanga', 'Espíndola',
            
            // LOS RÍOS
            'Babahoyo', 'Quevedo', 'Ventanas', 'Vinces', 'Puebloviejo', 'Urdaneta', 'Montalvo', 
            'Palenque', 'Baba', 'Buena Fe', 'Valencia', 'Mocache', 'Quinsaloma',
            
            // MANABÍ
            'Portoviejo', 'Manta', 'Chone', 'El Carmen', 'Jipijapa', 'Montecristi', 'Sucre', 
            'Rocafuerte', 'Tosagua', 'Junín', 'Bolívar', 'Paján', 'Pichincha', 'Flavio Alfaro', 
            'Pedernales', 'Jama', 'San Vicente', 'Puerto López', 'Jaramijó', 'Olmedo', '24 de Mayo',
            
            // MORONA SANTIAGO
            'Macas', 'Gualaquiza', 'Sucúa', 'Palora', 'Huamboya', 'Santiago', 'Logroño', 
            'Pablo Sexto', 'Taisha', 'Tiwintza',
            
            // NAPO
            'Tena', 'Archidona', 'El Chaco', 'Quijos', 'Carlos Julio Arosemena Tola',
            
            // ORELLANA
            'Francisco de Orellana (Coca)', 'La Joya de los Sachas', 'Loreto', 'Aguarico',
            
            // PASTAZA
            'Puyo', 'Mera', 'Santa Clara', 'Arajuno',
            
            // PICHINCHA
            'Quito', 'Cayambe', 'Machachi', 'Sangolquí', 'Tabacundo', 'Pedro Vicente Maldonado', 
            'Puerto Quito', 'San Miguel de los Bancos', 'Pedro Moncayo', 'Rumiñahui',
            
            // SANTA ELENA
            'Santa Elena', 'Salinas', 'La Libertad',
            
            // SANTO DOMINGO
            'Santo Domingo', 'La Concordia',
            
            // SUCUMBÍOS
            'Nueva Loja', 'Shushufindi', 'La Bonita', 'Cascales', 'Cuyabeno', 'Gonzalo Pizarro', 'Putumayo',
            
            // TUNGURAHUA
            'Ambato', 'Baños', 'Pelileo', 'Píllaro', 'Cevallos', 'Mocha', 'Patate', 'Quero', 'Tisaleo',
            
            // ZAMORA CHINCHIPE
            'Zamora', 'Yantzaza', 'El Pangui', 'Zumbi', 'Palanda', 'Chinchipe', 'Nangaritza', 
            'Centinela del Cóndor', 'Paquisha'
        ].sort((a, b) => a.localeCompare(b)), // Orden alfabético
        
        // COLOMBIA
        'CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Santa Marta', 'Bucaramanga', 'Pereira', 'Cúcuta'],
        
        // PERÚ
        'PE': ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Iquitos', 'Huancayo', 'Pucallpa'],
        
        // MÉXICO
        'MX': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Cancún', 'Mérida', 'Querétaro'],
        
        // ESPAÑA
        'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Bilbao', 'Murcia', 'Palma'],
        
        // ARGENTINA
        'AR': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán', 'Mar del Plata'],
        
        // CHILE
        'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca'],
        
        // ESTADOS UNIDOS
        'US': ['Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Miami', 'Dallas', 'Atlanta', 'Boston', 'San Francisco'],
        
        // BRASIL
        'BR': ['São Paulo', 'Río de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba'],
        
        // VENEZUELA
        'VE': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'Barcelona'],
        
        // BOLIVIA
        'BO': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Oruro', 'Tarija', 'Potosí'],
        
        // PARAGUAY
        'PY': ['Asunción', 'Ciudad del Este', 'Encarnación', 'Pedro Juan Caballero', 'Coronel Oviedo'],
        
        // URUGUAY
        'UY': ['Montevideo', 'Salto', 'Paysandú', 'Rivera', 'Maldonado', 'Tacuarembó'],
        
        // COSTA RICA
        'CR': ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Liberia', 'Limón', 'Puntarenas'],
        
        // PANAMÁ
        'PA': ['Ciudad de Panamá', 'Colón', 'David', 'Santiago', 'Penonomé', 'Chitré']
    };
    
    return (ciudadesPorPais[paisCodigo] || ['Ciudad principal']).map(c => ({ 
        nombre: c, 
        id: c 
    }));
}