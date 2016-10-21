import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CertsDashboard} from './CertsDashboard.jsx';
import {CertsForm} from './CertsForm.jsx';
import * as firebase from 'firebase';

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

  componentDidMount() {
    // var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('certificates').once('value')
    .then(x => this.setState({certificates: x.val()}))
  }

  render() {
    let loginArea = this.state.auth.user ?
      `Logged in as ${this.state.auth.user.displayName} ${this.state.auth.user.email}` :
      <button onClick={this.login}>Login</button>;

    return (
      <main>
        {loginArea}
        <CertsDashboard data={this.state.dashboardData}></CertsDashboard>
        <CertsForm></CertsForm>
      </main>
    )
  }
}
