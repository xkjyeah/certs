import { initializeApp } from "firebase/app";
import {CertsUI} from './CertsUI.jsx';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

initializeApp({
  apiKey: "AIzaSyBhkTicoxu7KNAF-zm3mqzAZuK7UNu36QM",
  authDomain: "cert-manager-e3460.firebaseapp.com",
  databaseURL: "https://cert-manager-e3460.firebaseio.com",
  storageBucket: "gs://cert-manager-e3460.appspot.com",
  messagingSenderId: "302700696814"
});
console.log('app initialized')

/// Forms section
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <CertsUI/>,
    document.getElementById('content')
  )
})
