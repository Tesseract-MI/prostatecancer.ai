Package.describe({
    name: 'tesseract:sync-scroll',
    summary: 'Tesseract sync scroll functionality',
    version: '1.0.0'
});

Package.onUse(function(api) {
    api.versionsFrom('1.4');

    api.use('ecmascript');
    api.use('jquery');
    api.use('ohif:cornerstone');
    api.use('ohif:core');

    api.addFiles('client/index.js', 'client');
});
