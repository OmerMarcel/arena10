# ARENA 10 — Football Intelligence (Version 2 Complète)

Plateforme interactive football nouvelle génération propulsée par **React 18**, **TypeScript**, **Vite** et **Three.js / React Three Fiber**.

---

## 🚀 Lancer le projet sur votre PC

```bash
cd arena10
npm install
npm run dev
```

Puis ouvrez l'adresse indiquée dans votre terminal (généralement `http://localhost:5173/`).

Pour tester le build de production :
```bash
npm run build
npm run preview
```

---

## ✨ Nouveautés & Fonctionnalités Version 2

### 1. 🏃 Joueur 3D Humanöide animé & interactif ([Player3D.tsx](file:///c:/Users/HP/Downloads/ARENA10-prototype/arena10/src/components/Player3D.tsx))
- Modélisation 3D complète avec maillot blanc, numéro 10 orange et bandes rouges & blanches.
- Ballon de football avec traînée cinétique dynamique (`Trail`).
- **5 modes d'animation interactifs** commutables d'un clic :
  - **Repos (Idle)** : balancement naturel et respiration
  - **Jonglage** : contrôle de balle pied gauche/droit alternatif
  - **Course** : foulée dynamique et déplacement du ballon
  - **Frappe** : armement, frappe puissante et rotation de balle
  - **Célébration** : bras levés au ciel et rotation de joie
- Éclairages de stade directionnels et ombres de contact (`ContactShadows`).

### 2. 📊 Les 7 Rubriques Complètes
- **Vue d'ensemble** ([OverviewPage.tsx](file:///c:/Users/HP/Downloads/ARENA10-prototype/arena10/src/components/OverviewPage.tsx)) : Hero 3D, métriques clés, match en direct, affiches vedettes, actualités flash et résumé des performances de l'IA.
- **Programme** ([SchedulePage.tsx](file:///c:/Users/HP/Downloads/ARENA10-prototype/arena10/src/components/SchedulePage.tsx)) : Calendrier complet, filtres par championnat, onglets par jour, indicateurs de forme (V/N/D), cotes et fiche modale détaillée par match.
- **Pronostics IA** ([PronosticsPage.tsx](file:///c:/Users/HP/Downloads/ARENA10-prototype/arena10/src/components/PronosticsPage.tsx)) : Coup du jour haute confiance, calcul de la Valeur Attendue (EV), tri par rentabilité, filtres par probabilité minimale et fiches analytiques déroulantes.
- **Comparateur de clubs** ([ComparatorPage.tsx](file:///c:/Users/HP/Downloads/ARENA10-prototype/arena10/src/components/ComparatorPage.tsx)) : Face-à-face interactif entre clubs européens, graphiques radars de compétences (xG, défense, possession, tirs, précision, clean sheets) et barres statistiques tête-à-tête.
- **Mon carnet** ([NotebookPage.tsx](file:///c:/Users/HP/Downloads/ARENA10-prototype/arena10/src/components/NotebookPage.tsx)) : Gestion de sélections de matchs, calcul des gains potentiels selon les mises, historique complet des paris avec taux de réussite, et **simulateur de Valeur Attendue (EV)** pour tester la rentabilité d'une cote.
- **Performances** ([PerformancePage.tsx](file:///c:/Users/HP/Downloads/ARENA10-prototype/arena10/src/components/PerformancePage.tsx)) : Graphique vectoriel svg de l'évolution mensuelle des gains, taux de réussite par championnat (Premier League, LaLiga, Ligue 1, etc.) et recommandations stratégiques algorithmiques.
- **Actualités** ([NewsPage.tsx](file:///c:/Users/HP/Downloads/ARENA10-prototype/arena10/src/components/NewsPage.tsx)) : Fil d'actualité football avec tags thématiques, article vedette, badges « Trending » et filtre par compétition.

### 3. 📱 Design Responsive Tous Écrans
- **Multi-écrans adaptatif** : Optimisé pour mobile (320px+), phablettes, tablettes (portrait & paysage), laptops, et écrans desktop ultra-larges.
- **Navigation mobile fluide** : Tiroir latéral animé avec hamburger menu et overlay tactile.
- **Format match intelligent** : Tableau multi-colonnes sur grand écran, transformé automatiquement en cartes tactiles complètes et lisibles sur smartphone.
- **Barre des jours tactile** : Défilement horizontal fluide (`touch-scrolling`) sans débordement.
- **Contrôles d'ambiance 3D & vidéo adaptatifs** : Positionnés intelligemment sur mobile pour ne jamais masquer le contenu.

---

## 🛠 Stack Technique
- **Frontend** : React 18, TypeScript, Vite 6
- **3D & Canvas** : Three.js, `@react-three/fiber`, `@react-three/drei`
- **Icônes** : Lucide React
- **Styles** : CSS custom haut de gamme avec typographies *Barlow Condensed* & *DM Sans*
