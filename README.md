# Prueba tecnica frontend Angular

Aplicacion Angular 15 compatible con Angular 14+, implementada con NgModule, arquitectura feature-first y estilos propios sin frameworks CSS ni librerias de componentes.

## Backend esperado

El frontend consume el backend local en:

```bash
http://localhost:3002
```

Endpoints usados:

- `GET /bp/products`
- `GET /bp/products/:id`
- `GET /bp/products/verification/:id`
- `POST /bp/products`
- `PUT /bp/products/:id`

## Alcance implementado

- F1 listado de productos.
- F2 busqueda client-side.
- F3 select `5`, `10`, `20` como limite visual del listado.
- F4 agregar producto.
- F5 editar producto.
- Rutas:
  - `/products`
  - `/products/new`
  - `/products/:id/edit`

F6 eliminar producto queda fuera del alcance principal para priorizar calidad, validaciones y coverage.

## Comandos

```bash
npm install
npm start
npm run build
npm run test:ci
```

## Testing

La suite cubre servicio HTTP, validadores, listado, busqueda, limite visual, rutas principales y flujos criticos del formulario.

Resultado actual:

```text
26 tests exitosos
Statements: 79.62%
Branches: 65%
Functions: 81.39%
Lines: 79.04%
```
