const route = require('express').Router()
const axios = require('axios')
const fs = require('fs')

global.clock = new Date('2021-01-01T00:00:00.00')

var getUrls = () => fs.readFileSync('./urls.txt', { encoding: "utf-8" }).split('\n')

setInterval(() => {
    clock.setMilliseconds(clock.getMilliseconds() + 1000)
    console.log(clock)
}, 1000)

route.post('/', (req, res) => {
    let allInstances = []
    var url = `/berkeley/difference?hour=${clock.getHours()}&minutes=${clock.getMinutes()}&seconds=${clock.getSeconds()}`
    getUrls().forEach(x => allInstances.push(axios.get(x + url)));
    axios.all(allInstances)
        .then(responseArr => {
            let avg = 0, i = 0, urls = [];
            responseArr.forEach(x => avg += x.data.difference)
            avg /= (responseArr.length + 1)
            getUrls().forEach(x => urls.push(
                axios.post(x + '/berkeley/time', {
                    seconds: avg + responseArr[i++].data.difference
                }
                )))
            axios.all(urls).catch((err) => { throw err })
            clock.setMilliseconds(clock.getMilliseconds() + avg * 1000)
            res.sendStatus(200)
        }).catch((err) => {
            res.sendStatus(500)
            console.log(err);
        });
})

module.exports = route