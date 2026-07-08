# API & Component Contracts: Math Memorization MVP

This document defines the data contracts between the client and server (API/Server Actions) and key component interface contracts.

## 1. Client-Server Contracts (API Routes or Server Actions)

These contracts define how the Next.js client interacts with Supabase to load levels, verify progress, and save session completions.

### GET `/api/levels` (Fetch Levels by Channel)

Loads levels for a specific learning channel, merging status flags based on the user's progress.

*   **Request**:
    *   **Method**: `GET`
    *   **Query Parameters**:
        *   `channel`: `aritmética` | `álgebra` | `física` (Required)
*   **Response (200 OK)**:
    ```json
    {
      "channel": "aritmética",
      "levels": [
        {
          "id": "8f830a3b-2bd4-44df-9e45-b4bb183e8b08",
          "title": "Suma de Fracciones",
          "status": "active",
          "formula_latex": "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}",
          "order_index": 1,
          "completed": true,
          "energy_score": 100,
          "analogy": {
            "question_text": "Si tienes media pizza y sumas un tercio de otra, ¿qué porción de pizza total tienes?",
            "image_url": "https://storage.supabase.co/object/public/analogy-images/pizza-sum.png",
            "options": [
              "5/6 de pizza",
              "2/5 de pizza",
              "2/3 de pizza",
              "3/4 de pizza"
            ]
          }
        },
        {
          "id": "e4f8d976-78ab-41c3-88cc-b0c6a5d4e321",
          "title": "Ecuaciones Lineales",
          "status": "active",
          "formula_latex": "ax + b = c \\implies x = \\frac{c-b}{a}",
          "order_index": 2,
          "completed": false,
          "energy_score": null,
          "analogy": null
        },
        {
          "id": "11a22b33-cc44-55dd-66ee-77ff88aa99bb",
          "title": "Cálculo dx Opcional",
          "status": "dx",
          "formula_latex": "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
          "order_index": 3,
          "completed": false,
          "energy_score": null,
          "analogy": null
        }
      ]
    }
    ```

---

### POST `/api/progress` (Save Level Completion)

Submits the student's level completion data, records the score, and calculates whether the next level should be unlocked.

*   **Request**:
    *   **Method**: `POST`
    *   **Headers**: `Content-Type: application/json`
    *   **Body**:
        ```json
        {
          "level_id": "e4f8d976-78ab-41c3-88cc-b0c6a5d4e321",
          "energy_score": 75
        }
        ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Progress recorded successfully.",
      "unlocked_level_id": "11a22b33-cc44-55dd-66ee-77ff88aa99bb"
    }
    ```
*   **Response (400 Bad Request)**: Invalid score or missing payload.
*   **Response (401 Unauthorized)**: Session expired or invalid authentication credentials.

---

## 2. Frontend Component & Hook Contracts

### Hook Contract: `useGameEngine`

The state hook controlling the 3-phase timing logic.

*   **Inputs**:
    *   `levelId`: `string`
    *   `onComplete`: `(finalScore: number) => void`
*   **Outputs**:
    *   `phase`: `'EXPOSURE'` | `'DISTRACTOR'` | `'RECOVERY'`
    *   `timeLeft`: `number` (seconds remaining in current phase, `null` in Phase 3)
    *   `neuralEnergy`: `number` (starts at 100, decreases on wrong choices in Phase 3)
    *   `isCompleted`: `boolean`
    *   `skipExposure`: `() => void` (triggers skip from Phase 1 to Phase 2)
    *   `submitAnswer`: `(option: string) => boolean` (validates selection in Phase 3)
