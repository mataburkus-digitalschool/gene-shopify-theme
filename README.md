# GENE Streetwear — Shopify theme

Plně funkční Shopify motiv pro GENE Streetwear (add-to-cart, košík-drawer, produktové/košíkové stránky, výběr velikosti, bundly, free-shipping bar, countdown, FAQ).

Struktura motivu je v **kořeni repa** (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) — přesně jak vyžaduje Shopify GitHub integrace.

## Napojení na Shopify přes GitHub

1. Vytvoř na GitHubu nové repo (např. `gene-shopify-theme`) a nahraj do něj obsah téhle složky:
   ```bash
   git remote add origin https://github.com/<tvuj-ucet>/gene-shopify-theme.git
   git branch -M main
   git push -u origin main
   ```
2. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**.
3. Vyber repo a větev **`main`**.
4. Shopify motiv přidá do seznamu → **Publish**.

Od téď: `git push` na `main` = změna se propíše do motivu naživo. Úprava v Shopify theme editoru se naopak commitne zpátky do repa.

> **Tip:** Na propojené větvi (`main`) nedělej rozdělané pokusy — sync je automatický. Experimentuj na vlastní větvi a slučuj přes PR.

## Produkty

Motiv čte produkty ze Shopify. Naimportuj `../gene-products-shopify.csv` (Products → Import).
Homepage se po importu sama naplní reálnými produkty. Pro přesné rozdělení vytvoř automatické kolekce s handly `sale` (tag = Sale) a `new-arrivals` (tag = New Arrivals) — detail v `../NAVOD-shopify.md`.

## Lokální vývoj (volitelné)

Se [Shopify CLI](https://shopify.dev/docs/themes/tools/cli):
```bash
shopify theme dev      # živý náhled proti tvému obchodu
shopify theme push     # nahraje motiv
```
