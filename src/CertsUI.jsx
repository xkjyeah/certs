import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CertsDashboard} from './CertsDashboard.jsx';
import {CertsForm} from './CertsForm.jsx';
import * as firebase from 'firebase';
import _ from 'lodash';
import moment from 'moment';
import events from './events';

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
    events.emit('requestEdit', {})
  }

  componentDidMount() {
    this._mountedPromiseResolver();

    this.onCertificatesLoaded = (certList) => {
      let now = Date.now();
      this.setState({
       certificates: certList,
       dashboardData: {
         recentlyExpired: _(certList)
           .filter(c => c.endDate && c.endDate.valueOf() < now)
           .sortBy(c => c.endDate && -c.endDate.valueOf())
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
      })
    };

    events.on('certificatesLoaded', this.onCertificatesLoaded);
  }

  componentWillUnmount() {
    events.removeListener('certificatesLoaded', this.onCertificatesLoaded);
  }

  render() {
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

        <button type="button" onClick={this.newCertificate}
          className="btn btn-primary glyphicon glyphicon-plus"
          ></button>

        <CertsDashboard data={this.state.dashboardData}></CertsDashboard>
        <CertsForm onSave={this.reload.bind(this)}></CertsForm>
      </main>
    )
  }
}
