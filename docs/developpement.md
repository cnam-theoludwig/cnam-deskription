# Développement

## Environement de développement

### Prérequis

- [Node.js](https://nodejs.org/) >= v22.12.0 [(`nvm install 22`)](https://nvm.sh)
- [pnpm](https://pnpm.io/) v10.10.0 [(`corepack enable`)](https://nodejs.org/docs/latest-v22.x/api/corepack.html)
- [Docker](https://www.docker.com/)

### Installation

```sh
# Cloner le dépôt
git clone git@github.com:cnam-theoludwig/cnam-deskription.git

# Se déplacer dans le dossier du projet
cd cnam-deskription

# Configurer les variables d'environnement
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# Installer les dépendances
pnpm install --frozen-lockfile
```

### Démarrer l'application

```sh
#  Démarrer les serveurs de développement
node --run dev

# Démarrer les services Docker de développement (exemple: base de données)
docker compose --file compose.dev.yaml up
```

#### Services démarrés par défaut (avec le `.env.example` par défaut)

- [`apps/api`](../apps/api): <http://localhost:8500> (documentation [OpenAPI avec Scalar](https://scalar.com) disponble)
- [`apps/website`](../apps/website): <http://localhost:4200> (application principale)
- [PostgreSQL](https://www.postgresql.org/), port: `5432`
- [Adminer](https://adminerneo.org/): <http://localhost:8080>

### Base de données

```sh
# Créer une migration
node --run database:migrate:make -- migration_name
# Modifier le fichier de migration, et ensuite exécutez:
node --run database:codegen
```

## Principaux Outils Informatiques Utilisés

- [TypeScript](https://www.typescriptlang.org/): Langage de programmation.
- [Angular](https://angular.dev/): Interface utilisateur (UI) et principal frontend de l'application.
- [oRPC](https://orpc.unnoq.com/) : API et principal backend de l'application.
    - [kysely](https://kysely.dev/): Générateur de requêtes SQL avec vérification de type.
    - [zod](https://zod.dev): Validation des données basée sur un schéma.

## Conventions développement informatique

### GitFlow

Le projet suit la convention [GitFlow](https://nvie.com/posts/a-successful-git-branching-model/) reposant sur 2 branches principales:

- `main`: Contient le code de la dernière version stable et déployé en production.
- `develop`: Contient le code en cours de développement. Les nouvelles fonctionnalités et les correctifs de bugs sont fusionnés ici régulièrement.

Idéalement, chaque nouvelle fonctionnalité ou correctif de bug est développé dans une branche dédiée à partir de `develop`, nommée `feat/<nom-de-la-fonctionnalité>` ou `fix/<nom-du-bug>`. Une fois le développement terminé, une pull request est créée pour demander une revue de code, et une fois validée, la branche est fusionnée dans `develop`, puis supprimée.

### Convention des commits

Les commits respectent la convention [Conventional Commits](https://www.conventionalcommits.org/) et [Semantic Versioning](https://semver.org/) pour la gestion des versions et des releases en fonction des commits.

Les commits doivent être **atomiques** c'est à dire qu'il respecte 3 règles:

- Ne concerne qu'un seul sujet (une fonctionnalité, une correction de bug, etc.).
- Doit avoir un message clair et concis.
- Ne doit pas rendre de dépôt "incohérent" (ne bloque pas la CI du projet).
