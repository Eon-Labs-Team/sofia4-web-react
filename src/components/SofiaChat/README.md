# sofIA Chat - Asistente Inteligente

## Descripción

sofIA Chat es un componente de chat inteligente integrado en el sidebar de la aplicación que permite a los usuarios interactuar con la API de sofIA para obtener análisis de datos, generar gráficos y recibir respuestas inteligentes sobre el sistema.

## Características

- **Chat Conversacional**: Interfaz tipo ChatGPT para preguntas y respuestas
- **Generación de Gráficos**: Renderiza automáticamente charts de Chart.js basados en la respuesta de la API
- **Configuración de Conexión**: Campos editables para connection string y enterprise ID
- **Modos de Vista**: Expandido, minimizado y cerrado
- **Exportación de Datos**: Botones para copiar y descargar información
- **Responsive**: Se adapta al estado colapsado del sidebar

## Uso

### En el Sidebar

El botón de sofIA Chat se encuentra en el menú lateral con el ícono de bot 🤖. Al hacer clic se abre la interfaz del chat.

### Funcionalidades

1. **Configuración**: 
   - Connection String de MongoDB
   - Enterprise ID

2. **Chat**:
   - Envío de mensajes con Enter
   - Historial de conversación
   - Indicador de carga

3. **Visualización**:
   - Gráficos de barras, líneas, pie y doughnut
   - Datos tabulares con contador de registros
   - Botones de acción para cada visualización

4. **Controles**:
   - Minimizar/Maximizar
   - Cerrar chat
   - Copiar datos al portapapeles

## API

El componente se conecta al endpoint:
```
POST http://localhost:3000/api/sofia
```

### Payload
```json
{
  "connectionString": "mongodb://...",
  "enterpriseId": "6898f0391766d0e9d498f365",
  "prompt": "Lista de productos del inventario"
}
```

### Respuesta Esperada
```json
{
  "success": true,
  "data": {
    "interpretation": "Análisis de los datos...",
    "visualization": {
      "type": "bar",
      "config": { /* Configuración de Chart.js */ }
    },
    "result": [ /* Datos */ ]
  }
}
```

## Dependencias

- `chart.js`: Librería de gráficos
- `react-chartjs-2`: Wrapper de React para Chart.js
- Componentes UI de la aplicación (Button, Input, Card, etc.)

## Estructura de Archivos

```
src/components/SofiaChat/
├── SofiaChat.tsx      # Componente principal
├── index.ts           # Exportación
└── README.md          # Esta documentación
```

## Personalización

El componente puede ser personalizado modificando:
- Colores y estilos en las clases de Tailwind
- Tipos de gráficos soportados
- Configuración por defecto de Chart.js
- Mensajes de bienvenida y error

## Estado

El componente utiliza el hook `useSofiaChat` que maneja:
- `isChatOpen`: Si el chat está abierto
- `isChatMinimized`: Si está minimizado
- Funciones para abrir, cerrar y cambiar tamaño
