// Node.js script to generate regular verb data using a local LLM (OpenAI API compatible)
// Usage: node genRegularVerbs.js output_file.js

const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. Define the verbs to generate data for
const verbs = [
  'falar'
];


const promptTemplate =  `
i am building an app for people to learn continental (european) portuguese language, can you please generate me for the 
9 subjects (eu, tu, ele, ela, voce, nos, eles, elas, voces) and the 3 tenses (present, simple past, imperfect past) for 
each a question where the user needs to pick only one sentence that is correct and other 4 are incorrect, the user does not know
if the question is about present or the past so add time markers like yesterday, last year to all examples to clarify that 
the question is about past or imperfect past. It should be 27 questions in total for each verb.
output with the following format in json:
'''
id: 12345,
subject: 'eu',
verb: 'ser',
tense: 'simple past',
correct: 'Você foi muito gentil naquele dia.',
wrong: [
'Você é muito gentil naquele dia.',
'Você era muito gentil naquele dia.',
'Você fui muito gentil naquele dia.',
'Você fomos muito gentil naquele dia.'
]
},
'''
id should be the hash of the rest of the object and not more than 4 bytes
generate it for the verb {$verb}
`

// 3. Get output file from command line
const outputFile = process.argv[2];
if (!outputFile) {
  console.error('Usage: node genRegularVerbs.js output_file.js');
  process.exit(1);
}

// 4. Helper to call the local LLM API
function callLLM(verb) {
  const prompt = promptTemplate.replace('{$verb}', verb);
  const body = JSON.stringify({
    model: 'local-model',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 32000,
    temperature: 0.7
  });
  const options = {
    hostname: 'localhost',
    port: 1234,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`LLM API error: ${res.statusCode} ${res.statusMessage}`));
        }
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          return reject(new Error('Failed to parse LLM response as JSON'));
        }
        // Try to extract the JSON block from the response
        const text = parsed.choices[0].message.content;
        const jsonBlocks = [...text.matchAll(/```json([\s\S]*?)```/g)].map(m => m[1].trim());
        let jsonText = jsonBlocks.length ? jsonBlocks.join(',\n') : text;
        jsonText = jsonText.replace(/\n?\s*},\s*\n/g, '\n},\n');
        let objects = [];
        try {
          if (!jsonText.trim().startsWith('[')) {
            jsonText = '[' + jsonText + ']';
          }
          objects = JSON.parse(jsonText);
        } catch (e) {
          const objMatches = [...jsonText.matchAll(/\{[\s\S]*?\}/g)];
          objects = objMatches.map(m => {
            try { return JSON.parse(m[0]); } catch { return null; }
          }).filter(Boolean);
          if (!objects.length) {
            console.error('Failed to parse LLM response for verb:', verb);
            console.error('Raw response:', text);
          }
        }
        objects.forEach(obj => { if (!obj.verb) obj.verb = verb; });
        resolve(objects);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  let allObjects = [];
  for (const verb of verbs) {
    console.log('Generating for:', verb);
    try {
      const objs = await callLLM(verb);
      allObjects = allObjects.concat(objs);
    } catch (e) {
      console.error('Error for verb', verb, e);
    }
  }
  // Write to output file in the same format as verbs_data.js
  const output = 'export const regularVerbs = [\n' +
    allObjects.map(obj => '  ' + JSON.stringify(obj, null, 2)).join(',\n') +
    '\n];\n';
  fs.writeFileSync(outputFile, output, 'utf8');
  console.log('Done. Wrote', allObjects.length, 'entries to', outputFile);
})(); 