# Ammonia synthesis dashboard

Interactive French-language engineering dashboard for a net production target of **100,000 tonnes NH₃/year**.

Live dashboard: https://TahaBo04.github.io/ammonia-synthesis-dashboard/

## Reference basis

The supplied report `Synthese_ammoniac_100000_t_an_8256h_style_vert.pdf`, dated 27 September 2026, retains three adiabatic catalytic beds with indirect intercooling at 122.5 bar and 32.25% single-pass N₂ conversion. Three weeks of planned shutdown give `(365 - 21) × 24 = 8,256 hours/year`.

The dashboard distinguishes:

- **Point du rapport**: the report operating configuration, recalculated with the active assumptions.
- **Candidat économique**: a new discrete/local optimization for those assumptions.
- **Exploration manuelle**: adjustable operating configurations.

Views include thermodynamic/kinetic plots, adiabatic trajectories, bed comparisons, annual and hourly species balances, energy, costs, catalyst quantities and the report's instrumented flowsheet. JSON/CSV exports preserve assumptions and scenario classifications.

## Interpretation

This is a preliminary screening model, not a validated industrial design. It uses ideal-gas NIST Shomate properties, a reversible surrogate kinetic law, perfect NH₃ separation and hypothetical partial costs. Purge zero is an assumption. Upstream hydrogen and nitrogen production is outside the synthesis-unit boundary. A digital twin, validated catalyst sizing and mechanical design are not claimed.

The report's 348.24 MAD/t cost and 74.17 MMAD CAPEX belong to the historical **8,000-hour** screening. The dashboard recalculates current costs and labels the historical comparison separately. At the retained point and 8,256 hours, the model gives about 346.42 MAD/t and 72.91 MMAD. Its potential power generation is 1.474 MWe, covering 30.7% of synthesis loads. The report's stale 9.10/9.36 MW and 30.2% figures are corrected from the balances.

## Source and verification

- `src/content/dashboard/model.mjs`: equations, balances and optimization.
- `src/content/dashboard/AmmoniaApp.jsx`: interactive views and exports.
- `src/content/dashboard/ReportView.jsx`: reactor, instrumentation and historical reference.
- `src/data.json`: reviewed assumptions and provenance.
- `site/`: verified static build deployed by GitHub Pages.

Run the focused calculation checks:

```sh
node --test tests/report-reference.test.mjs src/content/dashboard/model.test.mjs
```

Follow `AGENTS.md` for authoring/build instructions. After a verified build, run `node deploy/prepare-pages.mjs` to package `dist/` into `site/`, then commit both source and the updated static bundle. GitHub Actions validates the equations and bundle hashes before deploying `site/`. Source edits alone do not regenerate the deployed bundle.

The site requires no secrets or backend. View links, parameter changes and JSON/CSV exports run in the browser. GitHub Pages does not provide server-side shared editing or scheduled refresh; presentation changes remain browser-local.
