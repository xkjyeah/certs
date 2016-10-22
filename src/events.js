import EventEmitter from "events";
import _ from 'lodash';

var events = new EventEmitter();

export default events;

events.on('requestReload', () => {
  firebase.database().ref('certificates').once('value')
  .then(x => {
    let certificates = x.val()

    _.forEach(certificates, (cert, key) => {
      cert.id = key
      cert.endDate = moment(cert.endDate)
      cert.startDate = moment(cert.startDate)
    });

    let certList = _.values(certificates);

    events.emit('certificatesLoaded', certList);
  });
})

// Process the lists of employees,
// lists of certificates etc.
events.on('certificatesLoaded', (certs) => {
  let lists = {
    employees: _(certs)
      .map('employee')
      .uniq()
      .sort()
      .value(),
    certificates: _(certs)
      .map('certificate')
      .uniq()
      .sort()
      .value(),
  }

  events.emit('listsUpdated', lists)
})
