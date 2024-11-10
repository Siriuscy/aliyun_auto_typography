// Get keys from aspose site.
// There is free quota available.
// For more details, see https://purchase.aspose.cloud/pricing
	
var conf = {
    "basePath":"https://api.aspose.cloud/v4.0",
    "authPath":"https://api.aspose.cloud/connect/token",
    "apiKey":"2e8dd666f34e68b99355d73257bf4962",
    "appSID":"36e4d2b3-3f87-419f-8dfa-955658382915",
    "defaultUserAgent":"NodeJsWebkit"
};

var api = require('@asposecloud/aspose-html-cloud');

// Create Conversion Api object
var conversionApi = new api.ConversionApi(conf);

var src = "./demo.md"; // {String} Source document.
var dst = "./demo.jpeg"; // {String} Result document.
var opts = null;

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
};

conversionApi.convertLocalToLocal(src, dst, opts, callback);