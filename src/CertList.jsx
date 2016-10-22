import * as React from 'react';
import * as ReactDOM from 'react-dom';
import events from './events';

export var CertList = React.createClass({
  render() {
    let certNodes = this.props.data.map(cert => {
      var requestEdit = () => {
        events.emit('requestEdit', cert)
      }

      var startDateString = cert.startDate && cert.startDate.format('DD MMM YYYY');
      var endDateString = cert.endDate && cert.endDate.format('DD MMM YYYY');

      return (
        <li key={cert.id}>
          <strong>{cert.employee}</strong>
          {' -- '}
          {cert.certificate}
          <br/>
          {startDateString}
          {' to '}
          {endDateString}

          <button type="button" onClick={requestEdit}
            className="glyphicon glyphicon-pencil button button-default">
          </button>
        </li>
      )
    })

    return (
      <div className="cert-list">
        <h4>{this.props.title}</h4>
        <ul>
          {certNodes}
        </ul>
      </div>
    )
  }
})
