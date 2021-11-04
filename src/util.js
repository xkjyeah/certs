import * as firebaseAuth from 'firebase/auth';
import * as firebaseDatabase from 'firebase/database';

export function db() {
  var userId = firebaseAuth.getAuth().currentUser.uid;

  return firebaseDatabase.ref(firebaseDatabase.getDatabase(), `users/${userId}/`)
}
