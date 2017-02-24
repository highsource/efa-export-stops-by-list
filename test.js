const exportStops = require("./index.js");

const url = "http://www2.vvs.de/vvs/XML_STOPLIST_REQUEST?tariffZones=1&coordOutputFormat=WGS84[DD.DDDDD]";

exportStops(url);