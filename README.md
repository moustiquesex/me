# Idriss Bouhière — site bilingue

Site personnel destiné aux milieux européens, reconstruit sans reprendre le design de l'ancien site. HTML généré en français et en anglais, sans dépendance logicielle à installer, avec Node.js 22 ou plus récent.

## État de la livraison

- Design et pages FR/EN réalisés ; portrait fourni et parcours rédigé à partir du CV Europass.
- Adresse de contact : idriss.bouhiere@gmail.com.
- Aucun article inventé : la collection Publications est vide en attendant les textes.
- Lecteur PDF public, demandes de PDF par courriel et recherche de publications pris en charge.
- Configuration Pages CMS et déploiement GitHub Actions fournis, pas encore connectés au compte GitHub.
- Version publiable. Les accès auteur portent la directive noindex.

## Aperçu local

Dans ce dossier :

```sh
npm run build
npm run check
npm run preview
```

Ouvrir http://127.0.0.1:4173/fr/ ou http://127.0.0.1:4173/en/. Le dossier `dist` contient le site généré. Ne pas ouvrir directement ses fichiers HTML par double-clic : les liens sont conçus pour un serveur web.

## Mettre en ligne sur GitHub Pages

1. Conserver une sauvegarde du dépôt actuel. Ajouter cette version sur une branche de travail ou un nouveau dépôt avant de remplacer la version publiée. Ne pas déposer le ZIP seul : déposer son contenu, y compris `.pages.yml` et `.github/workflows/pages.yml`.
2. Relire les textes français et anglais dans `content/site.json`. Ils constituent une synthèse éditoriale du CV, pas une certification des diplômes. Coursera est distingué des diplômes universitaires ; le stage CNAPD et le tutorat bénévole gardent leurs intitulés réels.
3. Le site est configuré pour l’indexation publique.
4. Dans Settings > Pages, choisir GitHub Actions comme source. Le workflow construit le site et publie `dist`. La branche attendue est `main`.
5. Configurer le domaine `bouhiere.eu` et vérifier ses DNS. Résoudre l'erreur de certificat constatée sur l'ancien site, puis activer Enforce HTTPS quand GitHub le propose.
6. Vérifier le site public, les liens et le contact. Dans Google Search Console, valider le domaine et soumettre `https://bouhiere.eu/sitemap.xml`.

Le domaine reste payant à renouveler chez son fournisseur. GitHub Pages gratuit utilise un dépôt public. Les documents et brouillons déposés dans ce dépôt sont donc publics, même s'ils ne sont pas affichés sur le site.

## Espace auteur

La page `/fr/admin/` est un accès au service Pages CMS. Elle n'implémente pas un faux mot de passe local. La connexion et les autorisations sont gérées par GitHub et Pages CMS.

1. Aller sur https://app.pagescms.org et se connecter avec GitHub.
2. Installer/autoriser l'application uniquement sur le dépôt choisi. Cette étape doit être effectuée par le propriétaire du compte ; aucun jeton n'est embarqué dans le site.
3. Ouvrir le dépôt et la branche `main`. La configuration `.pages.yml` affiche « Profil, formation et réglages » et « Publications ».
4. Pour créer une publication : choisir un identifiant comme `securite-europeenne`, une date, un format, un mode de diffusion et remplir au moins une langue (titre + résumé). L'autre langue reste optionnelle. Si elle manque, le sélecteur mène à la liste dans cette langue et aucune traduction artificielle n'est indexée.
5. Le champ Texte accepte du texte avec des paragraphes séparés par une ligne vide. Cette première version n'utilise pas de mise en forme enrichie.
6. Activer « Publier » puis enregistrer. Le workflow GitHub reconstruit les pages. Consulter l'onglet Actions si la mise à jour n'apparaît pas.

## Documents

- **PDF sur demande** : aucun PDF dans le dépôt. Le bouton ouvre la messagerie du visiteur avec le titre du document ; Idriss répond manuellement avec le fichier. Ce n'est pas un formulaire ni un envoi automatique.
- **PDF public** : téléverser un fichier dans `uploads`, le sélectionner dans le champ PDF, puis choisir « PDF public avec lecteur intégré ». Le PDF reste téléchargeable. L'affichage intégré dépend du navigateur ; le lien de téléchargement reste disponible sur mobile.
- **Texte seul** : aucun PDF ni bouton de demande.
- Ne pas déposer le CV Europass brut ou des scans de diplômes dans le dépôt sans avoir supprimé les données que l'on ne souhaite pas rendre publiques.

## Langues et référencement

Pages distinctes `/fr/` et `/en/`, balises `hreflang`, URL canonique propre à chaque langue, sitemap, données structurées et contenu HTML lisible sans JavaScript. La racine affiche la version anglaise avec une URL canonique `/en/`. Une suggestion propose l’autre langue d’après la langue principale du navigateur, sans forcer de redirection. FR/EN reste visible partout.

Le nom public est uniquement **Idriss Bouhière**. Aucun résultat ou classement Google n'est garanti.

## Fichiers

- `content/site.json` : profil, diplômes, expériences, contact et validation de publication.
- `content/publications/*.json` : textes publiés via le CMS.
- `assets/` : design, comportements et portrait original.
- `scripts/build.mjs` : génération et validation des publications.
- `.pages.yml` : formulaire Pages CMS (JSON valide en YAML).
- `.github/workflows/pages.yml` : déploiement gratuit GitHub Pages.

Références : https://pagescms.org/docs/ ; https://docs.github.com/en/pages ; https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites


## Publication des PDF

Seuls les PDF sont proposés par la configuration du CMS. GitHub Actions contrôle la signature PDF, le type MIME détecté par libmagic et une taille maximale de 10 Mio avant le déploiement. Les noms servis sont remplacés par des UUID. Les contrôles ont lieu après réception par Pages CMS et enregistrement dans GitHub. Le fichier d’origine reste visible dans le dépôt public et son historique. Ces contrôles ne constituent pas un service sécurisé de réception avant stockage, ni un antivirus. Voir AUDIT.md pour les limites et les étapes restant à vérifier.

## Modifications ultérieures

Pour les textes, utiliser Pages CMS. Pour le design et les fonctionnalités, modifier les sources de ce même dossier ou fournir à Codex le dépôt GitHub. Chaque commit dans main relance le déploiement. L’historique GitHub permet de retrouver une version antérieure. Ne pas remplacer le site par une copie du seul dossier dist si l’on souhaite conserver cette chaîne de publication.
