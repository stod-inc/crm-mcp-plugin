# Security Policy

## Supported versions

Only the latest tagged Plugin release is supported.

## Reporting a vulnerability

Use GitHub Private vulnerability reporting for vulnerabilities, authentication bypasses, credential exposure, unintended disclosure of CRM data, or a way to read or write beyond what a person's own account allows.

Do not include access tokens, cookies, customer data, CRM responses, or exploit details in a public Issue. Public Issues may be used for installation and documentation problems that do not expose security-sensitive information.

## What this repository holds

- The address of an MCP server and the instructions an AI assistant follows when it reads from or writes to it.
- No customer data and no credentials.

Using the server requires a browser login by a person who has been approved individually. The server checks that login on every request, decides what that person may read or write from their own CRM account, and records every write under that person's name. Nothing in this repository can widen those limits.
