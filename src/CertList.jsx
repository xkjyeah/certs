import * as React from 'react';
import * as ReactDOM from 'react-dom';
import events from './events';

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

      return (
        <li key={cert.id} className="cert-list-entry">
          <strong>{cert.employee}</strong>
          {' -- '}
          {cert.certificate}
          <br/>
          {startDateString}
          {' to '}
          {endDateString}

          <button type="button" onClick={requestEdit}
            className="glyphicon glyphicon-pencil btn btn-default btn-xs">
          </button>
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
