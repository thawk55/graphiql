import GraphiQL from 'graphiql';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import React, { Component } from 'react';
import { Modal } from 'react-overlays';
import 'whatwg-fetch';

const URLS = [
  { name: "Staging", url: "https://backend-staging.divvypay.com/graphql" },
  { name: "Dev", url: "https://backend-dev.divvypay.com/graphql" },
]

const modalStyle = {
  position: 'fixed',
  zIndex: 1040,
  top: 0, bottom: 0, left: 0, right: 0,
};

const backdropStyle = {
  ...modalStyle,
  zIndex: 'auto',
  backgroundColor: '#000',
  opacity: 0.5,
};

const dialogStyle = {
  position: 'absolute',
  width: 300,
  top: '50%', left: '50%',
  transform: `translate(-50%, -50%)`,
  border: '1px solid #e5e5e5',
  backgroundColor: 'white',
  boxShadow: '0 5px 15px rgba(0,0,0,.5)',
  padding: 20,
};

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

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.setBearerToken = this.setBearerToken.bind(this);
    this.setFetchUrl = this.setFetchUrl.bind(this);
    this.toggleToken = this.toggleToken.bind(this);
    this.state = {
      showToken: false,
      bearerToken: "",
      urls: URLS,
      currentUrl: URLS[0].url,
      showBackendModal: false,
    };
  }

  setBearerToken(event) {
    this.setState({bearerToken: event.nativeEvent.target.value});
  }

  setFetchUrl(event) {
    this.setState({ currentUrl: event.nativeEvent.target.value });
  }

  toggleToken() {
    this.setState({ showToken: !this.state.showToken });
  }

  showBackendModal = () => {
    this.setState({ showBackendModal: true })
  }

  closeBackendModal = () => {
    this.setState({ showBackendModal: false })
  }

  addBackendUrl = () => {
    console.log(this.refs.backendName);
    const name = this.refs.backendName.value;
    const url = this.refs.backendUrl.value;
    if (!isEmpty(name) && !isEmpty(url)) {
      this.setState({
        urls: [...this.state.urls, { name, url }],
        currentUrl: url,
        showBackendModal: false,
      })
    }
  }

  render() {
    const fetcher = params => fetch(this.state.currentUrl, {
      method: 'post',
      headers: {
        'Content-Type': "application/json",
        'Authorization': `BEARER ${this.state.bearerToken}`,
      },
      body: JSON.stringify(params),
    }).then(response => response.json());

    const iconSize = {height: '12px', width:'12px'};
    let tokenIcon;
    if (this.state.showToken) {
      tokenIcon = <img src="/checkmark.png" alt="Hide Token" style={iconSize} />
    } else {
      tokenIcon = <img src="/edit.png" alt="Edit Token" style={iconSize} />
    }
    return (
      <DivvyGraphiQL fetcher={fetcher}>
        <GraphiQL.Logo>
          <img src="/logo.png" alt="Divvy Logo" style={{width: '30px'}} />
        </GraphiQL.Logo>
        <GraphiQL.Toolbar>
          <div>
            <span style={{margin: '5px'}}>
              <label htmlFor="backend">Backend: </label>
              <select value={this.state.currentUrl} onChange={this.setFetchUrl}>
                {map(this.state.urls, (backend, idx) => (
                  <option key={backend.name + idx} value={backend.url}>{backend.name}</option>
                ))}
              </select>
            </span>
            <span>
              <img src="/plus.png" alt="Add Backend URL" style={iconSize} onClick={this.showBackendModal} />
            </span>
            <span style={{margin: '5px'}}>
              <label htmlFor="backend">Bearer Token</label>
              <span style={{margin: '5px', fontSize: '10px'}} id="toggle-token" onClick={this.toggleToken}>{tokenIcon}</span>
              {this.state.showToken ?
                <input type="text" placeholder="Token" value={this.state.bearerToken} onChange={this.setBearerToken} />
              :
                null
              }
            </span>
            <Modal style={modalStyle} backdropStyle={backdropStyle} show={this.state.showBackendModal} onHide={this.closeBackendModal}>
              <div style={dialogStyle}>
                <h4>Add Backend URL</h4>
                <div style={{height: '35px'}}>
                  <div style={{float: 'left', width: '70px', height: '30px'}}><label htmlFor="name">Name:</label></div>
                  <div style={{float: 'left', height: '30px', padding: '0', margin: '0'}}>
                    <input type="text" name="name" ref="backendName" style={{padding: '0'}} />
                  </div>
                </div>
                <div style={{height: '35px'}}>
                  <div style={{float: 'left', width: '70px', height: '30px'}}><label htmlFor="url">Url:</label></div>
                  <div style={{float: 'left', height: '30px', padding: '0', margin: '0'}}>
                    <input type="text" name="url" ref="backendUrl"/>
                  </div>
                </div>
                <button onClick={this.addBackendUrl}>Save</button>
              </div>
            </Modal>
          </div>
        </GraphiQL.Toolbar>
      </DivvyGraphiQL>
    )
  }
}

export default App;
