import GraphiQL from 'graphiql';
import _ from 'lodash';
import React, { Component } from 'react';
import { Modal } from 'react-overlays';
import 'whatwg-fetch';

const URLS = [
  { name: "", url: "" },
];

class DivvyGraphiQL extends GraphiQL {
  handleToggleDocs = () => {
    if (!this.state.docExplorerOpen) {
      this._ensureOfSchema();
    }
    if (typeof this.props.onToggleDocs === 'function') {
      this.props.onToggleDocs(!this.state.docExplorerOpen);
    }
    this.setState({ docExplorerOpen: !this.state.docExplorerOpen });
  }
}

const getLocalStorageUrls = () => {
  let urls = [];
  try {
    urls = JSON.parse(localStorage.getItem('graphiql:urls') || "[]");
  } catch (e) {
    console.error(e);
  }

  _.each(urls, (url) => {
    if (!url.authHeader && !url.authValue && url.bearerToken) {
      url.authHeader = 'Authorization';
      url.authValue = `BEARER ${url.bearerToken}`;
      delete url.bearerToken;
    }
  });
  return urls;
};

const setLocalStorageUrls = (urls) => {
  localStorage.setItem('graphiql:urls', JSON.stringify(urls || []));
};

const getLocalStorageCurrentUrlName = () => {
  return localStorage.getItem('graphiql:currentUrlName');
};

const setLocalStorageCurrentUrlName = (name) => {
  localStorage.setItem('graphiql:currentUrlName', name);
};


class UrlEditDialog extends React.Component {
  static propTypes = {
    action: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    currentUrl: React.PropTypes.object,
    onHide: React.PropTypes.func,
    onAdd: React.PropTypes.func,
    onEdit: React.PropTypes.func,
    onDelete: React.PropTypes.func,
  };

  onSave = () => {
    const { action, onAdd, onEdit } = this.props;
    const url = {
      name: this.refs.backendName.value,
      url: this.refs.backendUrl.value,
      authHeader: this.refs.authHeader.value,
      authValue: this.refs.authValue.value,
    };
    if (url.name && url.url) {
      if (action === 'add') {
        onAdd(url);
      } else {
        onEdit(url);
      }
    }
  };

  onDelete = () => {
    this.props.onDelete(this.props.currentUrl);
  };

  confirmDelete = () => {
    if (confirm('Delete this backend configuration?')) {
      this.onDelete();
    }
  };

  render() {
    const modalStyle = {
      position: 'fixed',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };

    const styles = {
      modal: modalStyle,
      backdrop: {
        ...modalStyle,
        zIndex: 'auto',
        backgroundColor: '#000',
        opacity: 0.5,
      },
      dialog: {
        position: 'absolute',
        width: '80%',
        maxWidth: 500,
        top: '100px', left: '50%',
        transform: 'translate(-50%, 0)',
        border: '1px solid #e5e5e5',
        backgroundColor: 'white',
        boxShadow: '0 5px 15px rgba(0,0,0,.5)',
        padding: 20,
      },
    };

    const { action, onHide, currentUrl } = this.props;
    const adding = action === 'add';
    const url = adding ? { name: '', url: 'https://{host}/graphql', authHeader: 'Authorization', authValue: 'BEARER <token>' } : currentUrl;

    return (
      <Modal style={styles.modal} backdropStyle={styles.backdrop} show={!!action} onHide={onHide}>
        <div id="backend-modal" style={styles.dialog}>
          <h4>{`${adding ? 'New ' : ''} Backend Settings`}</h4>
          <div>
            <label htmlFor="backend-name">Name</label>
            <input
              type="text"
              id="backend-name"
              ref="backendName"
              defaultValue={url.name}
            />
          </div>
          <div>
            <label htmlFor="backend-url">URL</label>
            <input
              type="text"
              id="backend-url"
              placeholder="https://{{host}/graphql"
              ref="backendUrl"
              defaultValue={url.url}
            />
          </div>
          <div>
            <label htmlFor="auth-header">Auth Header</label>
            <input
              type="text"
              id="auth-header"
              ref="authHeader"
              defaultValue={url.authHeader}
            />
            <label htmlFor="auth-value">Auth Value</label>
            <input
              type="text"
              id="auth-value"
              ref="authValue"
              defaultValue={url.authValue}
              placeholder="BEARER <token>"
            />
          </div>
          <input type="submit" onClick={this.onSave} value="Save" />
          <input type="submit" onClick={onHide} value="Cancel" />
          <input type="submit" onClick={this.confirmDelete} value="Delete" />
        </div>
      </Modal>
    );
  }
}

