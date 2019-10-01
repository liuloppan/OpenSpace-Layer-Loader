import React, { Component } from 'react';
import './App.css';
import openspaceApi from 'openspace-api-js';
import actions from './actions';

class App extends Component {
  constructor(props) {
    super(props);
    let api = this._api = openspaceApi('localhost', 4682);

    api.onDisconnect(() => {
      this.setState({
        connected: false
      });
    });

    api.onConnect(async () => {
      try {
        this.openspace = await api.library();
        console.log('connected!')
        this.setState({
          connected: true
        });
      } catch (e) {
        console.log('OpenSpace library could not be loaded: Error: \n', e)
        this.setState({
          connected: false
        });
        return;
      }
    })

    this.state = {
      connected: false
    }
    api.connect();
  }

  get connectionStatus() {
    if (this.state.connected) { 
      return <div className="connection-status connection-status-connected">
        Connected to OpenSpace
       </div>
  } else {
    return <div className="connection-status connection-status-disconnected">
        Disconnected from OpenSpace
       </div>
  }
}

  render() {
    return <div>
      {this.connectionStatus}
      <div className="main">
      {
        actions(this.openspace).map((action, id) => {
          return <div key={id} className="card">
            <h2>{action.title}</h2>
            {action.description && action.description.split('\n').map(item => {
              return <p key={item}>{item}</p>
            })}
            {
              action.buttons && Object.keys(action.buttons).map(button => {
                const fn = action.buttons[button];
                const error = () => {console.log('Disconnected!') }
                const c = this.state.connected ? "connected" : "disconnected";
                return <button key={button} className={c} onClick={this.openspace ? fn : error}>{button}</button>
              })
            }
          </div>;
        })
      }
      </div>
    </div>
  }
}

export default App;
