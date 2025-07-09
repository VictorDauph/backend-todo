# Utiliser une image de base
FROM node:22-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json dans le conteneur
COPY package*.json ./

# RUN est une instruction lancée au build de l'image.
# Installer les dépendances (installation au sein du projet)
RUN npm ci

# Installer nodemon dans le conteneur (installation dans l'environnement de développement)
RUN npm install -g nodemon

# Copier le reste des fichiers dans le conteneur (pour le fonctionnement correct de nodemon)
COPY . .


#Cmd est une instruction lancée à l'instanciation du conteneur.
# Commande à exécuter au démarrage du conteneur
CMD ["npm","run", "prod"]


