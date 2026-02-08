# Contributing MCP Servers

Thank you for contributing to the MCPMux server registry!

## License

This repository is licensed under the [Elastic License 2.0 (ELv2)](LICENSE). By contributing, you agree that your contributions will be licensed under the same license.

## Developer Certificate of Origin (DCO)

All contributions must be signed off:

```bash
git commit -s -m "Add my-server"
```

By signing off, you certify you have the right to submit the contribution under this license. See [developercertificate.org](https://developercertificate.org/) for details.

## Adding a Server

### 1. Create Server Definition

Create a JSON file in `servers/` following this structure:

```json
{
  "id": "your-server-id",
  "name": "Your Server Name",
  "description": "What your server does",
  "author": "your-github-username",
  "repository": "https://github.com/you/your-server",
  "transport": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "your-package"]
  },
  "categories": ["category1", "category2"]
}
```

### 2. Validation

Your server definition will be validated against our schema. Ensure:

- `id` is unique and lowercase (e.g., `my-cool-server`)
- `name` is human-readable
- `description` clearly explains what the server does
- `repository` points to the source code
- `transport` specifies how to run the server

### 3. Submit PR

1. Fork this repository
2. Add your server file: `servers/your-server-id.json`
3. Sign off your commit: `git commit -s`
4. Create a Pull Request

### Review Process

- Automated validation checks schema compliance
- Maintainers review for quality and security
- Once approved, your server appears in the MCPMux registry

## Updating a Server

Follow the same process. Update your existing file and submit a PR.

---

## Trademark & Branding Policy

### Icons

- You may reference icon URLs in the `icon` field (emoji or external URL)
- McpMux does not host icons — they are loaded directly from the URL you provide
- Do NOT submit URLs to assets you don't have the right to reference
- Prefer emoji icons or GitHub avatar URLs when possible

### Naming & Descriptions

- Server names may reference third-party products for identification
  (e.g., "MCP Server for GitHub" is OK)
- Use language like "works with", "for", or "connects to"
- Do NOT use "official", "certified", "endorsed", or "licensed"
  unless you represent the trademark owner and have been verified by McpMux

### Official Status

- All community submissions default to `official: false`
- To claim `official: true`, you must represent the trademark owner
  and go through the McpMux verification process
- False claims of official status will result in submission removal

### Maintainer-Only Fields

The following fields are controlled by McpMux maintainers and must NOT be set
by contributors:

- `publisher.official` — requires proof of authorization from the trademark holder
- `publisher.verified` — granted after McpMux review
- `publisher.domain_verified` — requires DNS verification
- `badges` containing `"official"` or `"verified"`

PRs that set these fields will be rejected unless submitted by a verified publisher.

---

## Contributor Terms

By submitting a Pull Request to this repository, you agree that:

1. You have the right to reference any URLs included in your submission
2. You are not claiming official status or endorsement you do not have
3. You accept responsibility for trademark compliance of your submission
4. You grant McpMux a license to display the submitted definition, including
   rendering any referenced icon URLs, on the McpMux discover site and desktop app
5. You understand McpMux may modify or remove your submission at any time
   in response to trademark concerns

---

## Questions?

Open an issue if you need help.
