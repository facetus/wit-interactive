# Wit-Interactive #

An interactive command line Wit.AI interface/trainer

## How to Setup ##
* Set your Wit.AI access token on the `app.js` file
* Run `npm install`
* Run `npm start`

## How to change the flow ##
The `intent` entity is needed for intent classification. So your Wit app needs to have it set up.

The different questions asked are implemented inside the `./intent.js` file. You can change the various intents handled, the fields needed to perform the query and how to ask for them there by editing the `actions` array.

Context is handled globally inside the `./app.js` file.

All the various intents *need* to have this structure:
```
{
  intent: '<intent_name>',
  needs: [
    { name: '<entity_name1>', text: '<question1>'},
    { name: '<entity_name2>', text: '<question2>'}
  ]
}
```
## One word about context: ##
The `context` object is used for storing the current state of the conversation.
The context is flushed after all the questions regarding a specific intent are asked.

It follows this format:
```
{
  next: { name: '<entity_name>', text: '<question>'},

  <entity_name1>: 'entity_value1',
  <entity_name2>: 'entity_value2',
  ...
  ...
  ...
}
```
The parameter: `next` stores the next question that is selected to be asked by the bot.

## Todo/Known Bugs ##
- You can only add an intent, not a new entity when training.
- There is a weird bug with `wit/phone-number` training.
