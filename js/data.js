// Données de l'appli : exercices, centres d'intérêt, catalogue culturel, succès.

// base = répétitions (ou secondes) par niveau de forme : [débutant, intermédiaire, avancé]
export const EXERCISES = [
  { id: 'pompes', name: 'Pompes', icon: '💪', stat: 'force', unit: 'rép.', base: [8, 15, 25], xp: 2, tip: 'Corps gainé, descends la poitrine près du sol. Trop dur ? Fais-les sur les genoux.' },
  { id: 'pompes-inclinees', name: 'Pompes inclinées', icon: '🪑', stat: 'force', unit: 'rép.', base: [10, 15, 20], xp: 1.5, tip: 'Mains sur une table ou un plan de travail, idéal pour débuter.' },
  { id: 'squats', name: 'Squats', icon: '🦵', stat: 'force', unit: 'rép.', base: [15, 25, 40], xp: 1.2, tip: 'Pieds largeur d\'épaules, fesses en arrière, dos droit, talons au sol.' },
  { id: 'fentes', name: 'Fentes alternées', icon: '🚶', stat: 'force', unit: 'rép.', base: [10, 20, 30], xp: 1.4, tip: 'Grand pas en avant, genou arrière proche du sol, alterne les jambes.' },
  { id: 'dips', name: 'Dips sur chaise', icon: '🪑', stat: 'force', unit: 'rép.', base: [8, 12, 20], xp: 2, tip: 'Mains sur le bord d\'une chaise stable, descends en pliant les coudes vers l\'arrière.' },
  { id: 'pont', name: 'Pont fessier', icon: '🌉', stat: 'force', unit: 'rép.', base: [15, 25, 35], xp: 1, tip: 'Allongé sur le dos, pieds au sol, monte le bassin et serre les fessiers 1 s en haut.' },
  { id: 'gainage', name: 'Gainage (planche)', icon: '🧱', stat: 'endurance', unit: 's', base: [30, 60, 90], xp: 0.5, tip: 'Sur les avant-bras, corps aligné de la tête aux talons, respire calmement.' },
  { id: 'chaise', name: 'Chaise contre un mur', icon: '🧍', stat: 'endurance', unit: 's', base: [30, 45, 75], xp: 0.5, tip: 'Dos plaqué au mur, cuisses parallèles au sol. Ça brûle, c\'est normal !' },
  { id: 'burpees', name: 'Burpees', icon: '🔥', stat: 'endurance', unit: 'rép.', base: [5, 10, 20], xp: 3, tip: 'Accroupi, jambes en arrière, pompe (optionnelle), retour et saut. Va à ton rythme.' },
  { id: 'jumping-jacks', name: 'Jumping jacks', icon: '⭐', stat: 'endurance', unit: 'rép.', base: [25, 40, 60], xp: 0.6, tip: 'Saute en écartant bras et jambes, puis reviens. Parfait pour réveiller le corps.' },
  { id: 'mountain-climbers', name: 'Mountain climbers', icon: '⛰️', stat: 'endurance', unit: 'rép.', base: [20, 30, 50], xp: 0.8, tip: 'En position de pompe, ramène les genoux vers la poitrine en alternance, vite.' },
  { id: 'montees-genoux', name: 'Montées de genoux', icon: '🏃', stat: 'endurance', unit: 's', base: [30, 45, 60], xp: 0.6, tip: 'Course sur place en montant les genoux à hauteur de hanches.' },
  { id: 'crunchs', name: 'Crunchs', icon: '🎯', stat: 'force', unit: 'rép.', base: [15, 25, 40], xp: 0.8, tip: 'Sur le dos, genoux pliés, décolle les épaules sans tirer sur la nuque.' },
  { id: 'superman', name: 'Superman', icon: '🦸', stat: 'souplesse', unit: 'rép.', base: [10, 15, 20], xp: 1, tip: 'À plat ventre, lève bras et jambes en même temps, tiens 2 s. Super pour le dos.' },
  { id: 'etirements', name: 'Étirements complets', icon: '🧘', stat: 'souplesse', unit: 'min', base: [5, 8, 10], xp: 8, tip: 'Ischios, quadriceps, épaules, dos : 30 s par position, sans à-coups.' },
  { id: 'mobilite', name: 'Mobilité des hanches', icon: '🌀', stat: 'souplesse', unit: 'min', base: [3, 5, 8], xp: 8, tip: 'Cercles de hanches, fente basse, position du pigeon. Respire profondément.' },
];

