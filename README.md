# Demo Fable Design

This project holds multiple standalone demo sites behind one React/Vite demo picker. The landing page is only an index for choosing demos and viewing their prompts.

## Demo Isolation Rule

Each demo MUST remain entirely sandboxed from every other demo.

Demo pages are intended to represent completely separate sites and experiences. Code from one demo must not leak into another demo, and demo implementations must not share styling, components, layouts, helpers, or assets unless there is an explicit product-level reason approved for that specific change.

When building or editing a demo:

- Keep the demo in its own folder under `src/projects/`.
- Give the demo its own route file, React components, and CSS.
- Do not import CSS from another demo.
- Do not reuse React components from another demo.
- Do not create shared demo styling for convenience.
- Do not let global CSS cascade into demo pages.
- Keep the main landing page styling separate from all demo pages.

The only shared project-level code should be routing/index metadata needed to list and reach the demos. The actual demo sites themselves must behave as isolated sandboxes.

## Development

```sh
npm install
npm run dev
```

Build:

```sh
npm run build
```
