import EventEmitter from "events";
import firebase from 'firebase';
import moment from 'moment';
import _ from 'lodash';

var events = new EventEmitter();

export default events;

events.on('requestReload', () => {
  firebase.database().ref('certificates').once('value')
  .then(x => {
    let certificates = x.val()

    function tryParseDate(dt) {
      var m = null;
      if (typeof dt == 'string') {
        m = moment(dt)
        if (!m.isValid())
          m = null;
      }
      return m;
    }
    function tryParseString(s) {
      if (typeof s === 'string') {
        return s;
      } else {
        return JSON.stringify(s);
      }
    }
    function tryParseFiles(fs) {
      if (typeof fs !== 'object') {
        return [];
      } else {
        return _(fs)
          .toPairs()
          .filter(([key, value]) => {
            return value &&
              typeof value.storageRef == 'string' &&
              typeof value.createdAt == 'number'
          })
          .map(([key, value]) => {
            return {
              storageRef: value.storageRef,
              createdAt: value.createdAt,
              key
            }
          })
          .value()
      }
    }

    _.forEach(certificates, (cert, key) => {
      cert.id = key
      cert.endDate = tryParseDate(cert.endDate);
      cert.startDate = tryParseDate(cert.startDate);
      cert.employee = tryParseString(cert.employee);
      cert.certificate = tryParseString(cert.certificate);
      cert.files = tryParseFiles(cert.files);
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