export const STATS = {
  force: { name: 'Force', icon: '💪', color: '#ff6b6b' },
  endurance: { name: 'Endurance', icon: '❤️', color: '#ffa94d' },
  souplesse: { name: 'Souplesse', icon: '🧘', color: '#69db7c' },
  savoir: { name: 'Savoir', icon: '📚', color: '#74c0fc' },
};

export const INTERESTS = [
  { id: 'histoire', label: 'Histoire', icon: '🏛️' },
  { id: 'science', label: 'Sciences', icon: '🔬' },
  { id: 'espace', label: 'Espace', icon: '🚀' },
  { id: 'nature', label: 'Nature & animaux', icon: '🌿' },
  { id: 'philo', label: 'Philosophie', icon: '🦉' },
  { id: 'psycho', label: 'Psychologie & habitudes', icon: '🧠' },
  { id: 'sport', label: 'Sport & dépassement', icon: '🏅' },
  { id: 'sante', label: 'Santé & bien-être', icon: '🍎' },
  { id: 'tech', label: 'Technologie', icon: '💻' },
  { id: 'societe', label: 'Société & économie', icon: '🌍' },
  { id: 'aventure', label: 'Voyage & aventure', icon: '🧭' },
  { id: 'imaginaire', label: 'Science-fiction & fantasy', icon: '🐉' },
  { id: 'art', label: 'Art & création', icon: '🎨' },
  { id: 'cuisine', label: 'Cuisine', icon: '🍳' },
];

export const FORMATS = [
  { id: 'livre', label: 'Livres', icon: '📖', xp: 150 },
  { id: 'doc', label: 'Documentaires', icon: '🎥', xp: 60 },
  { id: 'film', label: 'Films', icon: '🎬', xp: 50 },
];

