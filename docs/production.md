# Production

## Serveur - Accès SSH

(seulement possible dans le réseau local)

```bash
ssh mathys@vm-mathys
```

**Remarque:** Placez votre clé publique SSH (probablement située sur votre ordinateur local: `~/.ssh/id_ed25519.pub`) dans `~/.ssh/authorized_keys` (sur le serveur).

## Processus de déploiement avec Docker

Fusionnez la branche `develop` dans la branche `main` et créez une nouvelle version (e.g: sur GitHub).

Ensuite, sur le serveur, nous pouvons déployer la nouvelle version:

### Automatiquement

Le script [deploy.sh](../deploy.sh) peut être utilisé pour déployer la dernière version.

Ensuite, avec la tâche cron, nous pouvons configurer un "polling" pour vérifier les nouvelles versions régulièrement et les déployer automatiquement.

Exécutez `crontab -e` et ajoutez la ligne suivante pour une vérification toutes les 5 minutes. Le résultat sera enregistré dans `/home/mathys/deploy.log`:

```bash
*/5 * * * * /home/mathys/cnam-deskription/deploy.sh >> /home/mathys/deploy.log 2>&1
```

### Manuellement

```bash
cd cnam-deskription
git fetch --prune
git checkout <version>

# Remplacez <version> par la version souhaitée, par exemple: v1.0.0
git checkout v1.0.0

VERSION=$(git describe --tags) docker compose up --build --detach
```

## Services démarrés (`.env.example` par défaut)

- `apps/website`: <http://localhost:8000>
- `apps/api`: <http://localhost:8500>

```sh
# Pour exécuter des commandes dans un service (e.g: `deskription-api`)
docker compose exec deskription-api bash

# Pour consulter les logs d'un service (e.g: `deskription-api`)
docker compose logs --follow deskription-api

# Exécuter une requête à la base de données
docker compose exec deskription-database bash
psql --username="$DATABASE_USER" --host="$DATABASE_HOST" --port="$DATABASE_PORT" --dbname="$DATABASE_NAME"
SELECT * FROM "Furniture";
```
