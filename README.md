# Glass Wrap

A browser-only tool for creating print-accurate SVG cut templates for straight
and conical glasses.

## Use

Open `dist/index.html` in a modern browser, or serve the `dist` directory with
any static web server. Enter the outside top diameter, bottom diameter, and
height in millimeters. Equal diameters produce a straight rectangular wrap;
different diameters produce a developed conical wrap.

Enable the optional 10 mm glue tab when the wrap will be glued rather than
printed on sticker paper. The downloaded SVG includes real millimeter `width`
and `height` attributes for 100% printing.

## Check the calculator

```sh
npm test
```

The tests cover validation, straight and conical geometry, near-equal diameter
handling, the 10 mm tab, and SVG export dimensions.

## GitHub Pages

The site is deployed from `dist/` by the GitHub Actions workflow in
`.github/workflows/deploy-pages.yml`. In the repository’s **Settings → Pages**,
select **GitHub Actions** as the publishing source once. Future pushes to
`main` publish the current version automatically.