// Catalogue : tags = centres d'intérêt. desc = une phrase.
export const CATALOG = [
  // Histoire
  { id: 'sapiens', type: 'livre', title: 'Sapiens', by: 'Yuval Noah Harari', tags: ['histoire', 'science', 'societe'], desc: 'Une brève histoire de l\'humanité, des chasseurs-cueilleurs à nos jours.' },
  { id: 'monde-hier', type: 'livre', title: 'Le Monde d\'hier', by: 'Stefan Zweig', tags: ['histoire', 'societe'], desc: 'Les souvenirs d\'un Européen, de la Belle Époque à la montée du nazisme.' },
  { id: 'rois-maudits', type: 'livre', title: 'Les Rois maudits', by: 'Maurice Druon', tags: ['histoire'], desc: 'La saga des derniers Capétiens, intrigues et malédiction des Templiers.' },
  { id: 'apocalypse', type: 'doc', title: 'Apocalypse, la 2e Guerre mondiale', by: 'Isabelle Clarke & Daniel Costelle', tags: ['histoire'], desc: 'Six épisodes d\'archives colorisées pour revivre le conflit.' },
  { id: 'shoah', type: 'doc', title: 'Shoah', by: 'Claude Lanzmann', tags: ['histoire'], desc: 'Le documentaire de référence sur l\'extermination des Juifs d\'Europe.' },
  { id: 'gladiator', type: 'film', title: 'Gladiator', by: 'Ridley Scott', tags: ['histoire', 'sport'], desc: 'Un général romain devenu esclave combat pour sa vengeance.' },

  // Sciences
  { id: 'breve-histoire-temps', type: 'livre', title: 'Une brève histoire du temps', by: 'Stephen Hawking', tags: ['science', 'espace'], desc: 'Big bang, trous noirs et nature du temps, expliqués simplement.' },
  { id: 'gene-egoiste', type: 'livre', title: 'Le Gène égoïste', by: 'Richard Dawkins', tags: ['science', 'nature'], desc: 'L\'évolution vue du point de vue des gènes.' },
  { id: 'cosmos-sagan', type: 'livre', title: 'Cosmos', by: 'Carl Sagan', tags: ['science', 'espace'], desc: 'Un voyage poétique à travers l\'univers et l\'histoire des sciences.' },
  { id: 'cosmos-serie', type: 'doc', title: 'Cosmos : une odyssée à travers l\'univers', by: 'Neil deGrasse Tyson', tags: ['science', 'espace'], desc: 'Série documentaire spectaculaire sur l\'univers et la méthode scientifique.' },
  { id: 'imitation-game', type: 'film', title: 'Imitation Game', by: 'Morten Tyldum', tags: ['science', 'tech', 'histoire'], desc: 'Alan Turing et le déchiffrement d\'Enigma.' },

  // Espace
  { id: 'seul-sur-mars', type: 'livre', title: 'Seul sur Mars', by: 'Andy Weir', tags: ['espace', 'imaginaire', 'science'], desc: 'Un astronaute abandonné sur Mars survit grâce à la science et l\'humour.' },
  { id: 'apollo-11', type: 'doc', title: 'Apollo 11', by: 'Todd Douglas Miller', tags: ['espace', 'histoire'], desc: 'La mission lunaire racontée uniquement avec des images d\'époque restaurées.' },
  { id: 'interstellar', type: 'film', title: 'Interstellar', by: 'Christopher Nolan', tags: ['espace', 'imaginaire', 'science'], desc: 'Un voyage à travers un trou de ver pour sauver l\'humanité.' },
  { id: 'etoffe-heros', type: 'film', title: 'L\'Étoffe des héros', by: 'Philip Kaufman', tags: ['espace', 'histoire', 'aventure'], desc: 'Les premiers astronautes américains du programme Mercury.' },

  // Nature
  { id: 'vie-secrete-arbres', type: 'livre', title: 'La Vie secrète des arbres', by: 'Peter Wohlleben', tags: ['nature', 'science'], desc: 'Comment les arbres communiquent et prennent soin les uns des autres.' },
  { id: 'panthere-livre', type: 'livre', title: 'La Panthère des neiges', by: 'Sylvain Tesson', tags: ['nature', 'aventure', 'philo'], desc: 'L\'art de l\'affût sur les hauts plateaux tibétains.' },
  { id: 'panthere-doc', type: 'doc', title: 'La Panthère des neiges', by: 'Marie Amiguet & Vincent Munier', tags: ['nature', 'aventure'], desc: 'Le film de l\'expédition, d\'une beauté rare.' },
  { id: 'planete-terre', type: 'doc', title: 'Planète Terre', by: 'BBC, David Attenborough', tags: ['nature'], desc: 'La série culte sur les paysages et la faune de notre planète.' },
  { id: 'notre-planete', type: 'doc', title: 'Notre planète', by: 'Netflix, David Attenborough', tags: ['nature', 'societe'], desc: 'La beauté du vivant et les menaces qui pèsent sur lui.' },
  { id: 'oceans', type: 'doc', title: 'Océans', by: 'Jacques Perrin', tags: ['nature'], desc: 'Une plongée au plus près des créatures marines.' },

  // Philosophie
  { id: 'pensees-marc-aurele', type: 'livre', title: 'Pensées pour moi-même', by: 'Marc Aurèle', tags: ['philo', 'psycho'], desc: 'Le carnet stoïcien d\'un empereur : discipline, sérénité, action.' },
  { id: 'lettres-lucilius', type: 'livre', title: 'Lettres à Lucilius', by: 'Sénèque', tags: ['philo'], desc: 'Des conseils de vie concrets, toujours d\'actualité.' },
  { id: 'mythe-sisyphe', type: 'livre', title: 'Le Mythe de Sisyphe', by: 'Albert Camus', tags: ['philo'], desc: 'Il faut imaginer Sisyphe heureux : un essai sur l\'absurde.' },
  { id: 'monde-sophie', type: 'livre', title: 'Le Monde de Sophie', by: 'Jostein Gaarder', tags: ['philo', 'histoire'], desc: 'Un roman qui raconte toute l\'histoire de la philosophie.' },

  // Psychologie & habitudes
  { id: 'atomic-habits', type: 'livre', title: 'Un rien peut tout changer (Atomic Habits)', by: 'James Clear', tags: ['psycho', 'sante', 'sport'], desc: 'La méthode des petites habitudes, parfaite pour ta remise en forme.' },
  { id: 'systeme1', type: 'livre', title: 'Système 1 / Système 2', by: 'Daniel Kahneman', tags: ['psycho', 'science'], desc: 'Les deux vitesses de la pensée et nos biais.' },
  { id: 'frankl', type: 'livre', title: 'Découvrir un sens à sa vie', by: 'Viktor Frankl', tags: ['psycho', 'philo', 'histoire'], desc: 'Un psychiatre rescapé des camps sur la quête de sens.' },
  { id: 'social-dilemma', type: 'doc', title: 'Derrière nos écrans de fumée', by: 'Jeff Orlowski', tags: ['psycho', 'tech', 'societe'], desc: 'Comment les réseaux sociaux captent notre attention.' },

  // Sport & dépassement
  { id: 'born-to-run', type: 'livre', title: 'Born to Run', by: 'Christopher McDougall', tags: ['sport', 'aventure', 'sante'], desc: 'Un peuple de coureurs mexicains et le plaisir de courir.' },
  { id: 'open-agassi', type: 'livre', title: 'Open', by: 'Andre Agassi', tags: ['sport', 'psycho'], desc: 'L\'autobiographie franche d\'un champion qui détestait le tennis.' },
  { id: 'free-solo', type: 'doc', title: 'Free Solo', by: 'Jimmy Chin & E. Chai Vasarhelyi', tags: ['sport', 'aventure'], desc: 'Alex Honnold escalade El Capitan sans corde.' },
  { id: 'last-dance', type: 'doc', title: 'The Last Dance', by: 'Jason Hehir', tags: ['sport'], desc: 'Michael Jordan et la dernière saison des Chicago Bulls.' },
  { id: '14-peaks', type: 'doc', title: '14 Peaks : Rien n\'est impossible', by: 'Torquil Jones', tags: ['sport', 'aventure'], desc: 'Nims Purja gravit les 14 sommets de plus de 8000 m en un temps record.' },
  { id: 'rocky', type: 'film', title: 'Rocky', by: 'John G. Avildsen', tags: ['sport'], desc: 'Le film d\'entraînement par excellence. Motivation garantie.' },

  // Santé
  { id: 'pourquoi-dormons', type: 'livre', title: 'Pourquoi nous dormons', by: 'Matthew Walker', tags: ['sante', 'science'], desc: 'Le sommeil, super-pouvoir méconnu de la santé et du sport.' },

  // Technologie
  { id: 'steve-jobs', type: 'livre', title: 'Steve Jobs', by: 'Walter Isaacson', tags: ['tech'], desc: 'La biographie de référence du fondateur d\'Apple.' },
  { id: 'alphago', type: 'doc', title: 'AlphaGo', by: 'Greg Kohs', tags: ['tech', 'science'], desc: 'Une intelligence artificielle défie le champion du monde de go.' },
  { id: 'social-network', type: 'film', title: 'The Social Network', by: 'David Fincher', tags: ['tech', 'societe'], desc: 'La naissance tumultueuse de Facebook.' },

  // Société & économie
  { id: 'freakonomics', type: 'livre', title: 'Freakonomics', by: 'Steven Levitt & Stephen Dubner', tags: ['societe', 'psycho'], desc: 'L\'économie appliquée aux questions les plus inattendues.' },
  { id: 'inside-job', type: 'doc', title: 'Inside Job', by: 'Charles Ferguson', tags: ['societe'], desc: 'Les coulisses de la crise financière de 2008.' },
  { id: 'demain', type: 'doc', title: 'Demain', by: 'Cyril Dion & Mélanie Laurent', tags: ['societe', 'nature'], desc: 'Des solutions concrètes à travers le monde pour un futur durable.' },
  { id: '1984', type: 'livre', title: '1984', by: 'George Orwell', tags: ['societe', 'imaginaire'], desc: 'Big Brother te regarde : le classique de la dystopie.' },

  // Voyage & aventure
  { id: 'forets-siberie', type: 'livre', title: 'Dans les forêts de Sibérie', by: 'Sylvain Tesson', tags: ['aventure', 'nature', 'philo'], desc: 'Six mois seul dans une cabane au bord du lac Baïkal.' },
  { id: 'usage-monde', type: 'livre', title: 'L\'Usage du monde', by: 'Nicolas Bouvier', tags: ['aventure'], desc: 'De Genève à l\'Afghanistan en Fiat Topolino, le livre culte du voyage.' },
  { id: 'into-wild-livre', type: 'livre', title: 'Voyage au bout de la solitude (Into the Wild)', by: 'Jon Krakauer', tags: ['aventure', 'nature'], desc: 'L\'histoire vraie de Chris McCandless parti vivre en Alaska.' },
  { id: 'into-wild-film', type: 'film', title: 'Into the Wild', by: 'Sean Penn', tags: ['aventure', 'nature'], desc: 'L\'adaptation du récit de Krakauer, portée par la musique d\'Eddie Vedder.' },

  // Imaginaire
  { id: 'dune', type: 'livre', title: 'Dune', by: 'Frank Herbert', tags: ['imaginaire'], desc: 'Arrakis, l\'épice et les Fremen : le monument de la SF.' },
  { id: 'fondation', type: 'livre', title: 'Fondation', by: 'Isaac Asimov', tags: ['imaginaire', 'societe'], desc: 'Prévoir la chute d\'un empire galactique grâce aux mathématiques.' },
  { id: 'trois-corps', type: 'livre', title: 'Le Problème à trois corps', by: 'Liu Cixin', tags: ['imaginaire', 'science', 'espace'], desc: 'Un premier contact vertigineux, entre physique et histoire chinoise.' },
  { id: 'seigneur-anneaux', type: 'livre', title: 'Le Seigneur des anneaux', by: 'J.R.R. Tolkien', tags: ['imaginaire', 'aventure'], desc: 'La quête de l\'Anneau unique, la référence de la fantasy.' },
  { id: 'dune-film', type: 'film', title: 'Dune (2021)', by: 'Denis Villeneuve', tags: ['imaginaire'], desc: 'Une adaptation visuellement grandiose du roman.' },

  // Art & création
  { id: 'gombrich', type: 'livre', title: 'Histoire de l\'art', by: 'Ernst Gombrich', tags: ['art', 'histoire'], desc: 'Toute l\'histoire de l\'art racontée avec clarté.' },
  { id: 'exit-gift-shop', type: 'doc', title: 'Faites le mur !', by: 'Banksy', tags: ['art'], desc: 'Le street art vu (et détourné) par Banksy.' },
  { id: 'amelie', type: 'film', title: 'Le Fabuleux Destin d\'Amélie Poulain', by: 'Jean-Pierre Jeunet', tags: ['art'], desc: 'Montmartre, les petits plaisirs et une héroïne inoubliable.' },

  // Cuisine
  { id: 'jiro', type: 'doc', title: 'Jiro Dreams of Sushi', by: 'David Gelb', tags: ['cuisine', 'art'], desc: 'Un maître sushi de 85 ans en quête de perfection.' },
  { id: 'chefs-table', type: 'doc', title: 'Chef\'s Table', by: 'David Gelb', tags: ['cuisine', 'art'], desc: 'Chaque épisode, le portrait d\'un grand chef.' },
  { id: 'ratatouille', type: 'film', title: 'Ratatouille', by: 'Brad Bird (Pixar)', tags: ['cuisine'], desc: 'Tout le monde peut cuisiner, même un rat parisien.' },
];

