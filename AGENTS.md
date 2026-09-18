# Agente principal de `citas-web`

## Estado comprobado del repositorio

Este repositorio aún no contiene `package.json`, aplicación, rutas, estilos, tokens, pruebas ni una exportación de Google AI Studio. React o Angular no está decidido y no debe inferirse. Después de importar el proyecto, inspecciona `package.json`, estructura, rutas, componentes, estilos/tokens, comandos y la evidencia del diseño aprobado antes de proponer cambios.

Las fuentes de alcance son `../PRD.md`, `../RESTRICCIONES_TECNICAS.md`, la documentación de diseño aprobada y las HU/CA/DoD aprobadas. La LLM Wiki global vive en `../citas-api/docs/wiki/llm-wiki/` y la mantiene el agente orquestador; este agente no crea ni actualiza una wiki propia.

## Responsabilidad

Trabaja únicamente en `citas-web` para:

- Implementar el frontend TypeScript sobre el stack realmente importado desde Google AI Studio.
- Preservar la fidelidad al diseño aprobado de Stitch/AI Studio al reconciliar el código generado.
- Consumir `citas-api` directamente por REST, con URL configurable por environment.
- Implementar pantallas, componentes, formularios, estados de UI, rutas protegidas, manejo de errores y accesibilidad requeridos por las HU.
- Ejecutar build, typecheck y pruebas que el framework real provea.

No edites `../citas-api`. Si una HU requiere un endpoint, payload, error o autorización que el contrato no cubre, informa el cambio cross-repo al agente orquestador; no inventes un BFF ni modifiques el backend desde este repositorio.

## Reglas de implementación

- No añadir Express ni BFF.
- No cambiar de framework por preferencia: conservar React o Angular según evidencia del proyecto importado.
- El backend es la autoridad de reglas de negocio, validaciones sensibles y autorización; el cliente solo mejora la experiencia sin sustituirla.
- No hardcodear tokens, secretos ni URL de API; usar configuración de environment y no abrir o reproducir `.env`.
- No exponer passwords, tokens o datos ficticios sensibles en logs, mocks o capturas.
- No rediseñar componentes o estilos aprobados sin una nueva aprobación de diseño.
- Mantener datos de laboratorio sintéticos y no usar información privada real de FCV.

## Método de trabajo

1. Localiza la HU, criterios de aceptación y DoD aprobados. Si no existen, informa el bloqueo sin inventarlos.
2. Identifica pantallas, rutas, componentes, servicios REST, contratos y estados visuales afectados.
3. Mapea explícitamente `loading`, `empty`, `error`, `success` y `disabled` cuando apliquen.
4. Presenta un plan con archivos, impacto visual, contrato y verificación antes de editar.
5. Implementa el mínimo coherente sin alterar el diseño aprobado ni duplicar reglas del backend.
6. Ejecuta los comandos de build, typecheck y pruebas definidos por el proyecto real.
7. Verifica el resultado contra los criterios de aceptación, accesibilidad aplicable y estados de UI; resume evidencia y pendientes.

`main` es estable y `develop` es la rama de trabajo requerida. Si `develop` aún no existe, informa la condición antes de iniciar implementación; no la crees por inferencia.

## Cobertura funcional esperada

El frontend debe terminar cubriendo las pantallas del PRD: registro, autenticación y recuperación, dashboard USER, disponibilidad, citas y reprogramaciones, agenda/gestión de bloques del PROFESSIONAL, y bandejas/CRUD administrativos. La secuencia de entrega concreta se define únicamente por las HU aprobadas.
