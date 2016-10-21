import * as firebase from 'firebase';
import {CertsUI} from './CertsUI.jsx';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

firebase.initializeApp({
  apiKey: "AIzaSyBhkTicoxu7KNAF-zm3mqzAZuK7UNu36QM",
  authDomain: "cert-manager-e3460.firebaseapp.com",
  databaseURL: "https://cert-manager-e3460.firebaseio.com",
  storageBucket: "",
  messagingSenderId: "302700696814"
});

var app = <CertsUI/>

window.blah = app;

/// Forms section
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    app,
    document.getElementById('content')
  )
})
