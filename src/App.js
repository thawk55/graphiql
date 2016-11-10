import GraphiQL from 'graphiql';
import React, { Component } from 'react';
import 'whatwg-fetch';

const URLS = {
  staging: "https://backend-staging.divvypay.com/graphql",
  dev: "https://backend-dev.divvypay.com/graphql",
}

class App extends Component {
  bearerToken = "";
  fetchUrl = URLS.staging;

  constructor(props, context) {
    super(props, context);
    this.state = { showToken: false };
    this.setBearerToken = this.setBearerToken.bind(this);
    this.setFetchUrl = this.setFetchUrl.bind(this);
    this.toggleToken = this.toggleToken.bind(this);
  }

  setBearerToken(event) {
    this.bearerToken = event.nativeEvent.target.value;
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
        'Authorization': `BEARER ${this.bearerToken}`,
      },
      body: JSON.stringify(params),
    }).then(response => response.json());
    return (
      <GraphiQL fetcher={fetcher}>
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
              <span style={{margin: '5px', fontSize: '10px'}} id="toggle-token" onClick={this.toggleToken}>Show/Hide</span>
              {this.state.showToken ?
                <input type="text" placeholder="Token" onChange={this.setBearerToken} />
              :
                null
              }
            </span>
          </div>
        </GraphiQL.Toolbar>
      </GraphiQL>
    )
  }
}

export default App;
