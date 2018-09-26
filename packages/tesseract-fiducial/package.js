Package.describe({
    name: 'tesseract:fiducial',
    summary: 'Fiducial tool.',
    version: '1.0.0'
});

Package.onUse(function(api) {
    api.versionsFrom('1.5');

    api.use('ecmascript');
    api.use('ohif:cornerstone');
    api.use('ohif:core');

    api.addFiles('client/index.js', 'client');
});
