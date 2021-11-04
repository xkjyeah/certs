import * as React from 'react';
import events from './events';
import {Downloader} from './Downloader.jsx';

export default class CertList extends React.Component {
  constructor() {
    super()
    this.state = {
      shown: 20
    }
  }

  showMore = () => {
    this.setState({
      shown: this.state.shown + 20
    })
  }

  render() {
    let certNodes = this.props.data.slice(0, this.state.shown).map(cert => {
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

            <button type="button" onClick={() => this.props.requestEdit(cert)}
              className="glyphicon glyphicon-pencil btn btn-default btn-xs edit-button">
            </button>
          </div>
          <div className="remarks">
            <span className="label">Issued by:</span> {cert.issuer || ''}<br/>
            <span className="label secondary">Created by: {cert.createdBy || ''}
              at {cert.createdAt && cert.createdAt.format('DD-MM-YYYY HH:mm:ss')}
            </span>
            <br/>
            <span className="label secondary">Updated by: {cert.updatedBy || ''}
              at {cert.updatedAt && cert.updatedAt.format('DD-MM-YYYY HH:mm:ss')}
            </span><br/>
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
