# ATN listing draft

## Name

Unified Account Colors

French: Couleurs des comptes unifiés

## Summary

Reuse Thunderbird's existing account and Inbox colors to identify which account each message belongs to in unified folders — with no extra configuration.

## Description

Unified Account Colors is a small, configuration-free Thunderbird add-on for users who work with several mail accounts in Unified Folders.

Thunderbird can assign different colors to accounts and folders, but those colors are not always carried into the message cards shown in a unified folder. This add-on bridges that gap: it reuses the Inbox color already chosen in Thunderbird for the corresponding account indicator in the message list.

There is nothing to configure in the add-on itself. Change a color in Thunderbird and the message indicator follows it automatically.

### Features

- No settings page.
- Uses Thunderbird's existing colors.
- Inbox color has priority; account color is used as fallback.
- Works in unified message views using Thunderbird's native account indicator.
- No network access.
- No telemetry or analytics.
- No reading of message bodies or attachments.
- Open source under MPL-2.0.

### Permission notice

The add-on uses a Thunderbird Experiment API because the internal folder-color store and the `about:3pane` account-indicator styling are not exposed through standard MailExtension APIs. Thunderbird therefore displays the broad “full, unrestricted access” permission associated with Experiment APIs. The implementation is small and publicly auditable.

## Category

Appearance and Customization

Secondary fit: Folders and Filters

## Release notes — 0.1.0

Initial public release. Reuses the Thunderbird Inbox color for the native account indicator in unified folders, with fallback to the account color and automatic resynchronisation after color changes.

## Privacy

No data collection. No network requests. No telemetry. All processing is local inside Thunderbird.

## Source / support

To be filled after the NalinForge GitHub repository is created.
