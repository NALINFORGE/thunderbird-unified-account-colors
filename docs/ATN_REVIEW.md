# Thunderbird Add-ons reviewer notes

## Purpose

Unified Account Colors changes only the color of Thunderbird's existing account indicator in the message card view of unified folders.

## Why an Experiment API is required

The required values and UI surface are not exposed by standard MailExtension APIs:

1. `FolderTreeProperties` stores Thunderbird's folder/account colors.
2. The native message-card account indicator is styled inside `about:3pane`.
3. The add-on sets the existing `--server-<serverKey>-color` CSS variables so Thunderbird's own indicator uses the Inbox color already chosen by the user.

## Internal modules used

- `resource:///modules/FolderTreeProperties.sys.mjs`
- `resource:///modules/FolderUtils.sys.mjs`
- `resource:///modules/ExtensionSupport.sys.mjs`
- `resource://gre/modules/ExtensionCommon.sys.mjs`

The code also uses standard Thunderbird `Services`, `Ci`, and the `mail:3pane` window enumerator available to the Experiment context.

## Data handling

- no network requests;
- no remote code;
- no telemetry or analytics;
- no reading of message bodies or attachments;
- no external storage;
- no modification of Thunderbird's saved color values.

## Reproduction / build

There is no transpilation, minification, bundling, or dependency installation.

The XPI is created directly from the repository source files:

```bash
python3 scripts/package.py
```

The resulting XPI contains the same JavaScript and JSON files as the repository.
