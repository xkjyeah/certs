import * as React from 'react';
import EventEmitter from "events";
import * as firebaseDatabase from 'firebase/database';
import {ref, child, get} from 'firebase/database';
import moment from 'moment';
import _ from 'lodash';

const events = new EventEmitter();
export default events;

let certList = []

export const requestReload = () => events.emit('requestReload')

export class SingletonListsProvider extends React.Component {
  constructor() {
    super()
    this.db = firebaseDatabase.getDatabase()
  }

  componentDidMount() {
    events.on('requestReload', this.reload)
  }

  reload = () => {
    get(ref(this.db, 'certificates'))
    .then(x => {
      const certificates = x.val()
      const validated = _.map(certificates, (cert, key) => {
        let {startDate, endDate, employee, certificate,
            files, issuer, createdAt, updatedAt,
            createdBy, updatedBy} = cert;

        return {
          id: key,
          endDate: tryParseDate(endDate),
          startDate: tryParseDate(startDate),
          createdAt: tryParseDate(createdAt),
          updatedAt: tryParseDate(updatedAt),
          createdBy: tryParseString(createdBy),
          updatedBy: tryParseString(updatedBy),
          employee: tryParseString(employee),
          issuer: tryParseString(issuer),
          certificate: tryParseString(certificate),
          files: tryParseFiles(files),
        }
      });

      certList = _.values(validated);
      events.emit('certificatesLoaded', certList)
    });
  }

  render() {
    return this.props.children
  }
}

export class SingletonListsConsumer extends React.Component {
  constructor() {
    super()
    this.state = this.stateFromCertList(certList)
  }

  stateFromCertList = (certList) => {
    return {
      employees: _(certList)
        .map('employee')
        .uniq()
        .sort()
        .value(),
      certificates: _(certList)
        .map('certificate')
        .uniq()
        .sort()
        .value(),
      issuer: _(certList)
        .map('issuer')
        .uniq()
        .sort()
        .value(),
      certificateList: certList,
    }
  }

  eventListener = (certList) => {
    this.setState(this.stateFromCertList(certList))
  }

  componentDidMount() {
    events.on('certificatesLoaded', this.eventListener)
  }

  componentWillUnmount() {
    events.off('certificatesLoaded', this.eventListener)
  }

  render() {
    return this.props.children({data: this.state[this.props.source], requestReload})
  }
}

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