class App extends Component {
  constructor(props, context) {
    super(props, context);

    let urls = getLocalStorageUrls();
    urls = _.size(urls) > 0 ? urls : URLS;
    const currentUrl = _.find(urls, {name: getLocalStorageCurrentUrlName()}) || urls[0];

    this.state = {
      showToken: false,
      urls,
      currentUrl,
      showBackendModal: false,
    };
  }

  setFetchUrl = (event) => {
    const currentUrl = _.find(this.state.urls, {name: event.target.value});
    setLocalStorageCurrentUrlName(currentUrl.name);
    this.setState({ currentUrl });
  }

  showBackendModal = (event) => {
    const action = event.target.dataset['action'];
    this.setState({ showBackendModal: action });
  }

  closeBackendModal = () => {
    this.setState({ showBackendModal: false })
  }

  addBackendUrl = (url) => {
    const urls = [...this.state.urls, url];
    setLocalStorageUrls(urls);
    setLocalStorageCurrentUrlName(url.name);
    this.setState({
      urls: urls,
      currentUrl: url,
      showBackendModal: false,
    });
  }

  editBackendUrl = (url) => {
    const urls = this.state.urls;
    let currentUrl = _.find(this.state.urls, this.state.currentUrl);
    _.assign(currentUrl, url);
    setLocalStorageUrls(urls);
    setLocalStorageCurrentUrlName(currentUrl.name);
    this.setState({
      showBackendModal: false,
      urls,
      currentUrl,
    });
  }

  deleteBackendUrl = (url) => {
    let urls = _.filter(this.state.urls, (_url) => _url !== url);
    if (_.size(urls) === 0) {
      urls = URLS;
    }
    const currentUrl = urls[0];
    this.setState({
      showBackendModal: false,
      urls,
      currentUrl,
    });
  }

  authHeaders = () => {
    const headers = {};
    let authHeader = _.get(this, 'state.currentUrl.authHeader');
    let authValue = _.get(this, 'state.currentUrl.authValue');
    if (authHeader) {
      headers[authHeader] = authValue;
    }
    return headers;
  };

  downloadSchema = () => {
    fetch(`${this.state.currentUrl.url}/schema`, {
      method: 'get',
      headers: {...this.authHeaders()},
    }).then(response => {
      if (response.ok) {
        response.text().then(schema => {
          const downloadUri = `data:application/json,${encodeURIComponent(schema)}`;
          const downloadLink = document.createElement('a');
          downloadLink.setAttribute('href', downloadUri);
          downloadLink.setAttribute('download', 'schema.json');

          if (document.createEvent) {
            const event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            downloadLink.dispatchEvent(event);
          }
          else {
            downloadLink.click();
          }
        });
      } else {
        console.error(`Download failed with status code ${response.status}`);
      }
    });
  }

  render() {
    const fetcher = (params) => fetch(this.state.currentUrl.url, {
      method: 'post',
      headers: {
        'Content-Type': "application/json",
        ...this.authHeaders(),
      },
      body: JSON.stringify(params),
    }).then(response => response.json());

    return (
      <DivvyGraphiQL fetcher={fetcher}>
        <GraphiQL.Logo />
        <GraphiQL.Toolbar>
          <div className="settings">
            <label htmlFor="backend">Backend</label>
            <select id="backend" value={this.state.currentUrl.name} onChange={this.setFetchUrl}>
              {_.map(this.state.urls, (backend, idx) => (
                <option key={backend.name + idx} value={backend.name}>{backend.name}</option>
              ))}
            </select>
            <img src="/edit.png" alt="Edit Backend URL" data-action="edit" onClick={this.showBackendModal} />
            <img src="/plus.png" alt="Add Backend URL" data-action="add" onClick={this.showBackendModal} />
          </div>
          <div className="toolbar-right">
            <a className="toolbar-button" onClick={this.downloadSchema}>Download Schema</a>
          </div>
          <UrlEditDialog
            action={this.state.showBackendModal}
            onHide={this.closeBackendModal}
            onAdd={this.addBackendUrl}
            onEdit={this.editBackendUrl}
            onDelete={this.deleteBackendUrl}
            currentUrl={this.state.currentUrl}
          />
        </GraphiQL.Toolbar>
      </DivvyGraphiQL>
    )
  }
}

export default App;
