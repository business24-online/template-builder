# @business24-online/template-builder

Visual form builder for creating Liquid-based templates. Design schemas visually, preview forms in real-time, and generate template projects.

## Install

```sh
# Globally from GitHub
npm i -g git+https://github.com/business24-online/template-builder.git

# Or from local directory
git clone https://github.com/business24-online/template-builder.git
cd template-builder
npm i -g .

# Or try without installing
npx @business24-online/template-builder dev
```

## Commands

```
template-builder <command>

Commands:
  dev [name]       Start dev server for a template
  generate         Create a new template from samples
```

### template-builder generate

Creates a new template project from starter samples.

```
template-builder generate
# Enter a name when prompted
```

### template-builder dev

Starts a dev server with a live preview and visual builder UI.

```
# Pick from a list
template-builder dev

# Or specify a template directly
template-builder dev my-template
```

Opens two URLs:
- **Template preview** — `http://localhost:4001` (your template rendered with form data)
- **Builder UI** — `http://localhost:4001/template-builder/` (visual form designer)

## How it works

1. Run `template-builder generate` to scaffold a new template from samples
2. Run `template-builder dev <name>` to start the dev server
3. Open the builder UI to design your form schema (add fields, containers, sections)
4. Fill out the form preview to save data
5. Your template's HTML renders the form data using Liquid variables

The builder lets you create input fields (text, email, select, file, etc.), view fields (labels, paragraphs, images), and repeatable container sections — all through a visual drag-free interface.
