# template-builder Documentation

## Files

| File | Purpose | Location |
|---|---|---|
| `schema.json` | Defines form fields and containers | Template root, e.g. `templates/<name>/schema.json` |
| `.formdata.json` | Stores user-entered form data | Template root, e.g. `templates/<name>/.formdata.json` |
| `index.html` | Liquid template that renders the page | Template root, e.g. `templates/<name>/index.html` |

## schema.json

See [schema.md](schema.md) for full field type reference.

Defines the form structure. Created by:

1. **Writing JSON manually** — follow the spec in schema.md
2. **Builder UI** — `template-builder dev <name>` → open `http://localhost:4001/template-builder/` → visual editor saves to schema.json automatically

Each field has a `property` (input_field, view_field, or group) and a `type`. Groups can be nested and marked as repeatable.

## .formdata.json

See [formdata.md](formdata.md) for structure and Liquid variable mapping.

Stores the actual form values. Created by:

1. **Builder form preview** — fill out the form, auto-saves via POST
2. **Writing JSON manually** — keys must match schema.json field keys

At render time, `.formdata.json` is loaded as the Liquid template context. Every top-level key becomes a Liquid variable:

```
.formdata.json        →  Liquid context         →  Template
{ "title": "Hello" }  →  title = "Hello"        →  {{ title }}
{ "items": [...] }     →  items = [...]          →  {% for item in items %}
{ "a": { "b": "x" } } →  a.b = "x"             →  {{ a.b }}
```

## Generating schema.json

Follow schema.md. Key rules:

- `input_field` + type for user-entry fields (text, email, select, file, etc.)
- `view_field` + type for display-only content (label, paragraph, img)
- `group` + `fields: { ... }` to group related fields
- `"repeatable": true` for lists (work experience, education entries)
- `layout` controls container arrangement: `"vertical"`, `"horizontal"`, `"flex"`, `"grid"`, `"div"`
- `className` matches CSS classes in index.html
- `options` is a JSON array for select fields: `["A", "B", "C"]`

```json
{
  "full_name": {
    "property": "input_field",
    "type": "text",
    "placeholder": "Full name",
    "required": true
  },
  "experiences": {
    "property": "group",
    "repeatable": true,
    "layout": "vertical",
    "fields": {
      "company": { "property": "input_field", "type": "text" },
      "years": { "property": "input_field", "type": "number" }
    }
  }
}
```

## Generating .formdata.json

Follow formdata.md. Key rules:

- Keys match schema.json field keys exactly
- Repeatable containers → array of objects
- Nested containers → nested objects
- File/image uploads → URL string or `/uploads/...` path
- Empty strings for unfilled optional fields

```json
{
  "full_name": "John Doe",
  "experiences": [
    { "company": "Acme Corp", "years": 3 },
    { "company": "Startup Inc", "years": 2 }
  ]
}
```

## Generating index.html

The template receives the entire `.formdata.json` as Liquid context. Use:

- `{{ field_key }}` for simple values
- `{{ container.field }}` for nested values
- `{% for item in container %}{{ item.field }}{% endfor %}` for repeatable lists
- Liquid filters like `| capitalize`, `| date: "%b %Y"` as needed

```html
<h1>{{ full_name }}</h1>
{% for exp in experiences %}
  <p>{{ exp.company }} — {{ exp.years }} years</p>
{% endfor %}
```

## Quick Reference

| Concept | schema.json | .formdata.json | index.html |
|---|---|---|---|
| Purpose | Form UI definition | Form values | Rendered output |
| Format | Keyed object of field defs | Keyed object of values | HTML + Liquid |
| Repeatable | `"repeatable": true` on group | Array of objects | `{% for %}` loop |
| Field attrs | `placeholder`, `required`, etc. | String/number values | `{{ key }}` variable |
| Nested data | `fields: { child: {...} }` | `{ parent: { child: "x" } }` | `{{ parent.child }}` |
