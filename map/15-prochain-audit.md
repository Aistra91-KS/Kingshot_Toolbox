# MAP §15 · À revoir au prochain audit

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 15. À revoir au prochain audit

- **Consentement Google Analytics.** Relevé à l'audit du 22 septembre 2026 et laissé en suspens par décision d'Aistra : `gtag.js` est chargé sur toutes les pages publiées et dépose ses cookies dès la première visite, sans bandeau de consentement. La page À propos l'explique, mais la position publiée par la CNIL est que Google Analytics n'entre pas dans l'exemption de consentement des outils de mesure d'audience. Trois voies avaient été listées : bandeau avec Consent Mode (mesure refusée par défaut), outil de mesure exempté, statu quo. À reposer à Aistra lors de tout nouvel audit.
- **Laissé ouvert par l'audit du 22/09/2026** : la page Familiers (CLS 0,99 sur mobile, refonte prévue par Aistra) ; les décalages restants sur ordinateur (§9 `09d`) ; les champs sous 16 px sur téléphone, hors boutiques d'événement (§9 `09d`) ; les constats F13 et F14 (§14) ; aucun test sur les calculs du Planificateur de bâtiments (§10, il faut d'abord en sortir un moteur pur) ; les deux `<h1>` de `pets.html` (un par onglet), laissés pour la refonte ; les guillemets courbes des entrées 0.x du changelog, gardés tels que publiés en attendant la décision d'Aistra (le test les ignore).
