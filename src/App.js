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
      connected: false,
      layerName: 'GPW_Population_Density_2000',
      date: '2000-06-21',
      format: 'png',
      resolution: '1km'
    }
    api.connect();

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addLayer = this.addLayer.bind(this)
    this.enableLayer = this.enableLayer.bind(this)
    this.disableLayer = this.disableLayer.bind(this)

  }

  handleChange(event) {
    const name = event.target.name
    this.setState({
        [name]: event.target.value,
    })
  }

  handleSubmit(event) {
    //alert('A name was submitted: ' + this.state.value);
    console.log("Submit!")
    event.preventDefault();

    this.setState({
        layerName: event.target.layerName.value,
        date: event.target.date.value,
        format: event.target.format.value,
        resolution: event.target.resolution.value
    })

    this.addLayer()
  }

  async addLayer() {

    const layerName = this.state.layerName;
    const date = this.state.date;
    const resolution = this.state.resolution;
    const format = this.state.format;

    const generatedLayer = await this.openspace.globebrowsing.createGibsGdalXml(layerName, date, resolution, format)
    console.log( generatedLayer[1])
    this.openspace.globebrowsing.addLayer("Earth", "ColorLayers",{
        Identifier : layerName,
        Name : layerName,
        FilePath : generatedLayer[1]
      }
    )
  }

  enableLayer(){

    this.openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.ColorLayers." + this.state.layerName + ".Enabled", true);
  }


  disableLayer(){

    this.openspace.setPropertyValueSingle("Scene.Earth.Renderable.Layers.ColorLayers." + this.state.layerName + ".Enabled", false);
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

        <button className="browsebtn">
        <a href="https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+Available+Imagery+Products" target="_blank">Browse data</a>
        </button>

        {console.log(this.state)}
        <form onSubmit={this.handleSubmit}>
          <br></br>
          Layer Name:
          <input type="text" name="layerName" defaultValue={this.state.layerName} onChange = {this.handleChange}></input>
          <br></br>
          Date:
          <input type="text" name="date" defaultValue={this.state.date} onChange = {this.handleChange}></input>
          <br></br>
          Resolution:
          <input type="text" name="resolution" defaultValue={this.state.resolution} onChange = {this.handleChange}></input>
          <br></br>
          Format:
          <input type="text" name="format" defaultValue={this.state.format} onChange = {this.handleChange}></input>
          <button type="submit" value="Submit">Add Layer to OpenSpace</button>
        </form>

        <button onClick = {this.enableLayer}> Enable Layer: {this.state.layerName}</button>

        <button onClick = {this.disableLayer} className="disable"> Disable Layer: {this.state.layerName}</button>



      </div>
    </div>
  }
}

export default App;