export const TITLES = [
  { level: 1, title: 'Novice' },
  { level: 3, title: 'Apprenti' },
  { level: 5, title: 'Aventurier' },
  { level: 8, title: 'Guerrier' },
  { level: 12, title: 'Champion' },
  { level: 16, title: 'Héros' },
  { level: 20, title: 'Maître' },
  { level: 25, title: 'Légende' },
];

// check(s) reçoit l'état et renvoie true quand le succès est débloqué
export const ACHIEVEMENTS = [
  { id: 'premier-pas', icon: '👣', name: 'Premier pas', desc: 'Valider ton premier défi.', check: s => s.counters.challenges >= 1 },
  { id: 'journee-complete', icon: '✅', name: 'Journée complète', desc: 'Valider les 3 défis du jour.', check: s => s.counters.fullDays >= 1 },
  { id: 'serie-3', icon: '🔥', name: 'Ça chauffe', desc: '3 jours d\'affilée.', check: s => s.streak.best >= 3 },
  { id: 'serie-7', icon: '🔥', name: 'Semaine de feu', desc: '7 jours d\'affilée.', check: s => s.streak.best >= 7 },
  { id: 'serie-30', icon: '🌋', name: 'Inarrêtable', desc: '30 jours d\'affilée.', check: s => s.streak.best >= 30 },
  { id: 'pompes-100', icon: '💪', name: 'Centurion', desc: '100 pompes au total.', check: s => (s.counters.exo.pompes || 0) >= 100 },
  { id: 'pompes-1000', icon: '🦾', name: 'Bras d\'acier', desc: '1 000 pompes au total.', check: s => (s.counters.exo.pompes || 0) >= 1000 },
  { id: 'squats-500', icon: '🦵', name: 'Jambes de titan', desc: '500 squats au total.', check: s => (s.counters.exo.squats || 0) >= 500 },
  { id: 'gainage-600', icon: '🧱', name: 'Mur de pierre', desc: '10 minutes de gainage cumulées.', check: s => (s.counters.exo.gainage || 0) >= 600 },
  { id: 'lecteur', icon: '📖', name: 'Rat de bibliothèque', desc: 'Terminer un livre.', check: s => s.counters.done.livre >= 1 },
  { id: 'cinephile', icon: '🎬', name: 'Cinéphile', desc: 'Voir 3 films ou documentaires.', check: s => s.counters.done.doc + s.counters.done.film >= 3 },
  { id: 'erudit', icon: '🎓', name: 'Érudit', desc: 'Terminer 10 œuvres.', check: s => s.counters.done.livre + s.counters.done.doc + s.counters.done.film >= 10 },
  { id: 'lecture-300', icon: '⏳', name: 'Plongé dans les pages', desc: '5 heures de lecture ou visionnage notées.', check: s => s.counters.cultureMinutes >= 300 },
  { id: 'niveau-5', icon: '🛡️', name: 'Aventurier', desc: 'Atteindre le niveau 5.', check: (s, lvl) => lvl >= 5 },
  { id: 'niveau-10', icon: '⚔️', name: 'Vétéran', desc: 'Atteindre le niveau 10.', check: (s, lvl) => lvl >= 10 },
  { id: 'niveau-20', icon: '👑', name: 'Maître', desc: 'Atteindre le niveau 20.', check: (s, lvl) => lvl >= 20 },
  { id: 'quete-1', icon: '📜', name: 'Quêteur', desc: 'Terminer une quête hebdomadaire.', check: s => s.counters.quests >= 1 },
  { id: 'equilibre', icon: '☯️', name: 'Esprit sain, corps sain', desc: '200 en Force et 200 en Savoir.', check: s => s.stats.force >= 200 && s.stats.savoir >= 200 },
];
