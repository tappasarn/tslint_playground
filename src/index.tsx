import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface IProps {
  name: string;
}

class App extends React.Component<IProps> {
  public render() {
    return <div>Hello {this.props.name}</div>;
  }
}

const mountNode = document.getElementById('app');
ReactDOM.render(<App name="Jane" />, mountNode);
