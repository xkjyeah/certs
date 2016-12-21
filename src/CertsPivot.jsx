import * as React from 'react';
import * as ReactDOM from 'react-dom';
import events from './events';
import CertList from './CertList.jsx';
import {Downloader} from './Downloader.jsx';

export class CertsPivot extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      rowCategories: [],
      colCategories: [],
      hiddenCertificates: {}
    }
  }
  render() {
    let rowCategories = _(this.props.certs)
      .map(c => c.employee)
      .uniqBy()
      .sort()
      .value();

    let colCategories = _(this.props.certs)
      .map(c => c.certificate)
      .uniqBy()
      .sort()
      .value();

    let data = _(this.props.certs)
      .groupBy(c => c.employee)
      .mapValues(cs => _.groupBy(cs, c => c.certificate))
      .value()

    function renderCell(cs, e, i) {
      if (!cs) {
        return (<td key={`empty-${e}-${i}`} colSpan="2" className="empty"></td>)
      } else {
        let c = _.maxBy(cs, c => c.startDate)
        let requestEdit = () => {
          events.emit('requestEdit', c)
        }

        return [
          <td key={c.id + '-issued'}
            onClick={requestEdit}
            title={`${e}, ${i}`}
            className="issued">{c.startDate && c.startDate.format('DD MMM YYYY')}</td>,
          <td key={c.id + '-expires'}
            onClick={requestEdit}
            title={`${e}, ${i}`}
            className="expires">{c.endDate && c.endDate.format('DD MMM YYYY')}</td>
        ]
      }
    }

    const renderHiddenCertificate = (cert) => {
      const showCertificate = () => this.setState({
        hiddenCertificates: _.omit(this.state.hiddenCertificates, [cert])
      });

      return (<li key={cert} onClick={showCertificate}>{cert}</li>)
    }

    return (
      <section className="certificates-pivot-table">
        <b>Hidden certificates:</b>
        <ul className="hidden-certificates">
          {_(this.state.hiddenCertificates).keys().sortBy().map(renderHiddenCertificate).value()}
        </ul>
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th></th>
              {
                colCategories
                .filter(r => !(r in this.state.hiddenCertificates))
                .map(c => {
                  const hideCertificate = (e) => {
                    e.preventDefault();
                    this.setState({
                      hiddenCertificates: _.defaults({
                        [c]: true,
                      }, this.state.hiddenCertificates)
                    })
                  };
                  return (<th key={`col-${c}`} colSpan="2">
                    {c}
                    <a href="#" onClick={hideCertificate}>[-]</a>
                  </th>)
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              rowCategories
              .map(e => (
                <tr key={`row-${e}`}>
                  <th>{e}</th>
                  {
                    _.flatten(colCategories
                      .filter(r => !(r in this.state.hiddenCertificates))
                      .map(c => renderCell(data[e][c], e, c)))
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>
    )
  }
}
