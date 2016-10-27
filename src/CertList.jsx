import * as React from 'react';
import * as ReactDOM from 'react-dom';
import events from './events';
import firebase from 'firebase';

export default class CertList extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      shown: 20
    }
  }

  showMore() {
    this.setState({
      shown: this.state.shown + 20
    })
  }

  render() {
    let certNodes = this.props.data.slice(0, this.state.shown).map(cert => {
      var requestEdit = () => {
        events.emit('requestEdit', cert)
      }

      var startDateString = cert.startDate && cert.startDate.format('DD MMM YYYY');
      var endDateString = cert.endDate && cert.endDate.format('DD MMM YYYY');

      var files = cert.files.map(f =>
        <Downloader key={f.key} storageRef={f.storageRef}></Downloader>
      )

      return (
        <li key={cert.id} className="cert-list-entry">
          <div className="name-cert">
            <div className="employee">
              {cert.employee}
            </div>
            <div className="certificate">
              <span className="files">
                {files}
              </span>
              {cert.certificate}
            </div>
          </div>
          <div className="dates">
            <div className="startDate">
              {startDateString}
            </div>
            <div className="endDate">
              {endDateString}
            </div>

            <button type="button" onClick={requestEdit}
              className="glyphicon glyphicon-pencil btn btn-default btn-xs edit-button">
            </button>
          </div>
          <div className="remarks">
            <span className="label">Issued by:</span> {cert.issuer || ''}
          </div>
        </li>
      )
    })

    let showMore = (<button className="btn btn-link"
        onClick={this.showMore.bind(this)}>
        More...
      </button>);

    return (
      <div className="cert-list">
        <h4>{this.props.title}</h4>
        <ul>
          {certNodes}
        </ul>
        {(this.state.shown < this.props.data.length) ? showMore : ''}
      </div>
    )
  }
}

class Downloader extends React.Component {
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
