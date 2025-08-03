# EKReader Contributing Guide

Contributions to EKReader are welcome! Before submitting your contribution though, please make sure to take a moment and read through the appropriate section for the contribution you intend to make:

* [Issue Reporting Guidelines](#issue-reporting-guidelines)
* [Pull Request Guidelines](#pull-request-guidelines)
* [Development Guide](#development-guide)

## Issue Reporting Guidelines

* The issue list of this repo is **exclusively** for bug reports and feature requests. Non-conforming issues will be closed immediately.

* Try to search for your issue, it may have already been answered or even fixed in the development branch.

* Check if the issue is reproducible with the latest stable version.

* It is **required** that you clearly describe the steps to reproduce the issue. If an issue labeled "need repro" receives no further input from the issue author for more than 5 days, it will be closed. Although I would love to help, diagnosing issues without clear reproduction steps is simply not sustainable.

* If your issue is resolved but still open, don’t hesitate to close it.

* Most importantly, please be patient: any issues must be balanced against many other responsibilities, and I cannot make guarantees about how fast your issue can be resolved. If you are in need of a fix as fast as possible, consider [opening a pull request](#pull-request-guidelines)!

## Pull Request Guidelines

* All commits [must be signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)

* If you would like to add a new feature, please open a suggestion issue first and provide a compelling reason to add this feature. If a new feature pull request is opened without a compelling reason, it may be rejected, though it may be revisted at a later time.

* If you are fixing a bug:
    * Please provide a detailed description of the bug in the PR, or link to an issue that does.
    * If you are resolving an issue, please include `(fix: #xxx[,#xxx])` in your title to help improve the release log.

## Development Guide

### Getting Started

To get started, first make sure your development environment is setup with the following tools:
* NodeJS 22+
* pnpm 10.14+


From there, follow these steps:

1. fork and clone this repo
2. run the following command in the project directory:
    * ```bash
        pnpm install
        ```
3. You're ready to start making changes!