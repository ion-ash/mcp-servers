## New Server Definition

**Server Name:**
**Server ID:**
**Transport:** stdio / http
**Repository:**

### Checklist

- [ ] JSON file placed in `servers/` directory
- [ ] File name matches server ID (e.g., `com.example.server.json`)
- [ ] Schema validates (`npm run validate servers/your-file.json`)
- [ ] No ID/alias conflicts (`npm run check-conflicts`)
- [ ] Required fields: `id`, `name`, `transport`
- [ ] Description provided
- [ ] At least one category assigned
- [ ] Publisher information included
- [ ] Repository link provided
