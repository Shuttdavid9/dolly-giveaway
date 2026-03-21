exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: "Netlify Function is working!", 
      time: new Date().toISOString(),
      method: event.httpMethod
    })
  };
};
