import * as React from 'react';
import events from './events';
import {Downloader} from './Downloader.jsx';

export class CertsTable extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      orderByType: true,
      orderBy: 'startDate',
      orderByField: 'startDate',
    }
  }
  orderBy = (field, fn) => {
    return () => {
      this.setState({
        orderBy: fn || field,
        orderByField: field,
        orderByType: field == this.state.orderByField ? !this.state.orderByType : this.state.orderByType
      })
    }
  }

  render() {
    let rows = _(this.props.certs)
      .orderBy(
        [this.state.orderBy],
        [this.state.orderByType ? 'asc' : 'desc']
      )
      .map((row, id) => {
        let requestEdit = () => {
          events.emit('requestEdit', row)
        }

        let attachments = row.files.map(x =>
              (<Downloader key={x.storageRef}
                storageRef={x.storageRef} />))

        return (
          <tr key={id}>
            <td>
              <button type="button" onClick={requestEdit}
                className="glyphicon glyphicon-pencil btn btn-default btn-xs edit-button">
              </button>
            </td>
            <td>{row.employee}</td>
            <td>{row.certificate}</td>
            <td>{row.issuer}</td>
            <td>{attachments}</td>
            <td>{row.startDate && row.startDate.format('DD-MMM-YYYY')}</td>
            <td>{row.endDate && row.endDate.format('DD-MMM-YYYY')}</td>
          </tr>
        )
      })
      .value()

    return (
      <section className="certificates-table">
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th></th>
              <th onClick={this.orderBy('employee')}>Name</th>
              <th onClick={this.orderBy('certificate')}>Cert</th>
              <th onClick={this.orderBy('issuer')}>Issuer</th>
              <th onClick={this.orderBy('attachments', x => (x.files && x.files.length) || 0)}>Attachments</th>
              <th onClick={this.orderBy('startDate')}>Starts</th>
              <th onClick={this.orderBy('endDate')}>Expires</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </section>
    )
  }
}
