# efa-export-stops-by-list

Exports stops from EFA using stop list endpoint.

# Usage

```
const exportStops = require("efa-export-stops-by-list");

const url = "http://www2.vvs.de/vvs/XML_STOPLIST_REQUEST?tariffZones=1&coordOutputFormat=WGS84[DD.DDDDD]";

exportStops(url, "UTF-8");
```

Parameters:

* `url` - url of the `XML_STOPLIST_REQUEST` EFA endpoint.
* `encoding` - optional encoding, assumes `UTF-8` by default.

The script roduces CSV output in the following format:

```
"stop_id","stop_name","stop_lon","stop_lat","stop_code"
5501244,"Lorch, Kath.Kindergarten",9.686,48.79881,""
```

Results are written to the standard output.

# Disclaimer

Usage of this script may or may not be legal, use on your own risk.  
This repository provides only source code, no data.

# License

Source code is licensed under [BSD 2-clause license](LICENSE). No license and no guarantees implied on the produced data, produce and use on your own risk.