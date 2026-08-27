# Plan de Implementación - Fase 4: Motor Reactivador de Clientes por WhatsApp

Este plan detalla la creación del módulo de marketing y reactivación para EsthetiKare Pro.

## Cambios Propuestos

### Tipos y Modelos

#### [MODIFICAR] [index.ts](file:///C:/Users/DELL/OneDrive/Documentos/EsthetiKare/src/types/index.ts)
*   Añadir `lastCommercialContact?: string` a la interfaz `Client`.
*   (Opcional) Añadir `MarketingLog` para métricas históricas.

### Navegación y Rutas

#### [MODIFICAR] [App.tsx](file:///C:/Users/DELL/OneDrive/Documentos/EsthetiKare/src/App.tsx)
*   Añadir la ruta `/marketing`.

#### [MODIFICAR] [Layout.tsx](file:///C:/Users/DELL/OneDrive/Documentos/EsthetiKare/src/components/Layout.tsx)
*   Añadir el enlace "Reactivación" en el menú, utilizando el icono `Megaphone` o `Zap` de `lucide-react`.

### Vistas y Componentes

#### [NUEVO] [Marketing.tsx](file:///C:/Users/DELL/OneDrive/Documentos/EsthetiKare/src/pages/Marketing.tsx)
*   **Dashboard de Métricas**: Widgets con "Pacientes Inactivos", "Packs por Vencer" y "Cumpleaños".
*   **Segmentación**: Lista filtrable basada en lógica de fechas (Inactividad > 30 días, etc.).
*   **Gestor de Mensajes**:
    *   Selector de plantillas dinámicas.
    *   Editor de texto previo al envío.
    *   Lógica de placeholders (`{nombre}`, `{ultimoTratamiento}`).
*   **Lanzador WhatsApp**: Botón que abre el enlace `wa.me` y dispara la actualización de `lastCommercialContact` en el store.

### Store y Lógica

#### [MODIFICAR] [useStore.ts](file:///C:/Users/DELL/OneDrive/Documentos/EsthetiKare/src/store/useStore.ts)
*   Asegurar que `updateClient` permita persistir el `lastCommercialContact`.

## Plan de Verificación

### Pruebas Automatizadas
*   Validar la lógica de filtrado de fechas para los segmentos.
*   Verificar el reemplazo correcto de placeholders en las plantillas.

### Verificación Manual
*   Identificar un cliente inactivo en la lista de Marketing.
*   Seleccionar una plantilla y editarla.
*   Presionar "Enviar WhatsApp" y verificar que el enlace se genera correctamente.
*   Confirmar que la fecha de "Último Contacto" se actualiza en la ficha del cliente después del envío.
