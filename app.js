const express = require('express');
const ExpressError = require('./expressError')
const app = express();

app.use(function (req, res, next) {
    if (req.query.nums) {
        return next()
    } else {
        noNumbersError = new ExpressError('Numbers are required!', 403)
        req.error = noNumbersError
        return next()
    }
})
app.use(function (req, res, next) {
    if (req.error) {
        return next();
    }
    try {
        const nums = req.query.nums.split(",").map(n => {
            const num = parseInt(n)
            console.log(num)
            if (isNaN(num)) {
                throw new ExpressError(`${n} is Not a Number!`, 403)
            } else { return num }
        }).sort();
        req.nums = nums
        next()
    } catch (err) {
        return next(err)
    }
}
)
app.get('/mean', function (req, res, next) {
    if (req.error) {
        return next(req.error);
    }
    let sum = req.nums.reduce(function (a, b) {
        return a + b;
    }, 0);

    let mean = sum / req.nums.length

    res.json({
        response:
        {
            operation: "mean",
            value: mean
        }
    })
})

app.get('/median', function (req, res, next) {
    if (req.error) {
        return next(req.error);
    }
    const nums = req.nums;
    let median;
    if ((nums.length % 2) == 0) {
        median = (nums[(nums.length / 2) - 1] + nums[(nums.length / 2)]) / 2
    } else {
        median = nums[Math.floor((nums.length / 2))]
    }
    res.json({
        response:
        {
            operation: "median",
            value: median
        }
    })
})

app.get('/mode', function (req, res, next) {
    if (req.error) {
        return next(req.error);
    }
    const nums = req.nums;
    let count = {}
    let maxCount = 0;
    for (n of nums) {
        if (count[n]) {
            count[n]++
            maxCount = Math.max(maxCount, count[n])
        } else {
            count[n] = 1
        }
    }
    let modes = [];
    for (n in count) {
        if (count[n] === maxCount) {
            modes.push(n)
        }
    }
    res.json({
        response:
        {
            operation: "mode",
            value: modes
        }
    })

});

app.use(function (req, res, next) {
    const notFoundError = new ExpressError("Page not found!", 404)
    return next(notFoundError)
});

app.use(function (err, req, res, next) {
    let status = err.status || 500;
    let message = err.message;

    return res.status(status).json({
        error: { message, status }
    });
});

app.listen(3000, function () {
    console.log("app on port 3000")
})

module.exports = { app }