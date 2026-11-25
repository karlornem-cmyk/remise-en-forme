# Remise en forme ⚔️

Appli personnelle (web, installable sur téléphone) pour reprendre de bonnes habitudes, façon RPG :

- **Défis au poids du corps** chaque jour (pompes, squats, gainage, burpees…), adaptés à ta forme et qui grandissent avec ton niveau.
- **Rappels** aux heures que tu choisis (notifications de l'appli, et/ou Google Agenda / fichier .ics pour des rappels garantis).
- **Culture** : questionnaire de centres d'intérêt, puis suggestions de livres, documentaires et films. Note tes minutes de lecture.
- **Progression RPG** : XP, niveaux et titres, caractéristiques (Force, Endurance, Souplesse, Savoir), série de jours, quêtes hebdomadaires et succès.

Tout est enregistré sur l'appareil (aucun compte). Pense à exporter une sauvegarde de temps en temps (Réglages → Sauvegarde).

## Installer sur ton téléphone

1. Ouvre l'adresse de l'appli dans **Chrome** (Android) ou **Safari** (iPhone).
2. Android : menu ⋮ → « Installer l'application » / « Ajouter à l'écran d'accueil ».
   iPhone : bouton Partager ⬆️ → « Sur l'écran d'accueil ».
3. Ouvre l'appli depuis l'icône, va dans **Réglages** → « Activer les notifications ».
4. Pour des rappels même téléphone en veille : bouton « + Google Agenda » à côté de chaque heure de rappel.

## Technique

Site statique sans dépendance ni compilation : `index.html`, `css/`, `js/`, `sw.js` (service worker), `manifest.webmanifest`.
Pour le tester en local : `python3 -m http.server` puis http://localhost:8000.
Hébergeable tel quel sur Vercel, GitHub Pages ou Netlify.
Le catalogue d'œuvres et la liste d'exercices sont dans `js/data.js`.
