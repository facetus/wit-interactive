const { Wit, log, interactive } = require('node-wit');
const { prompt } = require('inquirer');
const fetch = require('node-fetch');

const { nextAction } = require('./intent');

const _ = require('lodash');

const accessToken = 'TY2XCMBJOCHWC3JQPHD7M4YRUTC5FSJN';

const client = new Wit({
  accessToken
});

const headers = {
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

const message = [
  {
    type : 'input',
    name : 'message',
    message : 'Enter Message: '
  }
];

const correction = [
  {
    type : 'confirm',
    name : 'confirm',
    message : 'Is that correct?'
  }
];

const newIntent = [
  {
    type : 'confirm',
    name : 'confirm',
    message : 'Do you want to train a new intent?'
  }
];

const addIntent = [
  {
    type : 'input',
    name : 'intent',
    message : 'Enter Intent Name: '
  }
];

let context = {};

query();

function extractEntities(entities) {
  return _.mapValues(entities, e => e[0].value);
}

function query () {
  let question = message;
  if (context.next)
    question = [
      {
        type: 'input',
        name: 'message',
        message: context.next.text
      }
    ];
  return prompt(question).then(answers =>
    client.message(answers.message, {}, false, true).then(data => {
      const entities = data.entities;

      let next = false;
      if (entities.intent) {
        console.log(`Recognized intent: "${entities.intent[0].value}" Confidence: ${entities.intent[0].confidence}`);
        next = nextAction({intent: entities.intent[0].value, context, entities: extractEntities(entities)});
      } else
        console.log(`No intent recognized :(`);

      let other = Object.keys(entities);
      other = other.filter(e => !(e === 'intent'));
      if (other.length > 0) {
        console.log(`Found other entities: `);
        for (let e of other) {
          console.log(`\t${e}:`);
          for (let v of entities[e])
            console.log(`\t\t"${v.value}" Confidence: ${v.confidence}`);
        }
      } else
        console.log("No other entities found");
      if (next) {
        console.log(`Next Action: ask_${next.name}`);
        context.next = next;
      } else
        context = {};
      return isCorrect(answers.message, entities);
    })
    .catch(console.error)
  );
}

function isCorrect(text, entities) {
  return prompt(correction).then(a => {
    if (a.confirm) {
      entities = _.map(entities, (e, k) => {
        const selected = e[0];

        const entity = {
          entity: k,
          value: selected.value
        };

        if (selected._start) {
          _.set(entity, 'start', selected._start);
          _.set(entity, 'end', selected._end);
        }
        return entity;
      });
      return witTrainRequest({text, entities});
    }
    console.log("OK... :(");

    return prompt(newIntent).then(a => {
      if (a.confirm) {
        return prompt(addIntent).then(a => {
          entities = [
            {
              entity: 'intent',
              value: a.intent
            }
          ];
          return witTrainRequest({text, entities});
        });
      }
      query();
    });
  });
}

function witTrainRequest ({ text, entities }) {
  const body = JSON.stringify([{ text, entities }]);
  return fetch("https://api.wit.ai/samples?v=20170307", {
    method: 'POST',
    headers,
    body
  })
  .then(rsp => rsp.json()).then(json => {
    if (json.sent) {
      console.log("The app is now training the new record...");
      query();
    }
    if (json.error) {
      console.log("Wit training failed...");
      console.log(json.error);
    }
  })
  .catch(err => console.log(`Something bad happened... ${err}`));
}
