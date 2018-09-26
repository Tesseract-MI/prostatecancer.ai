Package.describe({
    name: 'tesseract:cancer-study',
    summary: 'Report and setting template for tesseract.',
    version: '1.0.0'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('standard-app-packages');
    api.use('jquery');
    api.use('stylus');
    api.use('random');
    api.use('templating');
    api.use('natestrauser:select2@4.0.1', 'client');
    api.use('iron:router@1.0.13');
    api.use('momentjs:moment');
    api.use('validatejs');

    api.addFiles('client/index.js', 'client');
});
