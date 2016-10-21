import * as React from 'react';
import * as ReactDOM from 'react-dom';

export var CertList = React.createClass({
  render() {
    let certNodes = this.props.data.map(cert => {
      var dateString = cert[this.props.dateType].toISOString();

      return (
        <li key={cert.id}>{cert.employee}, {cert.certificate}, {dateString}</li>
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
