import * as React from 'react';
import {CertsForm} from './CertsForm.jsx';
import {CertsTable} from './CertsTable.jsx';
import {CertsPivot} from './CertsPivot.jsx';
import DatePicker from 'react-datepicker';
import * as firebaseAuth from 'firebase/auth';
import _ from 'lodash';
import moment from 'moment';
import { SingletonListsConsumer, SingletonListsProvider } from './events';

moment.locale('en-GB')

class CertsUIImpl extends React.Component {
  login = () => {
    const provider = new firebaseAuth.GoogleAuthProvider();
    firebaseAuth.signInWithRedirect(this.auth, provider)
  }
  logout = () => {
    this.auth.signOut();
  }

  constructor() {
    super();

    this.auth = firebaseAuth.getAuth()

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
      certificates: [],
      display: 'list',

      currentEditingTarget: null,
    }

    this.mountedPromise = new Promise((resolve) => {
      this._mountedPromiseResolver = resolve;
    })

    firebaseAuth.onAuthStateChanged(this.auth, (user) => {
      this.mountedPromise.then(() => {
        this.setState({auth: {user}})
        this.reload();
      })
    });
  }

  reload = () => {
    this.props.requestReload()
  }

  newCertificate = () => {
    this.requestEdit({
      employee: this.state.filter.employee,
      startDate: null,
      endDate: null,
      files: []
    })
  }

  componentDidMount() {
    this._mountedPromiseResolver();
  }

  updateFilter = (field, value) => {
    this.setState({
      filter: _.defaults(_.fromPairs([
        [field, value]
      ]), this.state.filter)
    })
  }

  _dashboardData = (certList) => {
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

  _filter = (certList) => {
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

  requestEdit = (certEntry) => {
    this.setState({
      currentEditingTarget: certEntry,
    })
  }

  render() {
    let filteredCerts = this._filter(this.props.certificates);
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

    let display = this.state.display === 'list' ?
      (<CertsTable requestEdit={this.requestEdit} certs={filteredCerts}></CertsTable>) :
      (<CertsPivot requestEdit={this.requestEdit} certs={filteredCerts}></CertsPivot>)

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
          |

          <label className="form-inline">
            Reference date:
            <DatePicker
              selected={this.state.filter.referenceDate}
              onChange={e => this.updateFilter('referenceDate', e)}
              />
          </label>
          |

          <label className="certificates-filter">
            <input
                checked={this.state.display === 'list'}
                onChange={(e) => this.setState({display: e.currentTarget.value})}
                value="list"
                type="radio"
                name="display-type"
                />
              Show list
          </label>

          <label className="certificates-filter">
            <input
                checked={this.state.display === 'pivot'}
                onChange={(e) => this.setState({display: e.currentTarget.value})}
                value="pivot"
                type="radio"
                name="display-type"
                />
              Show summary
          </label>
          |

          <button type="button" onClick={this.newCertificate.bind(this)}
            className="btn btn-primary"
            >
            <i className=" glyphicon glyphicon-plus"></i>
            Add certificate
          </button>
        </div>
        {display}
        <CertsForm
          onSave={this.reload}
          editingTarget={this.state.currentEditingTarget}
          ></CertsForm>
      </main>
    )
  }
}

export class CertsUI extends React.Component {
  render() {
    return <SingletonListsProvider>
        <SingletonListsConsumer source="certificateList">
        {({data, requestReload}) => <CertsUIImpl certificates={data} requestReload={requestReload} />}
      </SingletonListsConsumer>
    </SingletonListsProvider>
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
