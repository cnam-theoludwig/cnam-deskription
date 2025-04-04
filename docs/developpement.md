# Développement

## Environement de développement

### Prérequis

- [Node.js](https://nodejs.org/) >= v22.12.0 [(`nvm install 22`)](https://nvm.sh)
- [pnpm](https://pnpm.io/) v9.15.9 [(`corepack enable`)](https://nodejs.org/docs/latest-v22.x/api/corepack.html)
- [Docker](https://www.docker.com/)

### Installation

```sh
# Cloner le dépôt
git clone git@github.com:cnam-theoludwig/cnam-deskription.git

# Se déplacer dans le dossier du projet
cd cnam-deskription

# Installer les dépendances
pnpm install --frozen-lockfile
```

### Démarrer l'application

```sh
# TODO
```

#### Services démarrés par défaut (avec le `.env.example` par défaut)

<!-- - [`apps/api`](../apps/api): <http://localhost:7500>
- [`apps/website`](../apps/website): <http://localhost:7000> (application principale) -->

## Principaux Outils Informatiques Utilisés

## Conventions développement informatique

## GitFlow

Le projet suit la convention [GitFlow](https://nvie.com/posts/a-successful-git-branching-model/) reposant sur 3 branches principales:

- `main`: Contient le code de la dernière version stable et déployé en production.
- `staging`: Contient le code en cours de test avant déploiement en production, Quality Assurance (QA).
- `develop`: Contient le code en cours de développement. Les nouvelles fonctionnalités et les correctifs de bugs sont fusionnés ici régulièrement.

Idéalement, chaque nouvelle fonctionnalité ou correctif de bug est développé dans une branche dédiée à partir de `develop`, nommée `feat/<nom-de-la-fonctionnalité>` ou `fix/<nom-du-bug>`. Une fois le développement terminé, une pull request est créée pour demander une revue de code, et une fois validée, la branche est fusionnée dans `develop`, puis supprimée.

## Convention des commits

Les commits respectent la convention [Conventional Commits](https://www.conventionalcommits.org/) et [Semantic Versioning](https://semver.org/) pour la gestion des versions et des releases en fonction des commits.

Les commits doivent être **atomiques** c'est à dire qu'il respecte 3 règles:

- Ne concerne qu'un seul sujet (une fonctionnalité, une correction de bug, etc.).
- Doit avoir un message clair et concis.
- Ne doit pas rendre de dépôt "incohérent" (ne bloque pas la CI du projet).
