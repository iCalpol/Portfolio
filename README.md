# Built with purpose

An interactive portfolio of personal Power Platform projects. Explore the interfaces, make decisions and follow each workflow through its next steps.

## Projects

- **Parcel Operations:** search and filter fictional parcels, record collections, attach notes and resolve issues.
- **Shirt Studio:** shape a design, approve or revise it and prepare a sample product draft.
- **Artwork Workflow:** approve a brief, create an illustrative preview, check print requirements and prepare sample output.

The project pages distinguish the real application's current development status from this browser demonstration. All records are fictional. The website does not connect to live Dataverse, Shopify, Gelato or Power Automate services.

## Open or publish

Extract the complete download and open `index.html` in a current desktop browser, or publish the folder through GitHub Pages. The included `.js` files are self-contained classic scripts. They do not depend on browser module imports or a build step at hosting time.

See [DEPLOYMENT.md](DEPLOYMENT.md) for upload instructions.

## Develop

The `.mjs` files contain the source modules. After editing them, regenerate the browser scripts:

```sh
node scripts/build-browser.mjs
```

Run the checks with a current Node.js installation:

```sh
node scripts/check-model.mjs
node scripts/check-project-workflows.mjs
node scripts/check-startup.mjs
```

The checks cover workflow rules and startup against the shipped HTML using a lightweight DOM fixture. They do not replace visual testing in a browser.

## Public content

This is a project-only portfolio. It contains no CV, CV PDF or CV preview images. Personal contact details are withheld. Keep live records, credentials and private project exports outside the repository.

The pages request that search engines do not index them. That request does not make a public website private.

Font licences are retained in `assets/fonts/LICENSE.txt`.
