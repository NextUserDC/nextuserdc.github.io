# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, send an email to **eli.alexandern11@gmail.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix or mitigation**: Depends on severity

## Scope

This policy applies to:

- `nextuser.lat` (main site)
- `api.nextuser.lat` (Cloudflare Worker API)
- TMail (temporary email service)
- NCloud (file storage)
- Admin Panel

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |

## Security Measures

- Passwords are hashed with SHA-256 + random pepper
- Rate limiting on authentication endpoints
- CORS restricted to approved origins
- Content Security Policy headers
- HMAC integrity verification for client-stored tokens
- Input sanitization on all user-facing outputs
