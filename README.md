# Smart Quiz (React + Flask)

Production-oriented fullstack quiz app for collecting interior design project leads.

## Структура проекта

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

Проект: смарт-квиз для сбора заявок на разработку дизайн-проекта помещения. Задача: упростить процесс сбора заказов для дизайнеров проектов

Ржевский Иван бэкенд, фронтенд
Кардашьян Арсений бэкенд
Грицай Ирина фронтенд
Ковалёв Кирилл фронтенд
Ржевский Роман фронтенд

Пользователь открывает квиз,
отвечает на вопрос первого шага,
переходит к следующему шагу,
проходит все вопросы по очереди,
на последнем шаге вводит контактные данные,
отправляет заявку,
получает сообщение об успешной отправке.