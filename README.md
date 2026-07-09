# 🧠 ZapataAntiFinal — Sistema de Memorización Matemática Basado en Ciencia Cognitiva

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.dotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase%20%2F%20Postgres-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest%20%2F%20RTL-orange?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Methodology](https://img.shields.io/badge/Methodology-SDD%20(Spec--driven)-purple?style=for-the-badge&logo=github)](https://github.com/github/spec-kit)

---

## 📋 Datos Estudiantiles & Académicos
* **Estudiante:** Manuel Ore Huasaja
* **Código / Serie:** Serie 400
* **Carrera Profesional:** Ingeniería de Sistemas
* **Curso:** Calidad de Software

---

## 🎯 Explicación del Proyecto

**ZapataAntiFinal** es una plataforma de software web y móvil diseñada bajo principios de **psicología cognitiva y neurociencia del aprendizaje**. El objetivo central del sistema es mitigar la curva del olvido al memorizar fórmulas matemáticas de alta complejidad conceptual.

A diferencia de los métodos de estudio lineales, la aplicación implementa una máquina de estados finitos que segmenta la sesión de estudio de cada nivel en tres fases cognitivas cruciales administradas por el motor transaccional del sistema (`useGameEngine.ts`):

1. **Fase de Exposición (`EXPOSURE` - 30 segundos):** El estudiante realiza una fijación visual y lógica de la ecuación matemática compleja, renderizada mediante notación científica avanzada en **LaTeX a través de KaTeX**.
2. **Fase de Distracción (`DISTRACTOR` - 8 segundos):** Se induce al usuario a resolver ejercicios aritméticos simples a gran velocidad. Esto limpia intencionalmente la memoria RAM del cerebro (memoria de trabajo a corto plazo) sacando la fórmula compleja de su foco.
3. **Fase de Recuperación (`RECOVERY`):** La fórmula desaparece por completo. El estudiante es forzado a realizar una **recuperación activa** desde la memoria a largo plazo para seleccionar la estructura correcta. Las elecciones erróneas decrementan un indicador gamificado denominado **Energía Neural** (25 puntos por fallo).

---

## 🛠️ Arquitectura de Software

El proyecto se divide en módulos usando la arquitectura del **App Router de Next.js**:
* **`(mobile)`**: Enrutamiento optimizado *Mobile-First* para la experiencia del estudiante (autenticación, mapa de niveles interactivos de estilo gamificado y sala de juego)/page.tsx].
* **`(desktop)/admin`**: Panel administrativo responsivo para el diseño de cursos, donde los docentes pueden estructurar niveles y previsualizar fórmulas matemáticas en tiempo real.
* **`api/`**: Controladores de endpoints asíncronos para almacenar progresos y cargar configuraciones relacionales desde Supabase.
* **`supabase/migrations/`**: Esquema e infraestructura de datos relacionales SQL con políticas activas de **Row Level Security (RLS)** para mitigar vulnerabilidades e inyecciones de datos no autorizadas a nivel de servidor.

---

## 🧪 Pilares de Calidad de Software Aplicados

Para cumplir con las métricas exigidas en el aseguramiento de la calidad de aplicaciones de software, el proyecto implementa:

1. **SDD (Spec-driven Development):** El diseño funcional está respaldado por especificaciones vivas en `/specs` generadas por herramientas de automatización de código de **Spec Kit**. Esto asegura la consistencia entre los contratos de datos establecidos de la API y el código funcional definitivo.
2. **Pruebas Unitarias Automatizadas (Vitest + Testing Library):** Cobertura del núcleo de la aplicación. Se prueban los cambios lógicos de los temporizadores asíncronos del Hook `useGameEngine.ts` aislando los efectos secundarios del navegador de manera predecible.

Ejecución de la suite de pruebas del sistema:
```bash
# Modo de observación interactiva
npm run test

# Modo de ejecución de reporte de una sola pasada (CI/CD)
npm run test:run
