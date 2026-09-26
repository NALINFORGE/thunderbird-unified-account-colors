# Unified Account Colors

**Publisher:** NalinForge  
**Version:** 0.1.0  
**Platform:** Thunderbird 153–157.*

Unified Account Colors is a deliberately small Thunderbird add-on that makes unified folders easier to read when several mail accounts are displayed together.

It reuses the colors already configured in Thunderbird. There is no add-on settings page and no duplicate color configuration.

## How it works

- reads the color already assigned by Thunderbird to each account / Inbox;
- uses that color for the account indicator shown on message cards in unified folders;
- gives priority to the Inbox color when one is explicitly configured;
- falls back to the account color when no Inbox color is defined;
- watches Thunderbird color changes and reapplies them automatically;
- restores Thunderbird's native colors when the add-on is disabled or removed.

The add-on does **not** send network requests, does **not** collect telemetry, does **not** read message bodies, and does **not** maintain a separate color database.

## Why the permission is broad

This add-on uses a Thunderbird **Experiment API** because the folder-color storage and `about:3pane` UI are internal Thunderbird APIs that are not exposed through standard MailExtension APIs. Thunderbird therefore displays the permission *Have full, unrestricted access to Thunderbird, and your computer* for this add-on class.

The implementation is intentionally limited to:

- `FolderTreeProperties` for Thunderbird's saved folder/account colors;
- `FolderUtils` for configured mail accounts;
- the `about:3pane` document for the account-indicator CSS variables;
- Thunderbird observer notifications for color changes.

See [`PRIVACY.md`](PRIVACY.md) and [`docs/ATN_REVIEW.md`](docs/ATN_REVIEW.md).

## Installation for development

1. Open Thunderbird.
2. Open **Add-ons and Themes**.
3. Use **Debug Add-ons** / temporary installation, or package the repository as an XPI.
4. Open a unified folder in Card View.

## Packaging

An XPI is a ZIP archive of the extension files with `manifest.json` at the archive root.

```bash
python3 scripts/package.py
```

The generated file is written to `dist/`.

## License

Mozilla Public License 2.0. See [`LICENSE`](LICENSE).

---

## Français

**Couleurs des comptes unifiés** reprend directement les couleurs déjà configurées dans Thunderbird afin de distinguer les comptes dans les dossiers unifiés. Le module ne possède aucune page de configuration, n'enregistre aucune couleur supplémentaire et n'effectue aucune connexion réseau.

La couleur du dossier **Courrier entrant** est utilisée en priorité ; à défaut, le module conserve la couleur native du compte.
