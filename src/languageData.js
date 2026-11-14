/* =============================================================================
   languageData.js — ALL THE APP'S MI'KMAW CONTENT LIVES IN THIS ONE FILE
   -----------------------------------------------------------------------------
   You do NOT need to know how to code to edit this file. Every word is one
   block between { and } with the same seven fields:

     id          A short unique name, lowercase, no spaces (e.g. "animals-bear").
     mikmaw      The word in Mi'kmaw (Francis-Smith spelling).
     english     The English meaning.
     phoneticHint  An easy "say it like…" tip for kids. Leave "" if unsure.
     audioUrl    Link to an .mp3 recording, e.g. "audio/kwe.mp3".
                 Leave "" and the app shows "Audio recording coming soon".
     category    Which deck it belongs to: "greetings", "animals", "nature",
                 "family" — or "vowel" / "consonant" for alphabet letters.
     verifiedBy  Optional note on who supplied or checked the word. Can stay "".
     keywords    (optional) other English words people might type to find it,
                 e.g. keywords: ['hi', 'hey'] for Kwe'.

   Rules: keep the quotes "…" and the comma after each line and each block.
   Orthography: Francis-Smith (Nova Scotia standard). An apostrophe after a
   vowel means "hold the vowel longer" (a' = aaah).
   ============================================================================= */

