const generateRegularVerbPrompt = `
i am building an app for people to learn continental (european) portuguese language, can you please generate me for the 9 subjects (eu, tu, ele, ela, voce, nos, eles, elas, voces) and the 3 tenses (present, simple past, imperfect past) a set of 27 sentences so that only one of them is correct and 4 of them are incorrect. To avoid confusion where multiple sentences are correct but in different tenses make sure you add time markers to all examples in simple or imperfect past, output the format within the following format in json:
'''
id: ser-1,
verb: 'ser',
subject: 'eu', // eu, tu, ele, ela, voce, nos, eles, elas, voces
tense: 'simple past', // present, simple past, imperfect past 
correct: 'Você foi muito gentil naquele dia.',
wrong: [
'Você é muito gentil naquele dia.',
'Você era muito gentil naquele dia.',
'Você fui muito gentil naquele dia.',
'Você fomos muito gentil naquele dia.'
]
},
'''
id should be the hash of the rest of the object 
generate it forthe verb {$verb}
`