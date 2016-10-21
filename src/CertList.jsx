import * as React from 'react';
import * as ReactDOM from 'react-dom';

export var CertList = React.createClass({
  render() {
    let certNodes = this.props.data.map(cert => {
      return (
        <li>{cert.recipient}, {cert.type}, {cert[this.props.dateType]}</li>
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
