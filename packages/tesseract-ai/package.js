Package.describe({
    name: 'tesseract:ai',
    summary: 'AI tool for OHIF viewer.',
    version: '1.0.0'
});

Npm.depends({
    'jquery.waituntilexists': '1.0.0'
});

Package.onUse(function(api) {
    api.versionsFrom('1.5');

    api.use('jquery');
    api.use('ecmascript');
    api.use('ohif:cornerstone');
    api.use('ohif:core');

    api.addFiles('client/index.js', 'client');
});
