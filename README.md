# prostatecancer.ai [![MIT License][license-image]][license-url]
__prostatecancer.ai__ is an [OHIF-based](http://ohif.org/), zero-footprint [DICOMweb](https://www.dicomstandard.org/dicomweb/) medical image viewer that utilizes artificial intelligence technologies to identify clinically significant prostate cancer.


[Read The Docs](https://github.com/Tesseract-MI/prostatecancer.ai/wiki) |
[Demo](http://prostatecancer.ai/) |
[Roadmap](https://github.com/Tesseract-MI/prostatecancer.ai/projects)

## Introduction

Advances in machine learning and deep learning have made it possible to embed the knowledge
of experienced physician/radiologist into computational models and have shown state-of-the art
performance in various image analysis tasks including computer-assisted detection, diagnosis,
and prognosis of several forms of cancers including prostate cancer. However, models are not
fully integrated with the current standard of care in clinic. We have developed
[prostatecancer.ai](http://prostatecancer.ai/) which enables deployment of AI models in a web-browser while
simultaneously providing standard image viewing and reporting schemes.

If you're interested in using prostatecancer.ai, but you're not sure it supports
your use case [check out our docs](https://github.com/Tesseract-MI/prostatecancer.ai/wiki). Still not sure, or
you would like to propose new features? Don't hesitate to
[create an issue](https://github.com/Tesseract-MI/prostatecancer.ai/issues) or open a pull
request.

## ⏩ Getting Started

This readme is specific to testing and developing locally. If you're more
interested in production deployment strategies,
[you can check out our documentation on publishing](https://github.com/Tesseract-MI/prostatecancer.ai/wiki).

Want to play around before you dig in?
[Check out our LIVE Demo](http://prostatecancer.ai/)

### 📏 Setup

_Requirements:_

- DICOM server ([orthanc](https://www.orthanc-server.com/) or [dcm4che](https://www.dcm4che.org/))
- [Meteor](https://www.meteor.com/)

_Steps:_

1. Fork this repository
2. Clone your forked repository (your `origin`)

- `git clone git@github.com:YOUR_GITHUB_USERNAME/prostatecancer.ai.git`

3. Add `Tesseract-MI/prostatecancer.ai` as a `remote` repository (the `upstream`)

- `git remote add upstream git@github.com:Tesseract-MI/prostatecancer.ai.git`

### 💻 Developing Locally

_In your cloned repository's root folder, run:_

1. Restore dependencies:
    * `meteor npm install`

2. Set up local server to host prostatecancer.ai:
    * for orthanc run: `METEOR_PACKAGE_DIRS="packages" meteor --settings config/orthancDICOMWeb.json`
    * for dcm4chee run: `METEOR_PACKAGE_DIRS="packages" meteor --settings config/dcm4cheeDICOMWeb.json`


### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**](https://github.com/Tesseract-MI/prostatecancer.ai/issues)

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**](https://github.com/Tesseract-MI/prostatecancer.ai/issues)

### ❓ Questions

For questions related to using the app, please visit our support community,
or file an issue on GitHub.

[**See Questions**](https://github.com/Tesseract-MI/prostatecancer.ai/issues)

## 🔜 Roadmap

If you want to know what's planned for the very near future,
[check out our roadmap](https://github.com/Tesseract-MI/prostatecancer.ai/projects). The best way to influence when
and what is worked on is to contribute to the conversation by creating GitHub
issues, and contributing code through pull requests. Our high level
priorities for the near future are:

- [Segmentation tools](https://github.com/Tesseract-MI/prostatecancer.ai/projects/1) 🚧🕞
- [Zero-footprint upload feature](https://github.com/Tesseract-MI/prostatecancer.ai/projects/2) 🚧🕞
- [Migrate to React](https://github.com/Tesseract-MI/prostatecancer.ai/projects/3) 🚧🕞

More granular information will make its way to the backlog as these items
become scoped for development by core maintainers.

> Don't hesitate to ask questions, propose features, or create pull requests.
> We're here, we're listening, and we're always ready to make prostatecancer.ai the best AI-based medical image viewer in the world 🌎

## 🔒 License

MIT © [prostatecancer.ai](https://github.com/Tesseract-MI/prostatecancer.ai)

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE
