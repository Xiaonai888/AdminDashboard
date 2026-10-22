# Security Policy

## Supported code

Security fixes should target the currently maintained default branch (`main`) and any deployed code paths. Do not assume a disabled UI route is a replacement for server-side authorization.

## Reporting a security issue

Please report suspected vulnerabilities privately to the repository owner using the repository's available private security-reporting option or an already established private contact channel. Do not publish working exploits, user data, access tokens, or confidential evidence in a public issue.

Include a brief description, affected path or API, reproduction steps without real customer data, expected versus actual behavior, and impact. Do not include live credentials or other people's personal information.

## Secure change requirements

- Validate and constrain untrusted input and output in its destination context.
- Prefer text rendering to HTML interpretation; avoid DOM XSS sinks for user data.
- Validate dynamic URL schemes/origins, upload types/sizes, and remote resource destinations.
- Preserve server-side authentication, authorization, permissions, ownership checks, and security-sensitive feature gates.
- Never reactivate a disabled feature unless specifically requested and reviewed.
- Verify the full diff and existing functionality before merging security fixes.
- Keep CodeQL and other existing security scans enabled; never dismiss a genuine finding just to reach zero alerts.
- Confirm any CodeQL closure only after a scan of the relevant updated commit completes.

## Code scanning

Use GitHub CodeQL **default setup** where available. It supports automated analysis without a committed workflow file. Before enabling or adding a separate CodeQL workflow, check whether default setup or advanced setup is already active to avoid overlapping scans. Review CodeQL alerts after significant changes and keep dependency/security tooling active.

A clean CodeQL dashboard is only one signal. It is not a guarantee of overall application security.
