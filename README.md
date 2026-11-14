# Kina'masuti — Learn Mi'kmaw

A game-based web app that helps youth (ages 8–16) practise Mi'kmaw: alphabet soundboard, flashcards, quizzes and a phrase-building game. Built with React, Tailwind CSS and Lucide icons.

All words, audio links and lessons live in **one file: `src/languageData.js`**.

## Put it online (no coding)
The ready-to-upload website is the `website` folder (or `dist/` after you build it).
1. Go to https://app.netlify.com/drop and sign up for free.
2. Drag the whole `website` folder onto the page.
3. Netlify gives you a live link in about a minute. Share it with learners.
   (Any static host also works: GitHub Pages, Cloudflare Pages, your own web hosting.)

## Install it on a phone
Open the link on the phone.
- **Android (Chrome):** menu ⋮ → *Add to Home screen* / *Install app*.
- **iPhone (Safari):** Share button → *Add to Home Screen*.
It then opens like an app and works offline after the first visit.

## Add a new word with audio (5 steps)
1. Save the recording as an .mp3 with a simple name, e.g. `owl.mp3`.
2. Put the file in the `public/audio/` folder.
3. Open `src/languageData.js`, find the `words:` list, and copy a line from the same deck.
4. Paste it underneath and change it, keeping the quotes and the comma at the end:
   `{ id: 'animals-owl', mikmaw: "…", english: 'Owl', phoneticHint: '', audioUrl: 'audio/owl.mp3', category: 'animals', verifiedBy: '' },`
5. Rebuild and re-upload (see below).

## Rebuild after editing
1. Install Node.js (LTS) from https://nodejs.org
2. In this folder run `npm install` (first time only).
3. `npm run dev` → preview at the link it prints (usually http://localhost:5173).
4. `npm run build` → creates the `dist/` folder. Upload `dist/` the same way as above.
5. After publishing new content, open `public/sw.js` and change `VERSION` (e.g. `kinamasuti-v2`) so installed phones pick up the update.

`npm run build:single` makes one self-contained `dist-single/index.html` (handy for emailing a preview; it does not work offline).
