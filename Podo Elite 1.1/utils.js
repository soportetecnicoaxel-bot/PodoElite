// utils.js - VERSIÓN FINAL PROFESIONAL
import { supabase } from './config.js';

// ============================================
// CONFIGURACIÓN DE ENTORNO
// ============================================
const ES_PRODUCCION = window.location.hostname !== 'localhost' && 
                     !window.location.hostname.includes('127.0.0.1');

// ============================================
// MANEJO DE ERRORES SEGURO
// ============================================
export function manejarError(error, contexto = '') {
    // En producción, NO mostrar detalles al usuario
    if (ES_PRODUCCION) {
        console.error(`[Error en ${contexto}]:`, error?.message || 'Error desconocido');
        // Solo mostrar mensaje genérico al usuario
        notificar('error', 'Ocurrió un error. Por favor intenta de nuevo.');
    } else {
        // En desarrollo, mostrar todo
        console.error(`❌ Error en ${contexto}:`, error);
        if (error?.message) {
            notificar('error', error.message);
        }
    }
}

// ============================================
// SILENCIAR CONSOLA EN PRODUCCIÓN
// ============================================
if (ES_PRODUCCION) {
    // Guardar funciones originales
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    // Reemplazar con versiones filtradas
    console.error = function(...args) {
        // Solo mostrar errores críticos de Supabase
        if (args[0]?.includes?.('supabase') || args[0]?.includes?.('storage')) {
            originalError.apply(console, ['🔒', ...args]);
        }
    };
    
    console.warn = function() {}; // Silenciar warnings
    console.log = function() {};  // Silenciar logs
}

// ============================================
// 1. VERIFICAR SUSCRIPCIÓN
// ============================================
export async function verificarSuscripcion() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!user) { 
            window.location.href = "index.html"; 
            return false; 
        }
        
        const { data: perfil, error: perfilError } = await supabase
            .from('perfiles')
            .select('suscripcion')
            .eq('id', user.id)
            .maybeSingle();
        
        if (perfilError) throw perfilError;
            
        // 👇 NUEVO: Si la suscripción está vencida, REDIRIGE AL MÓDULO DE PAGO
        if (perfil?.suscripcion === 'vencido') {
            // Guardar en localStorage que venía de una redirección
            localStorage.setItem('redirect_after_payment', window.location.pathname);
            // Redirigir a la página de pagos
            window.location.href = "pago.html";
            return false;
        }
        
        // Si la suscripción no existe (nuevo usuario), también a pagos
        if (!perfil?.suscripcion) {
            window.location.href = "pago.html";
            return false;
        }
        
        return true;
        
    } catch (error) {
        manejarError(error, 'verificarSuscripcion');
        return false;
    }
}

// ============================================
// 2. LOADING
// ============================================
export function mostrarLoading(mostrar) {
    try {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.style.cssText = `
                position:fixed; top:0; left:0; width:100%; height:100%;
                background:rgba(255,255,255,0.95); display:none;
                justify-content:center; align-items:center; z-index:99999;
                backdrop-filter:blur(5px);
            `;
            overlay.innerHTML = `
                <div style="text-align:center;">
                    <div style="border:6px solid #e2e8f0; border-top-color:#0284c7; border-radius:50%; width:60px; height:60px; animation:spin 1s linear infinite; margin-bottom:20px;"></div>
                    <p style="color:#0284c7; font-weight:600;">Procesando...</p>
                </div>
                <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = mostrar ? 'flex' : 'none';
    } catch (error) {
        console.error('Error en loading:', error);
    }
}

// ============================================
// 3. CERRAR SESIÓN
// ============================================
export async function cerrarSesion() {
    try {
        const result = await Swal.fire({
            title: '¿Cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            mostrarLoading(true);
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        }
    } catch (error) {
        manejarError(error, 'cerrarSesion');
        mostrarLoading(false);
    }
}

// ============================================
// 4. NOTIFICACIONES RÁPIDAS
// ============================================
export function notificar(tipo, mensaje) {
    try {
        const tipos = {
            exito: { icon: 'success', titulo: '¡Éxito!', timer: 2000 },
            error: { icon: 'error', titulo: 'Error', timer: 3000 },
            info: { icon: 'info', titulo: 'Información', timer: 3000 },
            warning: { icon: 'warning', titulo: 'Atención', timer: 3000 }
        };
        
        const config = tipos[tipo] || tipos.info;
        
        Swal.fire({
            icon: config.icon,
            title: config.titulo,
            text: ES_PRODUCCION && tipo === 'error' ? 'Ocurrió un error' : mensaje,
            timer: config.timer,
            showConfirmButton: tipo !== 'exito'
        });
    } catch (error) {
        console.error('Error en notificación:', error);
    }
}

// ============================================
// 5. CONFIRMAR ACCIONES
// ============================================
export async function confirmar(mensaje, textoBoton = 'Sí, continuar') {
    try {
        const result = await Swal.fire({
            title: '¿Confirmar?',
            text: mensaje,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0284c7',
            cancelButtonColor: '#64748b',
            confirmButtonText: textoBoton,
            cancelButtonText: 'Cancelar'
        });
        return result.isConfirmed;
    } catch (error) {
        manejarError(error, 'confirmar');
        return false;
    }
}

// ============================================
// 6. SANITIZAR HTML (protección XSS)
// ============================================
export function sanitizarHTML(html) {
    try {
        if (!html) return '';
        if (window.DOMPurify) {
            return window.DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'li', 'span', 'div', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
                ALLOWED_ATTR: ['class', 'id', 'style']
            });
        }
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    } catch (error) {
        console.error('Error sanitizando HTML:', error);
        return '';
    }
}