import React from "react";
import ReactDOM from "react-dom";
//import Slider, { Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import Slider, { createSliderWithTooltip } from "rc-slider";

import "rc-slider/assets/index.css";
//import "./styles.css";

const style = { width: 600, margin: 50 };

function log(value) {
  console.log(value); //eslint-disable-line
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0
    };
  }
  onSliderChange = value => {
    this.setState(
      {
        value
      },
      () => {
        const SliderValue=this.state.value
        console.log("Slider value: ",SliderValue);
      }
    );
  };

  render() {
    return (
      <div style={{ margin: 50 }}>
        <p>{this.state.value}</p>
        <Slider
          min={0}
          max={120}
          value={this.state.value}
          onChange={this.onSliderChange}
          railStyle={{
            height: 2
          }}
          handleStyle={{
            height: 28,
            width: 28,
            marginLeft: -14,
            marginTop: -14,
            backgroundColor: "red",
            border: 0
          }}
          trackStyle={{
            background: "none"
          }}
        />
      </div>
    );
  }
}

export default App;