export const languageData = {
  // ---------------------------------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------------------------------
  settings: {
    // When a word has no recording yet, read it with the device's computer
    // voice. It CANNOT pronounce Mi'kmaw correctly — set to false to turn off.
    useComputerVoiceFallback: true,
  },

  // ---------------------------------------------------------------------------
  // DECKS — the themes shown on the Practice screen (icon: greet, animal,
  // water, family; color: forest or clay)
  // ---------------------------------------------------------------------------
  decks: [
    { id: 'greetings', title: 'Greetings', icon: 'greet', color: 'clay', blurb: 'Say hello, thank you and see you later.' },
    { id: 'animals', title: 'Animals', icon: 'animal', color: 'forest', blurb: 'Creatures of the forest and sea.' },
    { id: 'nature', title: 'Nature & Water', icon: 'water', color: 'forest', blurb: "Water, sky and land of Mi'kma'ki." },
    { id: 'family', title: 'Family', icon: 'family', color: 'clay', blurb: 'The people closest to you.' },
    { id: 'numbers', title: 'Numbers', icon: 'numbers', color: 'forest', blurb: 'Count from one to ten.' },
  ],

  // ---------------------------------------------------------------------------
  // ALPHABET — 6 vowels + 11 consonants. exampleWordId points to a word below.
  // ---------------------------------------------------------------------------
  alphabet: [
    { id: 'letter-a', mikmaw: 'a', english: 'vowel a', phoneticHint: 'Say "ah" — like the a in "father".', audioUrl: '', category: 'vowel', verifiedBy: '', exampleWordId: 'animals-rabbit' },
    { id: 'letter-e', mikmaw: 'e', english: 'vowel e', phoneticHint: 'Say "eh" — like the e in "bed".', audioUrl: '', category: 'vowel', verifiedBy: '', exampleWordId: 'family-woman' },
    { id: 'letter-i', mikmaw: 'i', english: 'vowel i', phoneticHint: 'Say "ee" — like the ee in "see".', audioUrl: '', category: 'vowel', verifiedBy: '', exampleWordId: 'culture-mikmaw' },
    { id: 'letter-o', mikmaw: 'o', english: 'vowel o', phoneticHint: 'Say "oh" — like the o in "go".', audioUrl: '', category: 'vowel', verifiedBy: '', exampleWordId: 'animals-beaver' },
    { id: 'letter-u', mikmaw: 'u', english: 'vowel u', phoneticHint: 'Say "oo" — like the oo in "moon".', audioUrl: '', category: 'vowel', verifiedBy: '', exampleWordId: 'animals-salmon' },
    { id: 'letter-schwa', mikmaw: 'ɨ', english: 'vowel ɨ (short "uh")', phoneticHint: 'A short, relaxed "uh" — like the a in "about". Often heard but not always written; in everyday spelling it may appear as an apostrophe (as in L\'nu).', audioUrl: '', category: 'vowel', verifiedBy: '', exampleWordId: 'culture-lnu' },
    { id: 'letter-p', mikmaw: 'p', english: 'consonant p', phoneticHint: 'Between "p" and "b". Sounds more like "b" between vowels.', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'greetings-welcome' },
    { id: 'letter-t', mikmaw: 't', english: 'consonant t', phoneticHint: 'Between "t" and "d". Sounds more like "d" between vowels.', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'animals-moose' },
    { id: 'letter-k', mikmaw: 'k', english: 'consonant k', phoneticHint: 'Between "k" and "g". Sounds more like "g" between vowels.', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'animals-eagle' },
    { id: 'letter-q', mikmaw: 'q', english: 'consonant q', phoneticHint: 'Like "k", but further back in your throat. At the end of a word it can sound breathy, like "kh".', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'nature-lake' },
    { id: 'letter-s', mikmaw: 's', english: 'consonant s', phoneticHint: 'Like "s". Can sound like "z" between vowels.', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'nature-water' },
    { id: 'letter-j', mikmaw: 'j', english: 'consonant j', phoneticHint: 'Between the "ch" in "chip" and the "j" in "jam".', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'animals-lobster' },
    { id: 'letter-l', mikmaw: 'l', english: 'consonant l', phoneticHint: 'Like the "l" in "leaf".', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'animals-dog' },
    { id: 'letter-m', mikmaw: 'm', english: 'consonant m', phoneticHint: 'Like the "m" in "moon".', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'animals-bear' },
    { id: 'letter-n', mikmaw: 'n', english: 'consonant n', phoneticHint: 'Like the "n" in "nest".', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'nature-sun' },
    { id: 'letter-w', mikmaw: 'w', english: 'consonant w', phoneticHint: 'Like the "w" in "water".', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'animals-fox' },
    { id: 'letter-y', mikmaw: 'y', english: 'consonant y', phoneticHint: 'Like the "y" in "yes".', audioUrl: '', category: 'consonant', verifiedBy: '', exampleWordId: 'greetings-how-are-you' },
  ],

  // ---------------------------------------------------------------------------
  // WORDS — add new vocabulary here. It appears automatically in its deck's
  // flashcards and quiz. ("culture" words are used as alphabet examples only.)
  // ---------------------------------------------------------------------------
  words: [
    // ----- Greetings -----
    { id: 'greetings-hello', mikmaw: "Kwe'", english: 'Hello', phoneticHint: '', audioUrl: '', category: 'greetings', verifiedBy: '', keywords: ['hi', 'hey', 'greetings'] },
    { id: 'greetings-thank-you', mikmaw: "Wela'lin", english: 'Thank you (to one person)', phoneticHint: '', audioUrl: '', category: 'greetings', verifiedBy: '', keywords: ['thanks', 'thank u'] },
    { id: 'greetings-see-you', mikmaw: 'Nmultes', english: 'See you later', phoneticHint: '', audioUrl: '', category: 'greetings', verifiedBy: '', keywords: ['bye', 'goodbye', 'see ya', 'later'] },
    { id: 'greetings-how-are-you', mikmaw: "Me' tal-wuleyn?", english: 'How are you?', phoneticHint: '', audioUrl: '', category: 'greetings', verifiedBy: '', keywords: ['how are u', 'how r u'] },
    { id: 'greetings-welcome', mikmaw: "Pjila'si", english: 'Welcome', phoneticHint: '', audioUrl: '', category: 'greetings', verifiedBy: '' },
    { id: 'greetings-thank-you-all', mikmaw: "Wela'lioq", english: 'Thank you (to many people)', phoneticHint: '', audioUrl: '', category: 'greetings', verifiedBy: '', keywords: ['thanks everyone', 'thank you all'] },
    { id: 'greetings-yes', mikmaw: "E'e", english: 'Yes', phoneticHint: '', audioUrl: '', category: 'greetings', verifiedBy: '', keywords: ['yeah', 'yep'] },
    { id: 'greetings-no', mikmaw: "Moqwa'", english: 'No', phoneticHint: '', audioUrl: '', category: 'greetings', verifiedBy: '', keywords: ['nope'] },

    // ----- Animals -----
    { id: 'animals-bear', mikmaw: "Mu'in", english: 'Bear', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '' },
    { id: 'animals-moose', mikmaw: "Tia'm", english: 'Moose', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '' },
    { id: 'animals-eagle', mikmaw: 'Kitpu', english: 'Eagle', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '' },
    { id: 'animals-rabbit', mikmaw: "Apli'kmuj", english: 'Rabbit / hare', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '' },
    { id: 'animals-fox', mikmaw: 'Wowkwis', english: 'Fox', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '' },
    { id: 'animals-beaver', mikmaw: 'Kopit', english: 'Beaver', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '' },
    { id: 'animals-dog', mikmaw: "L'mu'j", english: 'Dog', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '', keywords: ['puppy'] },
    { id: 'animals-lobster', mikmaw: 'Jakej', english: 'Lobster', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '' },
    { id: 'animals-salmon', mikmaw: 'Plamu', english: 'Salmon', phoneticHint: '', audioUrl: '', category: 'animals', verifiedBy: '' },

    // ----- Nature & Water -----
    { id: 'nature-water', mikmaw: 'Samqwan', english: 'Water', phoneticHint: '', audioUrl: '', category: 'nature', verifiedBy: '' },
    { id: 'nature-river', mikmaw: 'Sipu', english: 'River', phoneticHint: '', audioUrl: '', category: 'nature', verifiedBy: '' },
    { id: 'nature-lake', mikmaw: 'Qospem', english: 'Lake', phoneticHint: '', audioUrl: '', category: 'nature', verifiedBy: '' },
    { id: 'nature-sun', mikmaw: "Na'ku'set", english: 'Sun', phoneticHint: '', audioUrl: '', category: 'nature', verifiedBy: '', keywords: ['sunshine'] },
    { id: 'nature-star', mikmaw: 'Kloqowej', english: 'Star', phoneticHint: '', audioUrl: '', category: 'nature', verifiedBy: '' },
    { id: 'nature-moon', mikmaw: 'Tepknuset', english: 'Moon', phoneticHint: '', audioUrl: '', category: 'nature', verifiedBy: '' },
    { id: 'nature-homeland', mikmaw: "Mi'kma'ki", english: "The Mi'kmaw homeland", phoneticHint: '', audioUrl: '', category: 'nature', verifiedBy: '' },

    // ----- Family -----
    { id: 'family-woman', mikmaw: "E'pit", english: 'Woman', phoneticHint: '', audioUrl: '', category: 'family', verifiedBy: '' },
    { id: 'family-man', mikmaw: "Ji'nm", english: 'Man', phoneticHint: '', audioUrl: '', category: 'family', verifiedBy: '' },
    { id: 'family-child', mikmaw: "Mijua'ji'j", english: 'Child', phoneticHint: '', audioUrl: '', category: 'family', verifiedBy: '', keywords: ['kid', 'baby'] },
    { id: 'family-my-mother', mikmaw: 'Nkij', english: 'My mother', phoneticHint: '', audioUrl: '', category: 'family', verifiedBy: '', keywords: ['mom', 'mum', 'mother', 'mama'] },
    { id: 'family-my-father', mikmaw: 'Nujj', english: 'My father', phoneticHint: '', audioUrl: '', category: 'family', verifiedBy: '', keywords: ['dad', 'father', 'papa'] },
    { id: 'family-all-relations', mikmaw: "Msit no'kmaq", english: 'All my relations', phoneticHint: '', audioUrl: '', category: 'family', verifiedBy: '' },

    // ----- Numbers -----
    { id: 'numbers-one', mikmaw: "Ne'wt", english: 'One', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['1'] },
    { id: 'numbers-two', mikmaw: "Ta'pu", english: 'Two', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['2'] },
    { id: 'numbers-three', mikmaw: "Si'st", english: 'Three', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['3'] },
    { id: 'numbers-four', mikmaw: "Ne'w", english: 'Four', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['4'] },
    { id: 'numbers-five', mikmaw: "Na'n", english: 'Five', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['5'] },
    { id: 'numbers-six', mikmaw: "Asukom", english: 'Six', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['6'] },
    { id: 'numbers-seven', mikmaw: "L'uiknek", english: 'Seven', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['7'] },
    { id: 'numbers-eight', mikmaw: "Ukmuljin", english: 'Eight', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['8'] },
    { id: 'numbers-nine', mikmaw: "Pesqunatek", english: 'Nine', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['9'] },
    { id: 'numbers-ten', mikmaw: "Newtiska'q", english: 'Ten', phoneticHint: '', audioUrl: '', category: 'numbers', verifiedBy: '', keywords: ['10'] },

    // ----- Culture (alphabet examples) -----
    { id: 'culture-mikmaw', mikmaw: "Mi'kmaw", english: "Mi'kmaw (the language)", phoneticHint: '', audioUrl: '', category: 'culture', verifiedBy: '' },
    { id: 'culture-lnu', mikmaw: "L'nu", english: 'Person / the People', phoneticHint: '', audioUrl: '', category: 'culture', verifiedBy: '' },
  ],

  // ---------------------------------------------------------------------------
  // QUIZZES — list word ids per deck. ask: "meaning" = "What does X mean?",
  // "say" = "How do you say X?". Wrong answers are picked automatically from
  // the same deck. Leave a deck's list empty [] to quiz every word in it.
  // ---------------------------------------------------------------------------
  quizzes: {
    greetings: [
      { wordId: 'greetings-hello', ask: 'meaning' },
      { wordId: 'greetings-thank-you', ask: 'say' },
      { wordId: 'greetings-see-you', ask: 'meaning' },
      { wordId: 'greetings-how-are-you', ask: 'say' },
      { wordId: 'greetings-welcome', ask: 'meaning' },
    ],
    animals: [
      { wordId: 'animals-bear', ask: 'meaning' },
      { wordId: 'animals-eagle', ask: 'say' },
      { wordId: 'animals-moose', ask: 'meaning' },
      { wordId: 'animals-lobster', ask: 'say' },
      { wordId: 'animals-fox', ask: 'meaning' },
    ],
    nature: [
      { wordId: 'nature-water', ask: 'meaning' },
      { wordId: 'nature-river', ask: 'say' },
      { wordId: 'nature-sun', ask: 'meaning' },
      { wordId: 'nature-star', ask: 'say' },
    ],
    family: [
      { wordId: 'family-child', ask: 'meaning' },
      { wordId: 'family-woman', ask: 'say' },
      { wordId: 'family-all-relations', ask: 'meaning' },
      { wordId: 'family-man', ask: 'say' },
    ],
    numbers: [], // empty = quiz every word in the deck
  },

  // ---------------------------------------------------------------------------
  // BUILD THE PHRASE — tiles in the correct order; extraTiles are distractors.
  // ---------------------------------------------------------------------------
  phrases: [
    { id: 'phrase-hello-how', english: 'Hello! How are you?', tiles: ["Kwe'!", "Me'", 'tal-wuleyn?'], extraTiles: ['Nmultes'], audioUrl: '', verifiedBy: '' },
    { id: 'phrase-thanks-later', english: 'Thank you, see you later!', tiles: ["Wela'lin,", 'nmultes!'], extraTiles: ["Kwe'"], audioUrl: '', verifiedBy: '' },
    { id: 'phrase-name-q', english: 'Hello! What is your name?', tiles: ["Kwe'!", "Ta'n", 'teluisin?'], extraTiles: ["Wela'lin"], audioUrl: '', verifiedBy: '' },
    { id: 'phrase-my-name', english: 'My name is ___ (say your name!)', tiles: ['Teluisi', '___'], extraTiles: ["Me'"], audioUrl: '', verifiedBy: '' },
  ],

  // ---------------------------------------------------------------------------
  // LEARNING PATH — lessons on the Home screen, in order.
  // mode: "flashcards" | "quiz" | "phrase"
  // ---------------------------------------------------------------------------
  lessons: [
    { id: 'l1', title: 'First Hellos', deck: 'greetings', mode: 'flashcards' },
    { id: 'l2', title: 'Greeting Quiz', deck: 'greetings', mode: 'quiz' },
    { id: 'l3', title: 'Build a Greeting', deck: 'greetings', mode: 'phrase' },
    { id: 'l4', title: 'Forest Friends', deck: 'animals', mode: 'flashcards' },
    { id: 'l5', title: 'Animal Quiz', deck: 'animals', mode: 'quiz' },
    { id: 'l6', title: 'Water & Sky', deck: 'nature', mode: 'flashcards' },
    { id: 'l7', title: 'Nature Quiz', deck: 'nature', mode: 'quiz' },
    { id: 'l8', title: 'My Family', deck: 'family', mode: 'flashcards' },
    { id: 'l9', title: 'Family Quiz', deck: 'family', mode: 'quiz' },
    { id: 'l10', title: 'Count to Ten', deck: 'numbers', mode: 'flashcards' },
    { id: 'l11', title: 'Numbers Quiz', deck: 'numbers', mode: 'quiz' },
  ],

};
