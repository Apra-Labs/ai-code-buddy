#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');

try {
    const fileContents = fs.readFileSync('bitbucket-pipelines.yml', 'utf8');
    const data = yaml.load(fileContents);

    console.log('✅ YAML is valid!');
    console.log('\nScript items in build-extension step:');

    const scriptItems = data.definitions.steps[0].step.script;
    scriptItems.forEach((item, index) => {
        if (typeof item === 'string') {
            const preview = item.length > 60 ? item.substring(0, 60) + '...' : item;
            console.log(`  ${index}: ${preview}`);
        } else {
            console.log(`  ${index}: [multi-line block]`);
        }
    });

} catch (e) {
    console.error('❌ YAML Error:', e.message);
    process.exit(1);
}
