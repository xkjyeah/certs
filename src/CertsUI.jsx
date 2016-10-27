import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CertsDashboard} from './CertsDashboard.jsx';
import {CertsForm} from './CertsForm.jsx';
import MySelect from './MySelect.jsx';
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
        employee: ''
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
        .value(),
      recent: _(certList)
        .filter(c => c.startDate && isFinite(c.startDate.valueOf()))
        .sortBy(c => c.startDate && -c.startDate.valueOf())
        .value(),
    }
  }

  _filter(certList) {
    return certList.filter(c =>
      (!this.state.filter.employee ||
        c.employee.toUpperCase().indexOf(this.state.filter.employee.toUpperCase()) >= 0) &&
      (!this.state.filter.certificate ||
        c.certificate.toUpperCase().indexOf(this.state.filter.certificate.toUpperCase()) >= 0)
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
            className="btn btn-default glyphicon glyphicon-log-out">
          </button>;
        </div>
      )
         :
      <button onClick={this.login}
        className="btn btn-default glyphicon glyphicon-log-in"
        ></button>;

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
          <button type="button" onClick={this.newCertificate}
            className="btn btn-primary glyphicon glyphicon-plus"
            ></button>
        </div>

        <CertsDashboard data={dashboardData}></CertsDashboard>
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
