# Smart Quiz (React + Flask)

Production-oriented fullstack quiz app for collecting interior design project leads.

## Project Structure

- `frontend/` — React + Vite + Tailwind + Framer Motion multi-step quiz.
- `backend/` — Flask JSON API with CORS restriction, validation, sanitization, rate limiting, duplicate-submit protection, and secure headers.

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## API

`POST /api/quiz/submit`

Response success:

```json
{ "success": true, "message": "Заявка успешно отправлена" }
```

Response error:

```json
{ "success": false, "message": "Не удалось отправить заявку" }
```
