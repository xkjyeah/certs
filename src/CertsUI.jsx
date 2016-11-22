import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CertsDashboard} from './CertsDashboard.jsx';
import {CertsForm} from './CertsForm.jsx';
import {CertsTable} from './CertsTable.jsx';
import MySelect from './MySelect.jsx';
import DatePicker from 'react-datepicker';
import * as firebase from 'firebase';
import _ from 'lodash';
import moment from 'moment';
import events from './events';

moment.locale('en-GB')

export class CertsUI extends React.Component {
  login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider)
  }
  logout() {
    firebase.auth().signOut();
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      dashboardData: {
        recentlyExpired: [],
        expiringSoon: [],
        recent: []
      },
      filter: {
        employee: '',
        expired: true,
        valid: true,
        referenceDate: moment()
      },
      auth: {user: null},
      certificates: []
    }

    this.mountedPromise = new Promise((resolve) => {
      this._mountedPromiseResolver = resolve;
    })

    firebase.auth().onAuthStateChanged((user) => {
      this.mountedPromise.then(() => {
        this.setState({auth: {user}})
        this.reload();
      })
    });
  }

  reload() {
    events.emit('requestReload')
  }

  newCertificate() {
    events.emit('requestEdit', {
      employee: this.state.filter.employee,
      startDate: null,
      endDate: null,
      files: []
    })
  }

  componentDidMount() {
    this._mountedPromiseResolver();

    this.onCertificatesLoaded = (certList) => {
      this.setState({
       certificates: certList,
      })
    };

    events.on('certificatesLoaded', this.onCertificatesLoaded);
  }

  componentWillUnmount() {
    events.removeListener('certificatesLoaded', this.onCertificatesLoaded);
  }

  updateFilter(field, value) {
    this.setState({
      filter: _.defaults(_.fromPairs([
        [field, value]
      ]), this.state.filter)
    })
  }

  _dashboardData(certList) {
    let now = Date.now();
    return {
      recentlyExpired: _(certList)
      /* show even those with invalid date entries */
        .filter(c => !c.endDate || c.endDate.valueOf() < now)
        .sortBy(c => !c.endDate || -c.endDate.valueOf())
        .value(),
      expiringSoon: _(certList)
        .filter(c => c.endDate && c.endDate.valueOf() >= now)
        .sortBy(c => c.endDate && c.endDate.valueOf())
        .value().concat(
          _(certList)
          .filter(c => !c.endDate)
          .value()
        ),
      recent: _(certList)
        .filter(c => c.startDate && isFinite(c.startDate.valueOf()))
        .sortBy(c => c.startDate && -c.startDate.valueOf())
        .value(),
    }
  }

  _filter(certList) {
    let now = this.state.filter.referenceDate || moment();
    return certList.filter(c =>
      (!this.state.filter.employee ||
        c.employee.toUpperCase().indexOf(this.state.filter.employee.toUpperCase()) >= 0) &&
      (!this.state.filter.certificate ||
        c.certificate.toUpperCase().indexOf(this.state.filter.certificate.toUpperCase()) >= 0) &&
      (
        (this.state.filter.expired &&
          c.endDate && c.endDate.valueOf() < now
        ) ||
        (this.state.filter.valid &&
          (!c.endDate || c.endDate.valueOf() >= now)
        )
      )
    )
  }

  render() {
    let filteredCerts = this._filter(this.state.certificates);
    let dashboardData = this._dashboardData(filteredCerts);
    let loginArea = this.state.auth.user ?
      (
        <div>
          Logged in as
          {' '}
          {this.state.auth.user.displayName}
          {' '}
          {this.state.auth.user.email}
          {' '}

          <button onClick={this.logout}
            className="btn btn-default">

            <i className="glyphicon glyphicon-log-out"></i>
            &nbsp;Log out...
          </button>;
        </div>
      )
         :
      (<div>
        <button onClick={this.login}
          className="btn btn-default">
          <i className="glyphicon glyphicon-log-in"></i>
          &nbsp;Log in...
        </button>
      </div>);

    return (
      <main>
        {loginArea}

        <div className="filter-area">
          <label>
            <input
                className="form-control"
                value={this.state.filter.employee}
                onChange={debounced((e) => this.updateFilter('employee', e.target.value))}
                placeholder="Search by Employee name..."
                type="text"
                />
          </label>
          <label className="certificates-filter">
            <input
              className="form-control"
                value={this.state.filter.certificate}
                onChange={debounced((e) => this.updateFilter('certificate', e.target.value))}
                placeholder="Search by Certificate..."
                type="text"
                />
          </label>
          <label className="certificates-filter">
            <input
                checked={this.state.filter.valid}
                onChange={(e) => this.updateFilter('valid', e.target.checked)}
                type="checkbox"
                />
              Valid on
          </label>
          <label className="certificates-filter">
            <input
                checked={this.state.filter.expired}
                onChange={(e) => this.updateFilter('expired', e.target.checked)}
                type="checkbox"
                />
              Expired on
          </label>

          <label className="form-inline">
            Reference date:
            <DatePicker
              selected={this.state.filter.referenceDate}
              onChange={e => this.updateFilter('referenceDate', e)}
              />
          </label>

          <button type="button" onClick={this.newCertificate.bind(this)}
            className="btn btn-primary"
            >
            <i className=" glyphicon glyphicon-plus"></i>
            Add certificate
          </button>
        </div>
        <CertsTable certs={filteredCerts}></CertsTable>
        {/*<CertsDashboard data={dashboardData}></CertsDashboard> */}
        <CertsForm onSave={this.reload.bind(this)}></CertsForm>
      </main>
    )
  }
}

function debounced(fn, ms = 200) {
  var next = null;

  function endOfDebounce() {
    if (next && typeof next == 'function') {
      var n = next;
      next = null;
      n();

      setTimeout(endOfDebounce, ms)
    }
    else {
      next = null;
    }
  }

  return (e) => {
    if (next != null) {
      // still debouncing
      next = () => fn(e)
    }
    else {
      // debounced
      next = 1;
      setTimeout(endOfDebounce, ms)
      fn(e)
    }
  }
}
