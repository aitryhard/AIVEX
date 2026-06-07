# AIVEX — AI Desktop Assistant

> Умный AI-ассистент для Windows с гибкой системой подписок и кастомизацией.

![preview](https://img.shields.io/badge/platform-Windows-blue)
![build](https://img.shields.io/badge/build-passing-brightgreen)

---

## Возможности

- **Чат с AI** — GPT-4o / GPT-4o-mini через OpenRouter
- **Профили** — Tutor, Programmer, Writer, Analyst, Creative + кастомные промпты
- **Изображения** — отправка скриншотов и буфера обмена в чат
- **Screen Peek** — автоматический анализ экрана каждые 10 секунд
- **Аудиозапись** — запись рабочего стола (Whisper)
- **Темы** — 9 пресетов + свой редактор (цвет панели, сообщений, прозрачность)
- **Подписки** — Free / Pro / Premium с разными лимитами

## Тарифы

| Free | Pro | Premium |
|------|-----|---------|
| 50 сообщений/день | ∞ сообщений | ∞ сообщений |
| GPT-4o-mini | GPT-4o + Vision | GPT-4o + Vision |
| 4 базовых темы | Все темы + кастомизация | Всё из Pro |
| Нет изображений | Изображения + аудио | + Приоритетная поддержка |
| | | + Ранний доступ |

## Сборка

```bash
git clone https://github.com/aitryhard/AIVEX.git
cd aivex
npm install
npm run tauri dev          # dev mode
```

**Продакшен-сборка:**
```bash
npm run tauri build        # .msi/.exe installer
```

## Архитектура

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Tauri App       │────▶│  Backend     │────▶│ OpenRouter  │
│  (React + Vite)  │     │  localhost   │     │ (GPT-4o)    │
│                  │     │  :8000       │     │             │
└────────┬─────────┘     └──────┬───────┘     └─────────────┘
         │                      │
         ▼                      ▼
┌─────────────────────────────────────┐
│  Activation Server (Render)         │
│  - Активация устройств              │
│  - Подписки / YooKassa             │
│  - Telegram admin bot               │
│  - Прокси для /chat (OpenRouter)   │
└─────────────────────────────────────┘
```

## Технологии

- **Frontend:** React 19, Vite, Framer Motion, Tailwind CSS, Lucide
- **Backend:** Python 3 + FastAPI, httpx, Whisper (локально)
- **Desktop:** Tauri 2, Rust
- **Server:** Python 3 + FastAPI, PostgreSQL (Render)
- **Payments:** YooKassa
- **AI:** OpenRouter (GPT-4o / GPT-4o-mini)

## Структура

```
aivex/
├── src/                 # React frontend
│   ├── components/      # Переиспользуемые компоненты
│   ├── hooks/           # Кастомные хуки
│   ├── layout/          # Панели / окна / шапка
│   ├── services/        # API-клиенты
│   ├── contexts/        # Контексты (Settings, Profile, Chat)
│   └── constants/       # Пресеты / конфиги
├── backend/             # Локальный Python-бэкенд
│   └── routes/          # /chat, /health, /transcribe-audio
├── src-tauri/           # Tauri shell (Rust)
└── package.json
server-activation/       # Сервер на Render
└── main.py              # FastAPI + PostgreSQL + Telegram Bot
```

## Лицензия

MIT
