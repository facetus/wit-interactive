const _ = require('lodash');

const actions = [
  {
    intent: 'how_to_connect',
    needs: [
      { name: 'router', text: "Ποιο ρούτερ έχεις;"},
      { name: 'service', text: "Ποια υπηρεσία χρησιμοποιείς;"}
    ]
  },
  {
    intent: 'what_is',
    needs: [
      { name: 'service', text: "Για ποια υπηρεσία θες να μάθεις περισσότερα;"}
    ]
  },
  {
    intent: 'what_number_is',
    needs: [
      { name: 'wit/phone_number', text: "Από ποιον αριθμό βλέπετε αυτές τις χρεώσεις;"}
    ]
  }
];

function nextAction({ intent, entities, context }) {
  const action = _.find(actions, ['intent', intent]);
  if (action) {
    context = _.merge(context, entities);
    for (let n of action.needs) {
      if (!context[n.name])
        return n;
    }
  } else return false;
}

module.exports = {
  nextAction
};
