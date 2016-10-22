import * as React from 'react';
import * as ReactDOM from 'react-dom';
import events from './events';

export var CertList = React.createClass({
  render() {
    let certNodes = this.props.data.map(cert => {
      var dateString = cert[this.props.dateType].toISOString();
      var requestEdit = () => {
        events.emit('requestEdit', cert)
      }

      return (
        <li key={cert.id}>
          <strong>{cert.employee}</strong>
          {cert.certificate}
          {dateString}

          <button type="button" onClick={requestEdit}
            className="glyphicon glyphicon-pencil button button-default">
          </button>
        </li>
      )
    })

    return (
      <div>
        <h4>{this.props.title}</h4>
        <ul>
          {certNodes}
        </ul>
      </div>
    )
  }
})
