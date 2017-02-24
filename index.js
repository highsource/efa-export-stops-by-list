const Jsonix = require('jsonix').Jsonix;
const csv = require('csv');
const iconvlite = require('iconv-lite');
const got = require('got');

const itd = {
	name: 'itd',
	typeInfos: [{
		localName: 'itdRequest',
		propertyInfos: [{
			name: 'itdStopListRequest',
			typeInfo: '.itdStopListRequest'
		}]
	}, {
		localName: 'itdStopListRequest',
		propertyInfos: [{
			type: 'attribute',
			name: 'version',
			typeInfo: 'String'
		}, {
			type: 'attribute',
			name: 'language',
			typeInfo: 'Language'
		}, {
			type: 'attribute',
			name: 'sessionID',
			typeInfo: 'Integer'
		}, {
			type: 'attribute',
			name: 'client',
			typeInfo: 'String'
		}, {
			type: 'attribute',
			name: 'clientIP',
			typeInfo: 'String'
		}, {
			type: 'attribute',
			name: 'serverID',
			typeInfo: 'String'
		}, {
			type: 'attribute',
			name: 'userName',
			typeInfo: 'String'
		}, {
			type: 'attribute',
			name: 'virtDir',
			typeInfo: 'String'
		}, {
			name: 'itdOdv',
			typeInfo: '.itdOdv',
			collection: true
		}]
	}, {
		localName: 'itdOdv',
		propertyInfos: [{
			type: 'attribute',
			name: 'type',
			typeInfo: 'String'
		}, {
			name: 'itdOdvPlace',
			typeInfo: '.itdOdvPlace'
		}, {
			name: 'itdOdvName',
			typeInfo: '.itdOdvName'
		}, {
			name: 'itdCoord',
			typeInfo: '.itdCoord'
		}]
	}, {
		localName: 'itdOdvPlace',
		propertyInfos: [{
			name: 'odvPlaceElem',
			typeInfo: '.odvPlaceElem'
		}]
	}, {
		localName: 'odvPlaceElem',
		propertyInfos: [{
			type: 'attribute',
			name: 'omc',
			typeInfo: 'Integer'
		}, {
			type: 'attribute',
			name: 'placeID',
			typeInfo: 'Integer'
		}, {
			type: 'value',
			name: 'value',
			typeInfo: 'String'
		}]
	}, {
		localName: 'itdOdvName',
		propertyInfos: [{
			name: 'odvNameElem',
			typeInfo: '.odvNameElem'
		}]
	}, {
		localName: 'odvNameElem',
		propertyInfos: [{
			type: 'attribute',
			name: 'stopID',
			typeInfo: 'Integer'
		}, {
			type: 'attribute',
			name: 'tariffZones',
			typeInfo: 'String'
		}, {
			type: 'value',
			name: 'value',
			typeInfo: 'String'
		}]
	}, {
		localName: 'itdCoord',
		propertyInfos: [{
			type: 'attribute',
			name: 'x',
			typeInfo: 'Double'
		}, {
			type: 'attribute',
			name: 'y',
			typeInfo: 'Double'
		}, {
			type: 'attribute',
			name: 'mapName',
			typeInfo: 'String'
		}]
	}],
	elementInfos: [{
		elementName: 'itdRequest',
		typeInfo: '.itdRequest'
	}]
};


const context = new Jsonix.Context([itd]);

const queryItdRequest = function(url, encoding) {
	return new Promise(function(resolve, reject){

		got(url, {encoding: null}).then(response => {
			const unmarshaller = context.createUnmarshaller();
			const content = iconvlite.decode(response.body, encoding || 'UTF-8'); 
			const data = unmarshaller.unmarshalString(content);
			resolve(data.value.itdStopListRequest.itdOdv);
		}).catch(reject);
	});
};

const convertItdOdvsToStops = function(itdOdvs) {
	return itdOdvs.map(convertItdOdvToStop);
};

const convertItdOdvToStop = function(itdOdv) {
	return {
		stop_id : itdOdv.itdOdvName.odvNameElem.stopID,
		stop_name : itdOdv.itdOdvPlace.odvPlaceElem.value + ", " +itdOdv.itdOdvName.odvNameElem.value,
		stop_lon : itdOdv.itdCoord ? itdOdv.itdCoord.x : NaN,
		stop_lat : itdOdv.itdCoord ? itdOdv.itdCoord.y : NaN,
		stop_code : ""
	};
};

const removeStopsWithoutCoordinates = function(stops) {
	return stops.filter(stop => stop.stop_lon && stop.stop_lat);
};

const removeDuplicateStops = function(stops) {
	const filteredStops = [];
	const stopsById = {};

	stops.forEach(stop => {
		const existingStop = stopsById[stop.stop_id];
		if (existingStop) {
			if (	stop.stop_id !== existingStop.stop_id ||
				stop.stop_name !== existingStop.stop_name ||
				stop.stop_lon !== existingStop.stop_lon ||
				stop.stop_lat !== existingStop.stop_lat)
			{
				// console.log("Duplicate but different stop.");
				// console.log("Existing stop:", existingStop);
				// console.log("Duplicate stop:", stop);
			}
		}
		else {
			stopsById[stop.stop_id] = stop;
			filteredStops.push(stop);
		}
	});
	return filteredStops;
};

const sortStops = function(stops) {
	return stops.sort((s1, s2) => s1.stop_id < s2.stop_id);
};

const outputStops = function(stops) {
	csv.stringify(stops, {header: true, quotedString: true, columns: ["stop_id", "stop_name", "stop_lon", "stop_lat", "stop_code"]}, function(err, data){
		process.stdout.write(data);
	});
}

const exportStops = function(url, encoding)  {
	queryItdRequest(url, encoding)
	.then(convertItdOdvsToStops)
	.then(removeStopsWithoutCoordinates)
	.then(removeDuplicateStops)
	.then(sortStops)
	.then(outputStops)
	.catch(error => console.log(error));
};

module.exports = exportStops;