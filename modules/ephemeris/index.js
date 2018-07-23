const swisseph = require('swisseph')
const coordinateTZ = require('coordinate-tz')
const moment = require('moment-timezone')
const cors = require('cors')
const path = require('path')

const ojmod = function () {}

ojmod.prototype.init = function (ojtek) {
    ojtek.app.get('/ephemeris/', cors(), (req, res) => {
        /*//set sweph data path */
        swisseph.swe_set_ephe_path(path.normalize(__dirname + '\\ephe'))
        var sFlags = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH
        //var sFlags = swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH

        let queryData = {
            date: {
                year: parseInt(req.query.year),
                month: parseInt(req.query.month) - 1,
                day: parseInt(req.query.day),
                hour: parseInt(req.query.hour) || 12,
                minute: parseInt(req.query.minute) || 0
            },
            geo: {
                latitude: parseFloat(req.query.latitude),
                longitude: parseFloat(req.query.longitude)
            },
            eph: {
                dateobj: '',
                dategmt: {},
                julian: '',
                sidereal: '',
                housemode: req.query.house || 'P'
            },
            returns: {
                planet: {
                    'sun': swisseph.SE_SUN,
                    'moon': swisseph.SE_MOON,
                    'mercury': swisseph.SE_MERCURY,
                    'venus': swisseph.SE_VENUS,
                    'mars': swisseph.SE_MARS,
                    'jupiter': swisseph.SE_JUPITER,
                    'saturn': swisseph.SE_SATURN,
                    'uranus': swisseph.SE_URANUS,
                    'neptune': swisseph.SE_NEPTUNE,
                    'pluto': swisseph.SE_PLUTO,
                    'northnode': swisseph.SE_TRUE_NODE,
                    'blackmoonlilith': swisseph.SE_MEAN_APOG,
                    'chiron': swisseph.SE_CHIRON,
                    'juno': swisseph.SE_JUNO,
                    'vesta': swisseph.SE_VESTA,
                    'ceres': swisseph.SE_CERES
                },
                house: false
            }
        }
        let returnData = {
            addError: function (category, err) {
                if (!this.error) {
                    this.error = {}
                }
                this.error[category] = err
            }
        }

        //check for presencec of get vars
        let checkVars = ['year','month','day']
        for (key in checkVars) {
            if (!req.query[checkVars[key]]) returnData.addError(checkVars[key], 'not present')
        }

        //sanity check date
        if (!this.isDate(queryData.date.year, queryData.date.month, queryData.date.day)) {
            returnData.addError('date', 'invalid')
        }
        //sanity check hour
        if (queryData.date.hour < 0 || queryData.date.hour > 23) {
            returnData.addError('hour', 'invalid')
        }
        //sanity check minute
        if (queryData.date.minute < 0 || queryData.date.minute > 60) {
            returnData.addError('minute', 'invalid')
        }
        //sanity check latitude
        if (queryData.geo.latitude < -90 || queryData.geo.latitude > 90) {
            returnData.addError('latitude', 'out of range')
        }
        //sanity check longitude
        if (queryData.geo.longitude < -180 || queryData.geo.longitude > 180) {
            returnData.addError('longitude', 'out of range')
        }

        //if there are any errors, tell em and quit
        if (returnData.error) {
            res.send(returnData)
            return false
        }

        //we look good, time to calculate

        //create our date objects
        if (queryData.geo.latitude && queryData.geo.longitude) {
            queryData.eph.dateobj = new Date(moment.tz(queryData.date, coordinateTZ.calculate(queryData.geo.latitude, queryData.geo.longitude).timezone))
            queryData.returns.house = true
        } else {
            queryData.eph.dateobj = new Date(queryData.date.year, queryData.date.month, queryData.date.day)
        }
        queryData.eph.dategmt = {
            'year': queryData.eph.dateobj.getUTCFullYear(),
            'month': queryData.eph.dateobj.getUTCMonth(),
            'day': queryData.eph.dateobj.getUTCDate(),
            'hour': queryData.eph.dateobj.getUTCHours(),
            'minute': queryData.eph.dateobj.getUTCMinutes()
        }
        queryData.eph.julian = swisseph.swe_julday(queryData.eph.dategmt.year, queryData.eph.dategmt.month + 1, queryData.eph.dategmt.day, queryData.eph.dategmt.hour + (queryData.eph.dategmt.minute / 60), swisseph.SE_GREG_CAL)
        queryData.eph.sidereal = swisseph.swe_sidtime(queryData.eph.julian).siderialTime

        /*//calculate planets */
        returnData.planet = {}
        for (key in queryData.returns.planet) {
            var temp = swisseph.swe_calc_ut(queryData.eph.julian, queryData.returns.planet[key], sFlags)
            returnData.planet[key] = {
                'longitude': temp.longitude,
                'speed': temp.longitudeSpeed
            }
        }
        /*//calculate houses */
        if (queryData.returns.house) {
            
            var houses = swisseph.swe_houses(queryData.eph.julian, queryData.geo.latitude, queryData.geo.longitude, queryData.eph.housemode)
            houses.house[12] = houses.house[0] + 360
            returnData.house = {}
            for (key = 0; key < 12; key++) {
                var width = houses.house[parseInt(key) + 1] - houses.house[key]
                while (width < 0) width+=360
                while (width > 360) width-=360
                returnData.house[key] = {
                    'longitude': houses.house[key],
                    'width': width
                }
            }
        }

        res.send(returnData)
        ojtek.increment()
        return true
    })
}

ojmod.prototype.isDate = function (y, m, d) {
    var date = new Date(y, m - 1, d);
    var convertedDate =
        "" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
    var givenDate = "" + y + m + d;
    return (givenDate == convertedDate);
}


module.exports = new ojmod()