/*jslint node: true */


function getFormattedJSON(myObject) {
  return JSON.stringify(myObject, null, 4);
}


function writeStringResponse(res, status, responseString) {
  res.writeHead(status, {
    "Content-Type": "application/json"
  });
  res.write(
    responseString
  );
  res.end();
  return;
}



module.exports = function (objectType) {
  return {


    // Sends HTTP response with LINK to object's representation
    sendLink: function (res, object) {
      res.writeHead(200, {
        "Content-Type": "application/json"
      });


      var response = {};
      response[objectType + 'Link'] = object.getLink();

      res.write(
        JSON.stringify(response, null, 4) + "\n"
      );
      res.end();
    },


    // Sends HTTP response with to object's representation
    sendObject: function (res, object) {
      try {
        var tempString = JSON.stringify(object.toJson(), null, 4) + "\n";
        writeStringResponse(res, 200, tempString);

      } catch (error) {
        log('JSON Error: ' + error);
        var tempString = JSON.stringify({
          reason: "Error in stringify: " + error
        }, null, 4) + "\n";
        writeStringResponse(res, 200, tempString);
        return;
      }


    },









    // Sends HTTP response with status 404, Not Found
    sendNotFound: function (res, message) {
      res.writeHead(404, {
        "Content-Type": "application/json"
      });

      var response = {
        reason: message.toString(),
      };
      res.write(
        JSON.stringify(response, null, 4) + "\n"
      );
      res.end();
    },

    unAuthorized: function (res, message) {
      res.writeHead(401, {
        "Content-Type": "application/json"
      });

      var response = {
        reason: message.toString(),
      };
      res.write(
        JSON.stringify(response, null, 4) + "\n"
      );
      res.end();
      return;
    },

    // Sends HTTP response: Method Not Allowed 405
    sendNotAllowed: function (res, message) {
      res.writeHead(405, {
        "Content-Type": "application/json"
      });

      var response = {
        reason: message.toString(),
      };
      res.write(
        JSON.stringify(response, null, 4) + "\n"
      );
      res.end();
      return;
    },


    // Sends HTTP response with status 200 OK with message
    sendDeleted: function (res, message) {
      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      var response = {
        message: message.toString(),
      };
      res.write(
        JSON.stringify(response, null, 4) + "\n"
      );
      res.end();
    }



  }
}