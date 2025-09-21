import { Component } from 'react';
import Simple3DLoader from './Simple3DLoader';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Loader Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Simple3DLoader onComplete={this.props.onComplete} />;
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onComplete: PropTypes.func
};

export default ErrorBoundary;
