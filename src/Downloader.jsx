import * as React from 'react';
import * as firebaseStorage from 'firebase/storage';

export class Downloader extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.storage = firebaseStorage.getStorage()
    this.state = {
      url: ''
    }
  }
  // componentWillReceiveProps(props) {
  // }
  componentDidMount() {
    this._isMounted = true;
    firebaseStorage.getDownloadURL(firebaseStorage.ref(this.storage, this.props.storageRef))
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
