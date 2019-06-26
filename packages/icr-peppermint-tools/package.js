Package.describe({
  name: "icr:peppermint-tools",
  summary: "cornerstoneTools plugin for 3D tools.",
  version: "0.1.0"
});

Package.onUse(function(api) {
  api.versionsFrom("1.4");

  api.use(["ecmascript", "standard-app-packages", "http", "jquery", "stylus"]);

  // OHIF dependencies
  api.use(["ohif:design", "ohif:cornerstone", "ohif:core"]);

  // ===== Assets =====
  api.addAssets("assets/icons.svg", "client");

  // keyInterface
  api.addFiles("client/lib/keyInterface/brushToolKeyInterface.js", "client");
  api.addFiles("client/lib/keyInterface/freehandToolKeyInterface.js", "client");

  // Components

  api.addFiles("client/components/viewer/peppermint-table.styl", "client");

  api.addFiles(
    "client/components/viewer/freehandSetNameDialogs/freehandSetNameDialogs.html",
    "client"
  );
  api.addFiles(
    "client/components/viewer/freehandSetNameDialogs/freehandSetNameDialogs.js",
    "client"
  );
  api.addFiles(
    "client/components/viewer/freehandSetNameDialogs/freehandSetNameDialogs.styl",
    "client"
  );

  api.addFiles(
    "client/components/viewer/brushMetadataDialogs/brushMetadataDialogs.html",
    "client"
  );

  api.addFiles(
    "client/components/viewer/brushMetadataDialogs/brushMetadataDialogs.js",
    "client"
  );
  api.addFiles(
    "client/components/viewer/brushMetadataDialogs/brushMetadataDialogs.styl",
    "client"
  );

  api.mainModule("main.js", "client");
});
