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
        startDate: null,
        endDate: null,
      },
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

    var serialized = {
      id,
      employee: this.state.data.employee,
      certificate: this.state.data.certificate,
      startDate: this.state.data.startDate.format(),
      endDate: this.state.data.endDate.format(),
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
      let files = _.filter(this.state.files, (v) =>
          !deleted.find(f => f.key == v.key))
          .concat(uploaded)

      serialized.files = _.keyBy(files, 'key')

      // Maybe this sometimes fails??
      console.log(serialized.files);
      console.log(this.state.files);
      console.log(deleted, uploaded);

      assert.strictEqual(
        _.size(serialized.files),
        this.state.files.length - deleted.length + uploaded.length);

      console.log("BEFORE SAVE: ", serialized);

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

    return (
      <div className={backdropClasses}>
        <form className="certs-form">
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
            </label>
            <label className="form-inline">
              Certificate
              <MySelect
                source="certificates"
                value={this.state.data.certificate}
                onChange={this.handleChange('certificate')}
                />
            </label>
            <label className="form-inline">
              Validity
              <DatePicker selected={this.state.data.startDate}
                onChange={this.handleChange('startDate')}
                />
            </label>
            <label className="form-inline">
              Expiry
              <DatePicker selected={this.state.data.endDate}
                onChange={this.handleChange('endDate')}
                />
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



          <button type="button" onClick={this.save} className="btn btn-primary">Save</button>
          <button type="button" onClick={this.dismiss} className="btn btn-default">Cancel</button>

          <hr/>
          <button type="button" onClick={this.delete}
            disabled={this.state.data.id ? false : true}
            className="btn btn-danger">Delete</button>
        </form>
      </div>
    )
  }
})
