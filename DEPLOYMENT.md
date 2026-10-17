# Publish or update the portfolio

## Replacing the first download

1. Extract this ZIP before uploading. Open the extracted folder until `index.html`, the JavaScript files and `assets` are visible together.
2. In your repository, choose **Add file > Upload files** and upload all these contents into the repository root.
3. Commit the changes. The new homepage uses `app.js`; Shirt Studio uses `studio-app.js`; Artwork Workflow uses `artwork-app.js`. Include all three scripts.
4. Uploading a replacement does not delete old files. Remove these from the repository if present:
   - `assets/Portfolio-CV-Redacted.pdf`
   - `assets/cv-page-1.png`
   - `assets/cv-page-2.png`
5. Deleted files can remain accessible in Git history. To avoid retaining the CV in public history, use a fresh public repository for this package and make the original repository private. If the original repository has Pages enabled, unpublish its old website too. Do not put the CV files into the new repository.

## New repository

1. Open https://github.com/new while signed in to your own account.
2. Choose an unused name such as `interactive-portfolio` and choose **Public** for free GitHub Pages hosting.
3. Leave the README, .gitignore and licence options unselected; this package already includes a README.
4. Create the repository, click **uploading an existing file**, and upload the extracted files and folders.
5. `index.html` must be visible at the repository root, alongside `assets`.

## Enable the website

1. Open **Settings > Pages** in the repository.
2. Set **Source** to **Deploy from a branch**.
3. Select the branch containing the files, normally **main**, and select **/(root)**.
4. Click **Save** and wait for the deployment to finish.
5. Use the **Visit site** link shown on the Pages screen. A repository code page on github.com is different from the published website on github.io.

## Check the result

- Collect a sample parcel and confirm the total changes.
- Build and approve a shirt, then create a sample draft.
- Approve an artwork brief, create the artwork and run the print checks.
- Check the site on your phone.
- Confirm there are no CV controls or files in the new repository.

If a panel does not load, send the exact address from the browser's address bar. State whether it begins with `file:`, `github.com` or `github.io`. A short text message is enough.

## What was checked before packaging

The workflow checks and the actual page startup scripts passed. Local asset paths and removal of CV assets were also checked. The live GitHub deployment still needs to be checked after upload.

## Official instructions

- Upload files: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Configure Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Delete files: https://docs.github.com/en/repositories/working-with-files/managing-files/deleting-files-in-a-repository
