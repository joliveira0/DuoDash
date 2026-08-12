# DuoDash: Your Memory Companion

Build a mobile-first, highly interactive, and intuitive web app called DuoDash using React, Tailwind CSS, and Lucide Icons. The app acts as a personal memory assistant for relationship notes and date ideas.

Core Guidelines & UX Rules:

Clean, modern UI with high tactile feedback (smooth hover/tap effects, active button states, clear check badges).

Responsive mobile layout with a fixed bottom navigation bar (2 tabs: "Passeios" and "Notas").

Top header displaying "DuoDash" with a dark/light mode toggle.

Store all data strictly in localStorage for fast offline loading. Include friendly empty states with clear calls-to-action when lists are empty.

Tab 1: Passeios (Date Ideas)

Interactive list of cards.

Each card features: Title, Category badge (Restaurante, Ar Livre, Viagem, Cultura, Outros), and an intuitive interactive checkbox that smoothly strikes through the title when marked as completed.

Top action bar: Search/filter by category and a prominent "+ Novo Passeio" button.

Modal/Drawer for adding a date idea (Fields: Title, Category dropdown, and Notes text area).

Quick swipe or trash button to delete items with a quick delete confirmation.

Tab 2: Notas & Preferências

Clean grid/list of quick text notes (likes, dislikes, things she mentioned).

Each note displays a Category badge (Comida, Presente, Detalhe, Importante) and relative date created.

Sticky search bar at the top to instantaneously filter notes by text or clicking tag filters.

Modal for adding/editing notes with inline selection of tags.

One-tap action to copy note text to clipboard or delete.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6f915d3b-46bf-4c1f-81df-a7b1fbc9e1a8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
