# GitHub Actions

I'm using [gh action lockfiles](https://github.blog/changelog/2026-10-14-github-actions-workflow-lockfiles-in-public-preview/) and the [gh actions-lock](https://github.com/github/gh-actions-lock) extension to `gh`, the github cli. This pins gh action dependencies to specific commitments instead of mutable tags which is a security measure.

## Setup

`gh extension install github/gh-actions-lock`

## Usage

```sh
gh actions-lock # Initialize, lock refs
gh actions-lock --relock # Advancing moved refs (main, v4) to current upstream commits
gh actions-lock --verify # CI: the same checks as a fix run
gh actions-lock --verify-local # Pre-commit: every uses: has a lockfile entry (coverage only, not provenance)
gh actions-lock --no-fix # Read-only report
```

The extension's documentation is the best reference. I have not used it in any actions (e.g. to verify actions while running them) nor am I clear on how it interacts with dependabot.
