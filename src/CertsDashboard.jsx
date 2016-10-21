import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {CertList} from './CertList.jsx';

export var CertsDashboard = React.createClass({
  render() {
    console.log(this.props);
    return (
      <section className="dashboard">
        <CertList data={this.props.data.expiringSoon} title="Expiring Soon"
            dateType="endDate">
        </CertList>

        <CertList data={this.props.data.recentlyExpired} title="RecentlyExpired"
            dateType="endDate">
        </CertList>

        <CertList data={this.props.data.recent} title="Recent"
            dateType="startDate">
        </CertList>

      </section>
    )
  }
})
