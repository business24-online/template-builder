# schema.json

Defines the form fields and containers rendered in the builder UI. Placed in the template root directory (e.g. `templates/<name>/schema.json`).

## Format

A flat JSON object keyed by field/container name:

```json
{
  "<field_key>": { <field_definition> },
  "<container_key>": { <container_definition> }
}
```

## Field Definitions

### Input Fields (user enters data)

| Type | property | Allowed Attributes |
|---|---|---|
| `text` | `input_field` | `placeholder`, `required`, `default`, `minlength`, `maxlength`, `pattern`, `autocomplete`, `className`, `id`, `style`, `disabled`, `readonly` |
| `email` | `input_field` | `placeholder`, `required`, `default`, `minlength`, `maxlength`, `pattern`, `autocomplete`, `className`, `id`, `style`, `disabled`, `readonly` |
| `url` | `input_field` | `placeholder`, `required`, `default`, `minlength`, `maxlength`, `pattern`, `autocomplete`, `className`, `id`, `style`, `disabled`, `readonly` |
| `tel` | `input_field` | `placeholder`, `required`, `default`, `minlength`, `maxlength`, `pattern`, `autocomplete`, `className`, `id`, `style`, `disabled`, `readonly` |
| `textarea` | `input_field` | `placeholder`, `required`, `default`, `minlength`, `maxlength`, `pattern`, `rows`, `cols`, `autocomplete`, `className`, `id`, `style`, `disabled`, `readonly` |
| `number` | `input_field` | `placeholder`, `required`, `default`, `min`, `max`, `step`, `className`, `id`, `style`, `disabled`, `readonly` |
| `date` | `input_field` | `placeholder`, `required`, `default`, `min`, `max`, `className`, `id`, `style`, `disabled`, `readonly` |
| `select` | `input_field` | `placeholder`, `required`, `default`, `options`, `className`, `id`, `style`, `disabled`, `readonly` |
| `file` | `input_field` | `required`, `default`, `accept`, `multiple`, `className`, `id`, `style`, `disabled`, `readonly` |
| `color` | `input_field` | `required`, `default`, `className`, `id`, `style`, `disabled`, `readonly` |
| `image` | `input_field` | `required`, `default`, `accept`, `multiple`, `className`, `id`, `style`, `disabled`, `readonly` |

### View Fields (display only)

| Type | property | Allowed Attributes |
|---|---|---|
| `label` | `view_field` | `content`, `className`, `id`, `style` |
| `paragraph` | `view_field` | `content`, `className`, `id`, `style` |
| `img` | `view_field` | `content`, `alt`, `className`, `id`, `style` |

## Container (Group) Definitions

A container groups fields together. It uses `property: "group"`.

| Key | Type | Description | Default |
|---|---|---|---|
| `property` | `"group"` | Marks this as a container | required |
| `layout` | string | Container layout: `"div"`, `"vertical"`, `"horizontal"`, `"flex"`, `"grid"` | `"vertical"` |
| `repeatable` | boolean | If true, users can add/remove multiple instances | `false` |
| `className` | string | CSS class added to the container element | omitted |
| `style` | string | Inline styles for the container | omitted |
| `fields` | object | Nested field definitions (same format as root) | `{}` |

### Layout Default CSS

| Layout | CSS |
|---|---|
| `div` | `margin: 16px 0` |
| `vertical` | `display: flex; flex-direction: column; gap: 16px; margin: 16px 0` |
| `horizontal` | `display: flex; overflow-x: auto; gap: 16px; margin: 16px 0` |
| `flex` | `display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0` |
| `grid` | `display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin: 16px 0` |

## Attribute Details

