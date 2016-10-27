import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as LinkedStateMixin from 'react-addons-linked-state-mixin';
import * as firebase from 'firebase';
import assert from 'assert';
import events from './events';
import _ from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import MySelect from './MySelect.jsx';
import FileList from './FileList.jsx';
import classnames from 'classnames';

import 'react-datepicker/dist/react-datepicker.css';

export var CertsForm = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState() {
    return {
      data: {
        id: '',
        employee: '',
        certificate: '',
        issuer: '',
        startDate: null,
        endDate: null,
      },
      validationErrors: {},
      newFiles: [],
      deletedFiles: [],
      shown: false
    }
  },
  componentDidMount() {
    this.requestEditListener = (certEntry) => {
      this.setState({
        data: certEntry,
        newFiles: [],
        deletedFiles: [],
        shown: Date.now()
      })
    };
    events.on('requestEdit', this.requestEditListener);
  },
  componentWillUnmount() {
    events.removeListener('requestEdit', this.requestEditListener);
  },
  save(event) {
    var id = this.state.data.id || firebase.database().ref(`certificates`).push().key

    // HACK: validation messages:
    this.setState({
      validationErrors: {
        employee: [!!this.state.data.employee, "Employee name is required"],
        certificate: [!!this.state.data.certificate, "Certificate type is required"],
        issuer: [!!this.state.data.issuer, "Issuer is required"],
        startDate: [!!this.state.data.startDate, "Start date is required"],
      }
    })

    /* The data that will be saved in the database, before
      the file data has been included
     */
    var serialized = {
      id,
      employee: this.state.data.employee,
      certificate: this.state.data.certificate,
      issuer: this.state.data.issuer,
      startDate: this.state.data.startDate.format(),
      endDate: this.state.data.endDate && this.state.data.endDate.format(),
    };

    assert(id, "ID is empty!")

    let fileDeletePromise = Promise.all(
      this.state.deletedFiles.map(f =>
        firebase.storage().ref(f.storageRef).delete()
        .then(() => f)
      )
    )

    const newFileKeys = this.state.newFiles.map(() =>
      firebase.database().ref(`certificates/${id}/files/`).push().key)

    let fileUploadPromise = Promise.all(
      _.zip(this.state.newFiles, newFileKeys)
      .map(([f, key]) => {
        let now = Date.now();
        let storageRef = `certificates/${id}/files/${key}`;

        return firebase.storage().ref(storageRef).put(f)
          .then(() => ({
            key,
            storageRef,
            createdAt: now
          }))
      })
    )

    // console.log(serialized)
    let allTasksPromise = Promise.all([
      fileDeletePromise,
      fileUploadPromise
    ])
    .then(([deleted, uploaded]) => {
      let files = _.filter(this.state.data.files, (v) =>
          !deleted.find(f => f.key == v.key))
          .concat(uploaded)

      serialized.files = _.keyBy(files, 'key')

      assert.strictEqual(
        _.size(serialized.files),
        this.state.data.files.length - deleted.length + uploaded.length,
        "Number of files don't match. Data may be lost");

      return firebase.database().ref(`certificates/${id}`).set(serialized)
    })
    .catch((err) => {
      alert(JSON.stringify(err));
    })

    allTasksPromise.then(this.props.onSave);
    allTasksPromise.then(() => this.dismiss());
  },
  delete(event) {
    if (!confirm("Are you sure you want to delete this certificate?")) {
      return;
    }
    var id = this.state.data.id;

    assert(id, "Cannot delete empty ID")

    let deletePromise = firebase.database().ref(`certificates/${id}`).remove()

    deletePromise.then(this.props.onSave)
    deletePromise.then(() => this.dismiss())
  },
  dismiss() {
    this.setState({shown: false});
  },
  setData(newData) {
    return this.setState({
      data: _.assign({}, this.state.data, newData)
    })
  },
  handleChange(field) {
    return (date) => {
      this.setData(
        _.fromPairs([
          [field, date]
        ])
      )
    }
  },
  adjustDate(number, unit) {
    return () => {
      var ref = this.state.data.endDate || this.state.data.startDate || moment();

      ref = ref.clone();
      ref.add(number, unit);
      this.setData({
        endDate: ref
      })
    }
  },
  filesChanged(newFiles, deletedFiles) {
    console.log(newFiles, deletedFiles)
    this.setState({
      newFiles, deletedFiles
    })
  },

  render() {
    let backdropClasses = classnames({
      backdrop: true,
      show: this.state.shown
    })

    let validationMessage = (which) => {
      if (this.state.validationErrors[which] &&
        !this.state.validationErrors[which][0]
      ) {
        return (
          <span className="validation-error">
            {this.state.validationErrors[which][1]}
          </span>
        )
      }
      else {
        return '';
      }
    }

    return (
      <div className={backdropClasses}>
        <div className="certs-form"> {/* modal dialog */}

          <div className="modal-header">
            <button type="button" onClick={this.dismiss}
              className="glyphicon glyphicon-remove close"></button>
            <h4>
              Edit Certificate
            </h4>
          </div>

          <form className="modal-body">
            <div className="wrap-section">
              <div className="inputs-section">
                <input type="hidden" value={this.state.data.id} />
                <label className="form-inline">
                  Employee
                  <MySelect
                    source="employees"
                    value={this.state.data.employee}
                    onChange={this.handleChange('employee')}
                    />
                  {validationMessage('employee')}
                </label>
                <label className="form-inline">
                  Certificate
                  <MySelect
                    source="certificates"
                    value={this.state.data.certificate}
                    onChange={this.handleChange('certificate')}
                    />
                  {validationMessage('certificate')}
                </label>
                <label className="form-inline">
                  Issuer
                  <MySelect
                    source="issuer"
                    value={this.state.data.issuer}
                    onChange={this.handleChange('issuer')}
                    />
                  {validationMessage('issuer')}
                </label>
                <label className="form-inline">
                  Validity
                  <DatePicker selected={this.state.data.startDate}
                    onChange={this.handleChange('startDate')}
                    />
                  {validationMessage('startDate')}
                </label>
                <label className="form-inline">
                  Expiry
                  <DatePicker selected={this.state.data.endDate}
                    onChange={this.handleChange('endDate')}
                    />
                  {validationMessage('endDate')}
                </label>
                <table>
                  <tbody>
                    <tr>
                      <td><button className="btn btn-default"
                        type="button"
                        onClick={this.adjustDate(1, 'year')}>+年</button></td>
                      <td><button className="btn btn-default"
                        type="button"
                        onClick={this.adjustDate(1, 'month')}>+月</button></td>
                      <td><button className="btn btn-default"
                        type="button"
                        onClick={this.adjustDate(1, 'day')}>+日</button></td>
                    </tr>
                    <tr>
                      <td><button className="btn btn-default" type="button" onClick={this.adjustDate(-1, 'year')}>-年</button></td>
                      <td><button className="btn btn-default" type="button" onClick={this.adjustDate(-1, 'month')}>-月</button></td>
                      <td><button className="btn btn-default" type="button" onClick={this.adjustDate(-1, 'day')}>-日</button></td>
                    </tr>
                  </tbody>
                </table>

              </div>

              <div className="files-section">
                Current files:
                {/* <!-- refreshFile: force the stupid
                  input[type="file"] to reload --> */}
                <FileList files={this.state.data.files}
                  onChange={this.filesChanged}
                  refreshFile={this.state.shown}
                  >
                </FileList>
              </div>
            </div>
          </form>
          <div className="modal-footer">
            <button type="button" onClick={this.save} className="btn btn-primary">Save</button>
            <button type="button" onClick={this.dismiss} className="btn btn-default">Cancel</button>

            <hr/>
            <button type="button" onClick={this.delete}
              disabled={this.state.data.id ? false : true}
              className="btn btn-danger">Delete</button>
          </div>
        </div> {/* modal-dialog */}
      </div>
    )
  }
})
