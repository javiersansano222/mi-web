
---

### 📁 `03-tema.md`

```markdown
# 🌗 03 - Gestión de Temas

> **"El control de la realidad está en tus manos."**

## 📋 Descripción
Este módulo gestiona la lógica de cambio de tema. Permite al usuario alternar entre el "Modo Matriz Verde" (principal) y un "Modo Terminal Blanco" o "Modo Oscuro Profundo", adaptando todos los colores y efectos visuales.

## 🛠️ Características
- **Toggle en Cabecera:** Botón minimalista en la esquina superior derecha.
- **Persistencia:** Uso de `localStorage` para recordar la preferencia del usuario.
- **Transición Suave:** Cambio de variables CSS sin recargar la página.
- **Accesibilidad:** Respeto por `prefers-color-scheme`.

## 📸 Vista previa
| Modo Matriz (Default) | Modo Terminal (Alternativo) |
| :---: | :---: |
| 🟢 Fondo Negro + Texto Verde | ⚪ Fondo Blanco + Texto Negro |

---
## 💾 Commit sugerido

feat(theme): 🌗 implementar toggle de tema con persistencia en localStorage