| Attribute | Applies To | Description |
|---|---|---|
| `placeholder` | text, email, url, tel, textarea, number, date, select | Placeholder text shown in empty input |
| `required` | all input types | Marks field as required |
| `default` | all input types, select | Default value when none entered |
| `minlength` | text, email, url, tel, textarea | Minimum character length |
| `maxlength` | text, email, url, tel, textarea | Maximum character length |
| `pattern` | text, email, url, tel, textarea | Regex validation pattern |
| `autocomplete` | text, email, url, tel, textarea | Browser autocomplete hint |
| `rows` | textarea | Visible number of rows |
| `cols` | textarea | Visible number of columns |
| `min` | number, date | Minimum value |
| `max` | number, date | Maximum value |
| `step` | number | Step increment |
| `options` | select | JSON array of option strings, e.g. `["Yes","No","Maybe"]` |
| `accept` | file, image | Accepted file extensions, e.g. `".jpg,.png,.pdf"` |
| `multiple` | file, image | Allow multiple file selection |
| `content` | label, paragraph, img | Static content text or image URL/data-URI |
| `alt` | img | Alt text for image |
| `className` | all types | CSS class name for styling |
| `id` | all types | HTML id attribute |
| `style` | all types | Inline CSS styles |
| `disabled` | all input types | Disables the input |
| `readonly` | all input types | Makes input read-only |

## Examples

### Simple fields

```json
{
  "full_name": {
    "property": "input_field",
    "type": "text",
    "placeholder": "Enter your full name",
    "required": true,
    "className": "template-input-field"
  },
  "bio": {
    "property": "input_field",
    "type": "textarea",
    "placeholder": "Tell us about yourself",
    "rows": 5,
    "className": "template-input-field"
  },
  "country": {
    "property": "input_field",
    "type": "select",
    "placeholder": "Select country",
    "options": ["USA", "Canada", "UK", "Australia"],
    "className": "template-input-field"
  },
  "avatar": {
    "property": "input_field",
    "type": "image",
    "accept": ".jpg,.png,.webp",
    "className": "template-input-field"
  }
}
```

### With a basic container

```json
{
  "template_title": {
    "property": "input_field",
    "type": "text",
    "placeholder": "Site title"
  },
  "contact": {
    "property": "group",
    "layout": "grid",
    "style": "grid-template-columns: 1fr 1fr;",
    "fields": {
      "email": {
        "property": "input_field",
        "type": "email",
        "placeholder": "Email"
      },
      "phone": {
        "property": "input_field",
        "type": "tel",
        "placeholder": "Phone"
      }
    }
  }
}
```

**Important:** A repeatable group always produces an array of **objects** in `.formdata.json`, one per instance. Each object's keys are the child field keys defined in `fields`. This applies even if the group has only one child field — the array items are still objects, never flat values.

### With a repeatable container (e.g. work experience)

```json
{
  "experiences": {
    "property": "group",
    "repeatable": true,
    "layout": "vertical",
    "fields": {
      "company": {
        "property": "input_field",
        "type": "text",
        "placeholder": "Company name"
      },
      "role": {
        "property": "input_field",
        "type": "text",
        "placeholder": "Job title"
      },
      "start_date": {
        "property": "input_field",
        "type": "date",
        "placeholder": "Start date"
      },
      "end_date": {
        "property": "input_field",
        "type": "date",
        "placeholder": "End date"
      },
      "description": {
        "property": "input_field",
        "type": "textarea",
        "placeholder": "Describe your role"
      }
    }
  }
}
```

### With view fields (display only)

```json
{
  "section_heading": {
    "property": "view_field",
    "type": "label",
    "content": "Personal Information",
    "className": "section-label"
  },
  "profile_picture": {
    "property": "view_field",
    "type": "img",
    "content": "https://example.com/photo.jpg",
    "alt": "Profile photo"
  },
  "instructions": {
    "property": "view_field",
    "type": "paragraph",
    "content": "Fill in all required fields below."
  }
}
```

## Generated via template-builder generate

Run `template-builder generate` — it copies `samples/` (which includes a starter `schema.json`) into a new directory under the templates folder. Edit the generated `schema.json` to add your fields.

## Created via Builder UI

Run `template-builder dev <name>`, open `http://localhost:4001/template-builder/`, and use the visual editor to add fields and containers. The builder saves the schema automatically to `schema.json`.
