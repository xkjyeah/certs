import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CertsDashboard} from './CertsDashboard.jsx';
import {CertsForm} from './CertsForm.jsx';
import * as firebase from 'firebase';
import _ from 'lodash';
import moment from 'moment';
import events from './events';

export class CertsUI extends React.Component {
  /// Firebase section
  setupFirebase() {
  }

  login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider)
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

    firebase.auth().onAuthStateChanged((user) => {
      this.setState({auth: {user}})
    });

    events.on('certificatesLoaded', (certificates) => {
      let now = Date.now();
      this.setState({
        certificates: certList,
        dashboardData: {
          recentlyExpired: _(certList)
            .filter(c => c.endDate.valueOf() < now)
            .sortBy(c => -c.endDate.valueOf())
            .value(),
          expiringSoon: _(certList)
            .filter(c => c.endDate.valueOf() >= now)
            .sortBy(c => c.endDate.valueOf())
            .value(),
          recent: _(certList)
            .filter(c => isFinite(c.startDate.valueOf()))
            .sortBy(c => -c.startDate.valueOf())
            .value(),
        }
      })
    });
  }

  reload() {
    events.emit('requestReload')
  }

  componentDidMount() {
    this.reload();
  }

  render() {
    let loginArea = this.state.auth.user ?
      `Logged in as ${this.state.auth.user.displayName} ${this.state.auth.user.email}` :
      <button onClick={this.login}>Login</button>;

    return (
      <main>
        {loginArea}
        <CertsDashboard data={this.state.dashboardData}></CertsDashboard>
        <CertsForm onSave={this.reload.bind(this)}></CertsForm>
      </main>
    )
  }
}
