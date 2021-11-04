import * as firebaseAuth from 'firebase/auth';
import * as firebaseDatabase from 'firebase/database';

export function db() {
  var userId = firebaseAuth.getAuth().currentUser.uid;

  return firebaseDatabase.ref(firebaseDatabase.getDatabase(), `users/${userId}/`)
}

const extensionFrom = (contentType) => {
  switch (contentType) {
    case 'application/pdf':
      return '.pdf'
    case 'image/png':
      return '.png'
    case 'image/gif':
      return '.gif'
    case 'image/jpeg':
      return '.jpeg'
    default:
      return ''
  }
}

export const expectedFileName = ({employee, certificate, index, mimeType}) => {
  return `${employee}-${certificate}-${index}${extensionFrom(mimeType)}`
    .replace(/"/, '')
}