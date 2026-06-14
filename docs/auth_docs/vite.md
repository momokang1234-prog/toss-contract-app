SSR Bundle
In some cases like webworker runtimes, you might want to bundle your SSR build into a single JavaScript file. You can enable this behavior by setting ssr.noExternal to true. This will do two things:

Treat all dependencies as noExternal
Throw an error if any Node.js built-ins are imported
SSR Resolve Conditions
By default package entry resolution will use the conditions set in resolve.conditions for the SSR build. You can use ssr.resolve.conditions and ssr.resolve.externalConditions to customize this behavior.

Vite CLI
The CLI commands $ vite dev and $ vite preview can also be used for SSR apps. You can add your SSR middlewares to the development server with configureServer and to the preview server with configurePreviewServer.

Note

Use a post hook so that your SSR middleware runs after Vite's middlewares.


Backend Integration
Note

If you want to serve the HTML using a traditional backend (e.g. Rails, Laravel) but use Vite for serving assets, check for existing integrations listed in Awesome Vite.

If you need a custom integration, you can follow the steps in this guide to configure it manually.

In your Vite config, configure the entry and enable build manifest:

vite.config.js

export default defineConfig({
  server: {
    cors: {
      // the origin you will be accessing via browser
      origin: 'http://my-backend.example.com',
    },
  },
  build: {
    // generate .vite/manifest.json in outDir
    manifest: true,
    rolldownOptions: {
      // overwrite default .html entry
      input: '/path/to/main.js',
    },
  },
})
If you haven't disabled the module preload polyfill, you also need to import the polyfill in your entry


// add the beginning of your app entry
import 'vite/modulepreload-polyfill'
For development, inject the following in your server's HTML template (substitute http://localhost:5173 with the local URL Vite is running at):


<!-- if development -->
<script type="module" src="http://localhost:5173/@vite/client"></script>
<script type="module" src="http://localhost:5173/main.js"></script>
In order to properly serve assets, you have two options:

Make sure the server is configured to proxy static assets requests to the Vite server
Set server.origin so that generated asset URLs will be resolved using the back-end server URL instead of a relative path
This is needed for assets such as images to load properly.

Note if you are using React with @vitejs/plugin-react, you'll also need to add this before the above scripts, since the plugin is not able to modify the HTML you are serving (substitute http://localhost:5173 with the local URL Vite is running at):


<script type="module">
  import RefreshRuntime from 'http://localhost:5173/@react-refresh'
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true
</script>
For production, after running vite build, a .vite/manifest.json file will be generated alongside other asset files. An example manifest file looks like this:

.vite/manifest.json

{
  "_shared-B7PI925R.js": {
    "file": "assets/shared-B7PI925R.js",
    "name": "shared",
    "css": ["assets/shared-ChJ_j-JJ.css"]
  },
  "_shared-ChJ_j-JJ.css": {
    "file": "assets/shared-ChJ_j-JJ.css",
    "src": "_shared-ChJ_j-JJ.css"
  },
  "logo.svg": {
    "file": "assets/logo-BuPIv-2h.svg",
    "src": "logo.svg"
  },
  "baz.js": {
    "file": "assets/baz-B2H3sXNv.js",
    "name": "baz",
    "src": "baz.js",
    "isDynamicEntry": true
  },
  "views/bar.js": {
    "file": "assets/bar-gkvgaI9m.js",
    "name": "bar",
    "src": "views/bar.js",
    "isEntry": true,
    "imports": ["_shared-B7PI925R.js"],
    "dynamicImports": ["baz.js"]
  },
  "views/foo.js": {
    "file": "assets/foo-BRBmoGS9.js",
    "name": "foo",
    "src": "views/foo.js",
    "isEntry": true,
    "imports": ["_shared-B7PI925R.js"],
    "css": ["assets/foo-5UjPuW-k.css"]
  }
}
The manifest maps source files to their build outputs and dependencies:

