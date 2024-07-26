import axios from "axios";

async function NeuralNetTest() {
  try {
    const response = await axios.get(`http://localhost:3001/retrain`);
    const metrics = response.data.metrics;
    const metricsString = JSON.stringify(metrics);
    return [metricsString, "Passing"];
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    return ["Neural Network: " + errorMessage, "Failed"];
  }
}
export default NeuralNetTest;
