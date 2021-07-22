# package-localisation-seed

Seed localisation for Valyous repos

### Installation
```npm i --save TamuzGroup/package-localisation-seed```

### Parameters
* bucket (default: 'https://valyous-public.s3-eu-west-1.amazonaws.com/i18n/')
* platform (options: api / web / chat-embed)
* locale_dir (default: 'locales/')
fs directory to save localisation files.

### Usage

Add to package.json scripts (example below for api resource)

```"i18n:seed": "node node_modules/package-localisation-seed --platform=api --locale_dir=i18n/locales/"```
