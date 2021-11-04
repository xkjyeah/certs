import * as React from 'react';
import events from './events';

export class CertsPivot extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      rowCategories: [],
      colCategories: [],
      hiddenCertificates: {},
      hiddenEmployees: {},
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

        return [
          <td key={c.id + '-issued'}
            onClick={() => this.props.requestEdit(c)}
            title={`${e}, ${i}`}
            className="issued">{c.startDate && c.startDate.format('DD MMM YYYY')}</td>,
          <td key={c.id + '-expires'}
            onClick={() => this.props.requestEdit(c)}
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

    const renderHiddenEmployees = (cert) => {
      const showEmployee = () => this.setState({
        hiddenEmployees: _.omit(this.state.hiddenEmployees, [cert])
      });

      return (<li key={cert} onClick={showEmployee}>{cert}</li>)
    }

    const hideEmployee = (event, e) => {
      event.preventDefault()
      this.setState({
        hiddenEmployees: {
          ...this.state.hiddenEmployees,
          [e]: true
        }
      });
    }

    return (
      <section className="certificates-pivot-table">
        <div>
          <b>Hidden certificates:</b>
          <ul className="hidden-certificates">
            {_(this.state.hiddenCertificates).keys().sortBy().map(renderHiddenCertificate).value()}
          </ul>
        </div>
        <div>
          <b>Hidden employees:</b>
          <ul className="hidden-certificates">
            {_(this.state.hiddenEmployees).keys().sortBy().map(renderHiddenEmployees).value()}
          </ul>
        </div>

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
                      hiddenCertificates: {
                        ...this.state.hiddenCertificates,
                        [c]: true,
                      }
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
              .filter(e => !(e in this.state.hiddenEmployees))
              .map(e => (
                <tr key={`row-${e}`}>
                  <th>
                    {e}
                    <a href="#" onClick={(event) => hideEmployee(event, e)}>[-]</a>
                  </th>
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
