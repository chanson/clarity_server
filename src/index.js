import logMessage from './js/logger'
import './css/style.css'
import { Visualizer } from 'clarity-visualize'
// Log message to console
logMessage('A very warm welcome to Expack!')

// Needed for Hot Module Replacement
if(typeof(module.hot) !== 'undefined') {
  module.hot.accept() // eslint-disable-line no-undef
}

// lol hack
window.visualizer = Visualizer