views/foo.js
(entry)
_shared-B7PI925R.js
(common chunk)
imports
foo.css
css
views/bar.js
(entry)
imports
baz.js
(dynamic import)
dynamicImports
shared.css
css
logo.svg
(asset)
The manifest has a Record<name, chunk> structure where each chunk follows the ManifestChunk interface:


interface ManifestChunk {
  /**
   * The input file name of this chunk / asset if known
   */
  src?: string
  /**
   * The output file name of this chunk / asset
   */
  file: string
  /**
   * The list of CSS files imported by this chunk
   */
  css?: string[]
  /**
   * The list of asset files imported by this chunk, excluding CSS files
   */
  assets?: string[]
  /**
   * Whether this chunk or asset is an entry point
   */
  isEntry?: boolean
  /**
   * The name of this chunk / asset if known
   */
  name?: string
  /**
   * Whether this chunk is a dynamic entry point
   *
   * This field is only present in JS chunks.
   */
  isDynamicEntry?: boolean
  /**
   * The list of statically imported chunks by this chunk
   *
   * The values are the keys of the manifest. This field is only present in JS chunks.
   */
  imports?: string[]
  /**
   * The list of dynamically imported chunks by this chunk
   *
   * The values are the keys of the manifest. This field is only present in JS chunks.
   */
  dynamicImports?: string[]
}
Each entry in the manifest represents one of the following:

Entry chunks: Generated from files specified in build.rolldownOptions.input. These chunks have isEntry: true and their key is the relative src path from project root.
Dynamic entry chunks: Generated from dynamic imports. These chunks have isDynamicEntry: true and their key is the relative src path from project root.
Non-entry chunks: Their key is the base name of the generated file prefixed with _.
Asset chunks: Generated from imported assets like images, fonts. Their key is the relative src path from project root.
CSS files: When build.cssCodeSplit is false, a single CSS file is generated with the key style.css. When build.cssCodeSplit is not false, the key is generated similar to JS chunks (i.e. entry chunks will not have _ prefix and non-entry chunks will have _ prefix).
JS chunks (chunks other than assets or CSS) will contain information on their static and dynamic imports (both are keys that map to the corresponding chunk in the manifest). Chunks also list their corresponding CSS and asset files if they have any.

You can use this file to render links or preload directives with hashed filenames.

Here is an example HTML template to render the proper links. The syntax here is for explanation only, substitute with your server templating language. The importedChunks function is for illustration and isn't provided by Vite.


<!-- if production -->

<!-- for cssFile of manifest[name].css -->
<link rel="stylesheet" href="/{{ cssFile }}" />

<!-- for chunk of importedChunks(manifest, name) -->
<!-- for cssFile of chunk.css -->
<link rel="stylesheet" href="/{{ cssFile }}" />

<script type="module" src="/{{ manifest[name].file }}"></script>

<!-- for chunk of importedChunks(manifest, name) -->
<link rel="modulepreload" href="/{{ chunk.file }}" />
Specifically, a backend generating HTML should include the following tags given a manifest file and an entry point. Note that following this order is recommended for optimal performance:

A <link rel="stylesheet"> tag for each file in the entry point chunk's css list (if it exists)
Recursively follow all chunks in the entry point's imports list and include a <link rel="stylesheet"> tag for each CSS file of each imported chunk's css list (if it exists).
A tag for the file key of the entry point chunk. This can be <script type="module"> for JavaScript, <link rel="stylesheet"> for CSS.
Optionally, <link rel="modulepreload"> tag for the file of each imported JavaScript chunk, again recursively following the imports starting from the entry point chunk.
Following the above example manifest, for the entry point views/foo.js the following tags should be included in production:


<link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
<link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
<script type="module" src="assets/foo-BRBmoGS9.js"></script>
<!-- optional -->
<link rel="modulepreload" href="assets/shared-B7PI925R.js" />
While the following should be included for the entry point views/bar.js:


<link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
<script type="module" src="assets/bar-gkvgaI9m.js"></script>
<!-- optional -->
<link rel="modulepreload" href="assets/shared-B7PI925R.js" />


---

# to agent

https://vite.dev/guide/