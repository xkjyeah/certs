import * as React from 'react';
import * as ReactDOM from 'react-dom';
import events from './events';
import firebase from 'firebase';

export class Downloader extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      url: ''
    }
  }
  // componentWillReceiveProps(props) {
  // }
  componentDidMount() {
    this._isMounted = true;
    firebase.storage().ref(this.props.storageRef).getDownloadURL()
      .then(s => {
        if (this._isMounted) {
          this.setState({url: s})
        }
      })
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    return (
      <a href={this.state.url}
        target="_blank"
        className="glyphicon glyphicon-file"></a>
    )
  }
}
