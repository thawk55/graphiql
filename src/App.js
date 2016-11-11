import GraphiQL from 'graphiql';
import React, { Component } from 'react';
import 'whatwg-fetch';

const URLS = {
  staging: "https://backend-staging.divvypay.com/graphql",
  dev: "https://backend-dev.divvypay.com/graphql",
}

class DivvyGraphiQL extends GraphiQL {
  constructor(props, context) {
    super(props, context);
  }

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
  fetchUrl = URLS.staging;

  constructor(props, context) {
    super(props, context);
    this.state = { showToken: false, bearerToken: "" };
    this.setBearerToken = this.setBearerToken.bind(this);
    this.setFetchUrl = this.setFetchUrl.bind(this);
    this.toggleToken = this.toggleToken.bind(this);
  }

  setBearerToken(event) {
    this.setState({bearerToken: event.nativeEvent.target.value});
  }

  setFetchUrl(event) {
    this.fetchUrl = event.nativeEvent.target.value;
  }

  toggleToken() {
    this.setState({ showToken: !this.state.showToken });
  }

  render() {
    const fetcher = params => fetch(this.fetchUrl, {
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
              <select defaultValue={URLS.staging} onChange={this.setFetchUrl}>
                <option value={URLS.staging}>Staging</option>
                <option value={URLS.dev}>Dev</option>
              </select>
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
          </div>
        </GraphiQL.Toolbar>
      </DivvyGraphiQL>
    )
  }
}

export default App;
