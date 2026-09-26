/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/*
 * Couleurs des comptes unifiés
 * Thunderbird 153+
 *
 * Principe : Thunderbird 153+ associe l'indicateur de compte d'une carte à
 * la variable CSS --server-<serverKey>-color. Thunderbird alimente nativement
 * cette variable avec la couleur du compte (racine du compte).
 *
 * Cette extension remplace uniquement, dans about:3pane, cette variable par
 * la couleur explicitement choisie pour la boîte de réception du compte quand
 * elle existe. À défaut, la couleur native du compte est conservée.
 *
 * Aucune couleur n'est enregistrée ni modifiée par l'extension.
 */

var { ExtensionCommon } = ChromeUtils.importESModule(
  "resource://gre/modules/ExtensionCommon.sys.mjs"
);
var { ExtensionSupport } = ChromeUtils.importESModule(
  "resource:///modules/ExtensionSupport.sys.mjs"
);
var { FolderTreeProperties } = ChromeUtils.importESModule(
  "resource:///modules/FolderTreeProperties.sys.mjs"
);
var { FolderUtils } = ChromeUtils.importESModule(
  "resource:///modules/FolderUtils.sys.mjs"
);

var UnifiedAccountColors = class extends ExtensionCommon.ExtensionAPI {
  constructor(extension) {
    super(extension);
    this._started = false;
    this._listenerId = null;
    this._windows = new Map();
    this._observer = null;
  }

  async _getPreferredColor(server) {
    await FolderTreeProperties.ready;

    let inboxColor = null;
    try {
      const inbox = server.rootFolder.getFolderWithFlags(
        Ci.nsMsgFolderFlags.Inbox
      );
      if (inbox) {
        inboxColor = FolderTreeProperties.getColor(inbox.URI) || null;
      }
    } catch (error) {
      // Certains types de comptes n'ont pas de boîte de réception classique.
    }

    const accountColor =
      FolderTreeProperties.getColor(server.rootFolder.URI) || null;

    // Le dossier Courrier entrant est prioritaire : c'est la couleur visible
    // dans la vue Dossiers unifiés. Sinon on conserve la couleur du compte.
    return inboxColor || accountColor;
  }

  async _applyToAbout3Pane(about3Pane) {
    if (!about3Pane || about3Pane.closed || !about3Pane.document) {
      return;
    }

    const style = about3Pane.document.documentElement?.style;
    if (!style) {
      return;
    }

    const accounts = FolderUtils.allAccountsSorted(true);
    for (const account of accounts) {
      const server = account.incomingServer;
      if (!server) {
        continue;
      }

      const property = `--server-${server.key}-color`;
      const color = await this._getPreferredColor(server);
      if (color) {
        style.setProperty(property, color);
      } else {
        style.removeProperty(property);
      }
    }
  }

  async _restoreNativeColors(about3Pane) {
    if (!about3Pane || about3Pane.closed || !about3Pane.document) {
      return;
    }

    await FolderTreeProperties.ready;
    const style = about3Pane.document.documentElement?.style;
    if (!style) {
      return;
    }

    const accounts = FolderUtils.allAccountsSorted(true);
    for (const account of accounts) {
      const server = account.incomingServer;
      if (!server) {
        continue;
      }

      const property = `--server-${server.key}-color`;
      const accountColor =
        FolderTreeProperties.getColor(server.rootFolder.URI) || null;
      if (accountColor) {
        style.setProperty(property, accountColor);
      } else {
        style.removeProperty(property);
      }
    }
  }

  async _syncMailWindow(window) {
    if (!window || window.closed || !window.gTabmail) {
      return;
    }

    for (const tabInfo of window.gTabmail.tabInfo || []) {
      try {
        const about3Pane = tabInfo.chromeBrowser?.contentWindow;
        if (
          about3Pane &&
          (tabInfo.mode?.name === "mail3PaneTab" ||
            about3Pane.location?.href === "about:3pane")
        ) {
          await this._applyToAbout3Pane(about3Pane);
        }
      } catch (error) {
        console.debug(
          "[Couleurs des comptes unifiés] Onglet ignoré :",
          error
        );
      }
    }
  }

  async _syncAllWindows() {
    const promises = [];
    for (const window of this._windows.keys()) {
      promises.push(this._syncMailWindow(window));
    }
    await Promise.allSettled(promises);
  }

  _attachWindow(window) {
    if (!window || window.closed || this._windows.has(window)) {
      return;
    }

    const sync = () => {
      this._syncMailWindow(window).catch(error =>
        console.error(
          "[Couleurs des comptes unifiés] Synchronisation impossible :",
          error
        )
      );
    };

    // Le minuteur sert uniquement de garde-fou pour les nouveaux onglets et
    // pour les modifications de couleur qui ne déclencheraient pas d'observer.
    const timer = window.setInterval(sync, 1500);
    this._windows.set(window, timer);

    window.addEventListener(
      "unload",
      () => {
        const existingTimer = this._windows.get(window);
        if (existingTimer) {
          try {
            window.clearInterval(existingTimer);
          } catch (error) {}
        }
        this._windows.delete(window);
      },
      { once: true }
    );

    sync();
  }

  async _start() {
    if (this._started) {
      return;
    }
    this._started = true;

    await FolderTreeProperties.ready;

    this._listenerId = `${this.extension.id}-window-listener`;
    ExtensionSupport.registerWindowListener(this._listenerId, {
      chromeURLs: ["chrome://messenger/content/messenger.xhtml"],
      onLoadWindow: window => this._attachWindow(window),
    });

    // Prend aussi en charge les fenêtres déjà ouvertes au chargement de
    // l'extension (installation sans redémarrage).
    const enumerator = Services.wm.getEnumerator("mail:3pane");
    while (enumerator.hasMoreElements()) {
      this._attachWindow(enumerator.getNext());
    }

    this._observer = {
      observe: (_subject, topic) => {
        if (
          topic === "folder-color-changed" ||
          topic === "server-color-changed"
        ) {
          // Laisser Thunderbird appliquer son propre changement puis reprendre
          // la couleur de la boîte de réception si elle est définie.
          Services.tm.dispatchToMainThread(() => {
            this._syncAllWindows().catch(console.error);
          });
        }
      },
    };
    Services.obs.addObserver(this._observer, "folder-color-changed");
    Services.obs.addObserver(this._observer, "server-color-changed");

    await this._syncAllWindows();
  }

  getAPI(_context) {
    return {
      UnifiedAccountColors: {
        start: async () => {
          await this._start();
        },
      },
    };
  }

  onShutdown(isAppShutdown) {
    if (this._observer) {
      try {
        Services.obs.removeObserver(this._observer, "folder-color-changed");
      } catch (error) {}
      try {
        Services.obs.removeObserver(this._observer, "server-color-changed");
      } catch (error) {}
      this._observer = null;
    }

    if (this._listenerId) {
      try {
        ExtensionSupport.unregisterWindowListener(this._listenerId);
      } catch (error) {}
      this._listenerId = null;
    }

    for (const [window, timer] of this._windows.entries()) {
      try {
        window.clearInterval(timer);
      } catch (error) {}

      if (!window.closed) {
        for (const tabInfo of window.gTabmail?.tabInfo || []) {
          const about3Pane = tabInfo.chromeBrowser?.contentWindow;
          if (about3Pane) {
            this._restoreNativeColors(about3Pane).catch(() => {});
          }
        }
      }
    }
    this._windows.clear();
    this._started = false;

    if (!isAppShutdown) {
      Services.obs.notifyObservers(null, "startupcache-invalidate");
    }
  }
};
