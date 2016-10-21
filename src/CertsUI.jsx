import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CertsDashboard} from './CertsDashboard.jsx';
import {CertsForm} from './CertsForm.jsx';
import * as firebase from 'firebase';
import _ from 'lodash';

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
  }

  async reload() {
    // var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('certificates').once('value')
    .then(x => {
      let certificates = x.val()

      _.forEach(certificates, (cert, key) => {
        cert.id = key
        cert.endDate = new Date(cert.endDate)
        cert.startDate = new Date(cert.startDate)
      });

      let certList = _.values(certificates);
      let now = Date.now();

      this.setState({
        certificates: certList,
        dashboardData: {
          recentlyExpired: _(certList)
            .filter(c => c.endDate.getTime() < now)
            .sortBy(c => -c.endDate.getTime())
            .value(),
          expiringSoon: _(certList)
            .filter(c => c.endDate.getTime() > now)
            .sortBy(c => c.endDate.getTime())
            .value(),
          recent: _(certList)
            .filter(c => isFinite(c.startDate.getTime()))
            .sortBy(c => -c.startDate.getTime())
            .value(),
        }
      })
    })
  }

  componentDidMount() {
    this.reload();
  }

  render() {
    let loginArea = this.state.auth.user ?
      `Logged in as ${this.state.auth.user.displayName} ${this.state.auth.user.email}` :
      <button onClick={this.login}>Login</button>;

    console.log(this.state.dashboardData)

    return (
      <main>
        {loginArea}
        <CertsDashboard data={this.state.dashboardData}></CertsDashboard>
        <CertsForm onSave={this.reload.bind(this)}></CertsForm>
      </main>
    )
  }
}
