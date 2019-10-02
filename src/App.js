import React, { Component } from 'react';
import './App.css';
import openspaceApi from 'openspace-api-js';

class App extends Component {
  constructor(props) {
    super(props);
    let api = this._api = openspaceApi('localhost', 4682);

    api.onDisconnect(() => {
      this.setState({
        connected: false,
        chosenLayer: "AIRS_CO_Total_Column_Day"
      });
    });

    api.onConnect(async () => {
      try {
        this.openspace = await api.library();
        console.log('connected!')
        this.setState({
          connected: true,
          chosenLayer: "AIRS_CO_Total_Column_Day"
        });
      } catch (e) {
        console.log('OpenSpace library could not be loaded: Error: \n', e)
        this.setState({
          connected: false,
          chosenLayer: ""
        });
        return;
      }
    })

    this.state = {
      connected: false
    }
    api.connect();
    this.addLayer = this.addLayer.bind(this)
    this.enableLayer = this.enableLayer.bind(this)
  }

  async addLayer() {

    const myLayer = await this.openspace.globebrowsing.createGibsGdalXml(this.state.chosenLayer,"2018-06-21","2km","png")
    console.log( myLayer[1])
    this.openspace.globebrowsing.addLayer("Earth", "ColorLayers",{
        Identifier : this.state.chosenLayer,
        Name : "AIRS CO Total Column Day",
        FilePath : myLayer[1]
      }
    )
  }

  enableLayer(){

    this.openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.ColorLayers." + this.state.chosenLayer + ".Enabled", true);
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

        <button onClick = {this.addLayer}> Add Layer to OpenSpace</button>
        <button onClick = {this.enableLayer}> Enable Layer</button>

      </div>
    </div>
  }
}

export default App;
