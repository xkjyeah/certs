import * as firebase from 'firebase';

export function db(what) {
  var userId = firebase.auth().currentUser.uid;

  return firebase.database().ref(`users/${userId}/`)
}
