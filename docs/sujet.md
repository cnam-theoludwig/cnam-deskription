# Application de visualisation et de traçage des mobiliers dans les bâtiments tertiaires

Pour gérer des flottes de mobilier en location et permettre le réemploi.

## Concept et objectif

L'Europe introduit le DPP (Digital Product Passport) qui permet de faire une traçabilité des objets dans le temps afin de faciliter l'économie circulaire. Cette régulation va s'appliquer sur les batteries dans un premier temps mais tous les objets sont concernés. Le projet se propose d'explorer une utilisation du DPP pour les mobiliers de bureau. Il s'agit de pouvoir identifier « quoi est où et quand ». L'application doit pouvoir permettre de:

- Localiser les mobiliers
- Gérer la location de ces mobiliers et faciliter le réemploi auprès d'autres utilisateurs
- Gérer l'état fonctionnel des mobiliers
- Faciliter le stockage et visualiser les flux des mobiliers entre zone de stockage et client
- Gérer les gisements de mobilier en fonction des besoins exprimés par les clients

## Design et fonctions attendues

- Définition et création d'un dataset décrivant les différents mobiliers et leur localisation. Par exemple:

    - Identifiant
    - Type et description (référence du modèle)
    - Date de mise en service et historique des opérations de maintenance
    - Localisation courante et historique des localisations
    - Lien vers une photo du modèle
    - Niveau fonctionnel (bon état, état moyen...)
    - etc.

- Visualisation sur un carte d'un bâtiment des différents mobiliers à partir de la lecture du dataset
- Export d'une liste de mobilier selon certains critères (état, type, lieu = bâtiment ou étage, loué/disponible)
- Visualisation de cette liste sur une zone géographique

## Points d'attention et suggestions

- Commencer en identifiant les différents mobiliers qui peuvent exister dans un bureau.
- Comment représenter la localisation dans un immeuble. Coordonnées et altitude ?
- Référentiel par rapport à une carte ? Une adresse ?
- Rechercher s'il existe des standards pour décrire l'état fonctionnel d'un objet, les opérations de maintenance.
- Démarrer le prototype avec un seul bâtiment puis ajouter un bâtiment de stockage.
- Construire « à la main » votre data set avec une moulinette qui peut s'inspirer des travaux du groupe 1 pour ce qui concerne la localisation.
