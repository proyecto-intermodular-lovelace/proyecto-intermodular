# Guía de Contribución — Proyecto Intermodular Lovelace

Bienvenido/a al repositorio oficial del proyecto.  
Para mantener un flujo de trabajo profesional y ordenado, **todas las contribuciones deben seguir estas normas**.

⚠️ **Si no sigues estas reglas, tu PR será rechazada.**

---

# 🟦 1. Flujo de trabajo general

Este proyecto utiliza un flujo basado en:

- **Forks**
- **Ramas por funcionalidad**
- **Pull Requests (PR)**
- **Revisión por parte del responsable del proyecto (Pude)**

Nadie puede trabajar directamente sobre `main`.

---

# 🟩 2. NO trabajar directamente en este repositorio

❌ No hagas commits aquí  
❌ No hagas push aquí  
❌ No crees ramas aquí  
❌ No intentes hacer merge aquí

Este repositorio está protegido.  
Todo se hace desde tu **fork personal**.

---

# 🟨 3. Cómo contribuir correctamente

## PASO 1 — Haz un fork del repositorio

En la web de GitHub:

1. Entra al repositorio principal de la organización  
2. Arriba a la derecha → **Fork**

Esto crea tu copia personal.

---

## PASO 2 — Clona tu fork (NO el repo original)

Usa SSH:

```bash
git clone git@github.com:TU_USUARIO/proyecto-intermodular.git
cd proyecto-intermodular
```
---

## PASO 3 - Crea una rama para tu tarea

Nunca trabajas en main del proyecto original
Cada tarea debe tener su propia rama:

```bash
git checkout -b feature/nombre-de-la-tarea
```

Ejemplos:

1. feature/frontend-home
2. feature/backend-auth
3. feature/docker-config
4. fix/bug-login
5. docs/update-readme

---

## PASO 4 - Realiza commits claros (en inglés a poder ser)

Estándares oficiales: 

1. feat: nueva funcionalidad
2. fix: corregir error
3. docs: documentación
4. style: cambios de formato
5. refactor: reorganizar código
6. chore: tareas menores
7. test: añadir tests

Ejemplo: 

```bash 
git commit -m "feat: create endpoint of login with JWT"
```

---

## PASO 6 - Crea un Pull Request hacia la organización

En GitHub:

1. Entra a tu fork
2. Botón "Compare & Pull Request"
3. Configurar así:
  - Base repository: organización/proyecto-intermodular
  - Base branch: main
  - Compare: tu rama feature/...

---

## PASO 7 - Espera revisión del responsable

Tu PR puede quedar: 

1. Aprobada
2. Rechazada 
3. En espera de cambios 

No se hace merge sin revisión.

# 🟥 4. Normas de código obligatorias

## Backend (NestJS)

- Seguir arquitectura por módulos (Module -> Controller -> Service)
- No mezclar lógica del servicio en el controlador
- DTOs obligatorios con class-validator
- No hardcodear datos sensibles
- .env no se sube al repo

## Frontend (React + Vite)
- Componentes funcionales
- No meter lógica compleja en el JSX
- Evitar duplicar estilos
- No dejar console.log sueltos

---

# 🟦 5. Checklist antes de enviar tu Pull Request

Marca mentalmente:

- Estoy en una rama feature/...
- Mis commits son claros
- He probado que mi código funciona
- No he roto nada existente
- He limpiado logs y basura
- He seguido la estructura del proyecto
- Mi PR solo incluye lo necesario
- Estoy listo para revisión

---

# 🟩 6. Mantener tu fork actualizado

Para sincronizarte con el repo original:

```bash 
git remote add upstream git@github.com:proyecto-intermodular-lovelace/proyecto-intermodular.git
git pull upstream main
git push origin main
```

Haz esto antes de empezar cada tarea nueva.

# 🟫 7. Antes de pedir ayuda

Asegúrate de: 

1. Haber leído este documento
2. Comprobar tu rama (git branch)
3. Revisar tus commits (git log)
4. Ejecutar git status
5. Intentar resolverlo por tu cuenta

Si nada funciona -> pregunta a Jorge

---

