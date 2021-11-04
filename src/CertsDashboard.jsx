import * as React from 'react';
import CertList from './CertList.jsx';

export class CertsDashboard extends React.Component {
  render() {
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
}
