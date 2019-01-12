const fs = require("fs")
const R = require("ramda")
const Table = require("cli-table3")

/**
 * Data manipulation and analysis library written in JavaScript
 * offering the convenience of pandas or R.
 * @namespace Z
 */

/**
 * Synchronously reads a CSV file.
 *
 * @func
 * @memberOf Z
 * @param {String} filepath File path for the CSV file to read
 * @return {df} Zebras dataframe
 * @example
 *
 * Z.readCSV(filepath)
 */
const readCSV = R.curry(filepath => {
  const data = fs.readFileSync(filepath).toString("utf8")
  const dataProcessed = R.pipe(
    R.split("\n"),
    R.map(R.split(",")),
    R.reject(x => x == "")
  )(data)
  const headers = R.flatten(R.take(1)(dataProcessed))
  const rows = R.tail(dataProcessed)
  const df = R.map(r => R.zipObj(headers)(r), rows)
  return df
})

/**
 * Synchronously writes a dataframe to a CSV file.
 *
 * @function
 * @memberOf Z
 * @param {df} df Zebras dataframe to write
 * @param {String} filepath File path for the CSV file to write
 * @return {undefined}
 * @example
 *
 * Z.toCSV(filepath, df)
 */
const toCSV = R.curry((filepath, df) => {
  const headers = R.join(",", R.keys(R.nth(0, df)))
  const rows = R.map(R.values, df)
  const rowStrings = R.join("\n", R.map(R.join(","), rows))
  fs.writeFileSync(filepath, headers + "\n" + rowStrings)
})

/**
 * Prints dataframe.
 *
 * Returns the entire dataframe as an ASCII table.
 * If working in a local Node environment, wrap this and other printing
 * functions in `console.log()` to display ASCII tables.
 *
 * @func
 * @memberOf Z
 * @param {df} dataframe to print
 * @return {String} Entire dataframe as an ASCII table
 * @example
 *
 * Z.print(df)
 *
 * // will output an ASCII table like this:
 * ┌────────────┬───────┬───────┬───────┬───────┬───────────┬─────────┐
 * │ Date       │ Open  │ High  │ Low   │ Close │ Adj Close │ Volume  │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-03 │ 16.66 │ 16.66 │ 16.66 │ 16.66 │ 16.66     │ 1260000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-04 │ 16.85 │ 16.85 │ 16.85 │ 16.85 │ 16.85     │ 1890000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-05 │ 16.93 │ 16.93 │ 16.93 │ 16.93 │ 16.93     │ 2550000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-06 │ 16.98 │ 16.98 │ 16.98 │ 16.98 │ 16.98     │ 2010000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-09 │ 17.08 │ 17.08 │ 17.08 │ 17.08 │ 17.08     │ 2520000 │
 * └────────────┴───────┴───────┴───────┴───────┴───────────┴─────────┘
 *
 */
const print = R.curry(df => {
  const headers = R.keys(df[0])
  const rows = R.map(R.values, df)
  let printTable = new Table({
    head: headers,
  })
  printTable.push(...rows)
  return "\n" + printTable.toString()
})

/**
 * Filter dataframe rows by using a filtering function.
 *
 * Accepts a test function that determines which rows of the supplied
 * dataframe are returned.
 *
 * @func
 * @memberOf Z
 * @param {Function} predicate A filtering function
 * @param {df} dataframe Zebras dataframe to filter
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 2}, {"label": "B", "value": 10}, {"label": "C", "value": 30}]
 * Z.filter(r => r >= 10, df)
 * // [{"label": "B", "value": 10}, {"label": "C", "value": 30}]
 */
const filter = R.curry((func, df) => {
  return R.filter(func, df)
})

/**
 * Sort dataframe rows using custom sorting function.
 *
 * Accepts a sorting function that determines the order of rows in the returned
 * dataframe.
 *
 * @func
 * @memberOf Z
 * @param {Function} comparator A sorting function
 * @param {df} dataframe Zebras dataframe to sort
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.sort((a, b) => b.value - a.value, df)
 * // [{ label: "C", value: 75 },{ label: "A", value: 7 },{ label: "B", value: 2 }]
 */
const sort = R.curry((func, df) => {
  return R.sort(func, df)
})

/**
 * Sort dataframe rows by a column
 *
 * @func
 * @memberOf Z
 * @param {String} columnName Name of the column to sort by
 * @param {String} direction Determines direction, pass `asc` for ascending and `desc` for descending
 * @param {df} dataframe Zebras dataframe to sort
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.sortByCol("value", "asc", df)
 * // [{"label": "B", "value": 2}, {"label": "A", "value": 7}, {"label": "C", "value": 75}]
 */
const sortByCol = R.curry((col, direction, df) => {
  return R.sort((a, b) => {
    if (direction == "asc") {
      return a[col] - b[col]
    } else {
      return b[col] - a[col]
    }
  }, df)
})

/**
 * Convert columns to numerical type (floats)
 *
 * @func
 * @memberOf Z
 * @param {Array} columnNames Array of column names to convert
 * @param {df} dataframe Zebras dataframe to parse
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": "7"}, {"label": "B", "value": "2"}, {"label": "C", "value": "75"}]
 * Z.parseNums(["value"], df)
 * // [{"label": "B", "value": 2}, {"label": "A", "value": 7}, {"label": "C", "value": 75}]
 */
const parseNums = R.curry((cols, df) => {
  const convertRow = r => {
    const converter = (value, key, obj) => {
      if (R.includes(key, cols)) {
        return parseFloat(value)
      } else {
        return value
      }
    }
    return R.mapObjIndexed(converter, r)
  }
  return R.map(convertRow, df)
})

/**
 * Convert columns to datestamp
 *
 * @func
 * @memberOf Z
 * @param {Array} columnNames Array of column names to convert
 * @param {df} dataframe Zebras dataframe to parse
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": "2010-12-13"}, {"label": "B", "value": "2010-12-15"}, {"label": "C", "value": "2010-12-17"}]
 * Z.parseDates(["value"], df)
 * // [{"label": "A", "value": 1292198400000}, {"label": "B", "value": 1292371200000}, {"label": "C", "value": 1292544000000}]
 */
const parseDates = R.curry((cols, df) => {
  const convertRow = r => {
    const converter = (value, key, obj) => {
      if (R.includes(key, cols)) {
        return Date.parse(value)
      } else {
        return value
      }
    }
    return R.mapObjIndexed(converter, r)
  }
  return R.map(convertRow, df)
})

/**
 * Select a subset of columns
 *
 * Accepts an array with the names of the columns to retain.
 *
 * @func
 * @memberOf Z
 * @param {Array} columnNames Array of column names to pick
 * @param {df} dataframe Zebras dataframe
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.pickCols(["value"], df)
 * // [{"value": 7}, {"value": 2}, {"value": 75}]
 */
const pickCols = R.curry((cols, df) => {
  return R.map(R.pick(cols), df)
})

/**
 * Delete a column
 *
 * @func
 * @memberOf Z
 * @param {String} columnName Name of the column to delete
 * @param {df} dataframe Zebras dataframe
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.dropCol(["label"], df)
 * // [{"value": 7}, {"value": 2}, {"value": 75}]
 */
const dropCol = R.curry((col, df) => {
  return R.map(R.dissoc(col), df)
})

/**
 * Extract a series to an array from a dataframe
 *
 * @func
 * @memberOf Z
 * @param {String} columnName Name of the column to extract
 * @param {df} dataframe Zebras dataframe
 * @return {Array} Series array
 * @example
 *
 * const df = [{"label": "A", "value": "2010-12-13"}, {"label": "B", "value": "2010-12-15"}, {"label": "C", "value": "2010-12-17"}]
 * Z.getCol("label", df)
 * // ["2010-12-13", "2010-12-15", "2010-12-17"]
 */
const getCol = R.curry((col, df) => {
  return R.map(R.prop(col), df)
})

/**
 * Mean of series
 *
 * @func
 * @memberOf Z
 * @param {Array} series Series to calculate mean for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.mean(series)
 * // 34
 */
const mean = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  return R.mean(filteredArr)
})

/**
 * Median of series
 *
 * @func
 * @memberOf Z
 * @param {Array} series Series to calculate median for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.median(series)
 * // 30
 */
const median = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  return R.median(filteredArr)
})

/**
 * Standard deviation of series
 *
 * @func
 * @memberOf Z
 * @param {Array} series Series to calculate standard deviation for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.std(series)
 * // 31.36080356113344
 */
const std = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  const sampleMean = R.mean(filteredArr)
  const n = R.length(filteredArr)
  const diffs = R.map(x => x - sampleMean, filteredArr)
  const diffsSquared = R.map(x => Math.pow(x, 2), diffs)
  const summed = R.sum(diffsSquared)
  return Math.sqrt(R.divide(summed, R.subtract(n, 1)))
})

/**
 * Skew of a series
 *
 * @func
 * @memberOf Z
 * @param {Array} series Series to calculate skew for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.skew(series)
 * // 0.17542841315728933
 */
const skew = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  const sampleStd = std(filteredArr)
  const stdCubed = Math.pow(sampleStd, 3)
  const sampleMean = R.mean(filteredArr)
  const diffs = R.map(x => x - sampleMean, filteredArr)
  const diffsCubed = R.map(x => Math.pow(x, 3), diffs)
  const summed = R.sum(diffsCubed)
  const n = R.length(filteredArr)
  return summed / n / stdCubed
})

/**
 * Kurtosis of a series
 *
 * @func
 * @memberOf Z
 * @param {Array} series Series to calculate kurtosis for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.kurt(series)
 * // -2.040541067936147
 */
const kurt = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  const sampleStd = std(filteredArr)
  const stdFourth = Math.pow(sampleStd, 4)
  const sampleMean = R.mean(filteredArr)
  const diffs = R.map(x => x - sampleMean, filteredArr)
  const diffsFourth = R.map(x => Math.pow(x, 4), diffs)
  const summed = R.sum(diffsFourth)
  const n = R.length(filteredArr)
  return summed / n / stdFourth - 3
})

/**
 * Percent changes
 *
 * Returns a new series with the percent changes between the values
 * in order of the input series.
 *
 * @func
 * @memberOf Z
 * @param {Array} series Series to calculate percent changes for
 * @return {Array}
 * @example
 *
 * const series = [10, 15, 20, 25, 50, 55]
 * Z.pctChange(series)
 * // [NaN, 0.5, 0.33333333333333326, 0.25, 1, 0.10000000000000009]
 */
const pctChange = R.curry(arr => {
  const iRange = R.range(0, arr.length)
  const result = R.map(i => {
    if (i == 0) {
      return NaN
    } else {
      return arr[i] / arr[i - 1] - 1
    }
  }, iRange)
  return result
})

/**
 * Correlation between two series
 *
 * @func
 * @memberOf Z
 * @param {Array} series1 First series
 * @param {Array} series2 Second series
 * @return {Number}
 * @example
 *
 * const series1 = [10, 15, 20, 25, 50, 55]
 * const series2 = [12, 18, 34, 52, 71, 86]
 * Z.corr(series1, series2)
 * // 0.969035563335365
 */
const corr = R.curry((arr1, arr2) => {
  if (R.length(arr1) != R.length(arr2)) {
    return "Arrays are not the same length"
  } else {
    const sampleMean1 = R.mean(arr1)
    const sampleMean2 = R.mean(arr2)
    const std1 = std(arr1)
    const std2 = std(arr2)
    const nMinusOne = R.subtract(R.length(arr1), 1)
    const rangeArray = R.range(0, R.length(arr1))
    const products = R.map(x => {
      return (arr1[x] - sampleMean1) * (arr2[x] - sampleMean2)
    }, rangeArray)
    const summedProducts = R.sum(products)
    return summedProducts / (nMinusOne * std1 * std2)
  }
})

/**
 * Pipe functions together by performing left-to-right function composition.
 *
 * @func
 * @memberOf Z
 * @param {Array} functions
 * @param {df} dataframe Zebras dataframe
 * @return {any} Result of the composed functions applied to dataframe
 * @example
 *
 * const data = [
 *   {"Date": "1997-01-01", "Value": "12"},
 *   {"Date": "1997-01-02", "Value": "14"},
 *   {"Date": "1997-01-03", "Value": "7"},
 *   {"Date": "1997-01-04", "Value": "112"}
 * ]
 * Z.pipe([
 *   Z.parseNums(["Value"]), // converts "Value" column to floats
 *   Z.getCol("Value"), // extracts "Value" column to array
 *   Z.mean() // calculates mean of "Value" array
 * ])(data)
 * // 36.25
 */
const pipe = R.curry((funcs, df) => {
  return R.pipe(...funcs)(df)
})

/**
 * Concatenate two dataframes
 *
 * @func
 * @memberOf Z
 * @param {df} dataframe1 Zebras dataframe
 * @param {df} dataframe2 Zebras dataframe
 * @return {df} Zebras dataframe
 * @example
 *
 * const df1 = [{"label": "A", "value": 7}, {"label": "B", "value": 2}]
 * const df2 = [{"label": "C", "value": 17}, {"label": "D", "value": 2}]
 * Z.concat(df1, df2)
 * // [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 17}, {"label": "D", "value": 2}]
 */
const concat = R.curry((df1, df2) => {
  return R.concat(df1, df2)
})

/**
 * Create an object grouped by according to the supplied function
 *
 * @func
 * @memberOf Z
 * @param {Function} fn Function returning string key
 * @return {Object}
 * @example
 *
 * const df = [{'Day': 'Monday', 'value': 10}, {'Day': 'Tuesday', 'value': 5}, {'Day': 'Monday', 'value': 7}]
 * Z.groupBy(x => x.Day, df)
 * // {"Monday": [{"Day": "Monday", "value": 10}, {"Day": "Monday", "value": 7}], "Tuesday": [{"Day": "Tuesday", "value": 5}]}
 */
const groupBy = R.curry((func, df) => {
  return R.groupBy(func, df)
})

const slice = R.curry((start, end, df) => {
  return R.slice(start, end, df)
})

const unique = R.curry(arr => {
  return R.uniq(arr)
})

const max = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  return R.apply(Math.max, filteredArr)
})

const min = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  return R.apply(Math.min, filteredArr)
})

const sum = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  return R.sum(filteredArr)
})

const prod = R.curry(arr => {
  const filteredArr = R.reject(isNaN, arr)
  return R.product(filteredArr)
})

const getRange = R.curry(arr => {
  return [min(arr), max(arr)]
})

const countUnique = R.curry(arr => {
  return R.length(R.uniq(arr))
})

const valueCounts = R.curry(arr => {
  return R.countBy(R.identity, arr)
})

const addCol = R.curry((col, arr, df) => {
  if (R.equals(R.length(df), R.length(arr))) {
    return df.map((row, i) => R.assoc(col, arr[i], row))
  } else {
    return "Arrays are not of equal length"
  }
})

const deriveCol = R.curry((func, df) => {
  return R.map(func, df)
})

const head = (n, df) => {
  const truncated = R.take(n, df)
  //console.log(print(truncated));
  return print(truncated)
}

const tail = (n, df) => {
  const truncated = R.takeLast(n, df)
  console.log(print(truncated))
  return print(truncated)
}

const diff = R.curry(arr => {
  const iRange = R.range(0, arr.length)
  const result = R.map(i => {
    if (i == 0) {
      return NaN
    } else {
      return arr[i] - arr[i - 1]
    }
  }, iRange)
  return result
})

const rolling = (func, n, arr) => {
  const iRange = R.range(0, arr.length)
  const result = R.map(i => {
    if (i + 1 < n) {
      return "NotANumber"
    } else {
      const truncated = R.slice(i - n + 1, i + 1, arr)
      return func(truncated)
    }
  }, iRange)
  return result
}

const cumulative = (func, arr) => {
  const iRange = R.range(0, arr.length)
  const result = R.map(i => {
    const truncated = R.slice(0, i + 1, arr)
    return func(truncated)
  }, iRange)
  return result
}

const describe = arr => {
  return [
    {
      count: arr.length,
      countUnique: countUnique(arr),
      min: min(arr).toFixed(5),
      max: max(arr).toFixed(5),
      median: median(arr).toFixed(5),
      mean: mean(arr).toFixed(5),
      std: std(arr).toFixed(5),
    },
  ]
}

const merge = (dfLeft, dfRight, leftOn, rightOn, leftSuffix, rightSuffix) => {
  const colsLeft = R.keys(dfLeft[0])
  const colsRight = R.keys(dfRight[0])
  const intersection = R.filter(
    x => !R.includes(x, [leftOn, rightOn]),
    R.intersection(colsLeft, colsRight)
  )

  const renameCol = (oldColName, suffix, { [oldColName]: old, ...others }) => {
    return {
      [oldColName + suffix]: old,
      ...others,
    }
  }

  const renameDuplicateColumns = (cols, arr, suffix) => {
    for (let c of cols) {
      arr = arr.map(r => renameCol(c, suffix, r))
    }
    return arr
  }

  const dfLeftUpdated = renameDuplicateColumns(intersection, dfLeft, leftSuffix)
  const dfRightUpdated = renameDuplicateColumns(
    intersection,
    dfRight,
    rightSuffix
  )
  const colsLeftUpdated = R.keys(dfLeftUpdated[0])
  const colsRightUpdated = R.keys(dfRightUpdated[0])

  const colsAll = Array.from(new Set([...colsLeftUpdated, ...colsRightUpdated]))
  const dfLeftGrouped = R.groupBy(R.prop(leftOn), dfLeftUpdated)
  const dfRightGrouped = R.groupBy(R.prop(rightOn), dfRightUpdated)
  const index = R.keys(dfLeftGrouped)
  const fillRow = (row, cols) => {
    const rowCols = R.keys(row)
    const diff = R.difference(cols, rowCols)
    for (let c of diff) {
      row[c] = undefined
    }
    return row
  }
  return index.map(i => {
    try {
      return fillRow(
        { ...dfLeftGrouped[i]["0"], ...dfRightGrouped[i]["0"] },
        colsAll
      )
    } catch (err) {
      return fillRow({ ...dfLeftGrouped[i]["0"] }, colsAll)
    }
  })
}

const gbSum = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(i => {
    const df = groupByObj[i]
    const arr = getCol(col, df)
    const arrFiltered = R.reject(isNaN, arr)
    return { group: i, sum: R.sum(arrFiltered) }
  })
  return result
}

const gbMean = (col, groupByObj) => {
  const summed = gbSum(col, groupByObj)
  const result = summed.map(i => {
    const count = groupByObj[i.group].length
    return { group: i.group, mean: i.sum / count }
  })
  return result
}

const gbStd = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(g => {
    const arr = R.reject(isNaN, getCol(col, groupByObj[g]))
    const avg = R.mean(arr)
    const arrSquaredDiffs = R.map(x => Math.pow(x - avg, 2), arr)
    const sumSquaredDiffs = R.sum(arrSquaredDiffs)
    return { group: g, std: Math.sqrt(sumSquaredDiffs / (arr.length - 1)) }
  })
  return result
}

const gbCount = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(g => {
    return { group: g, count: groupByObj[g].length }
  })
  return result
}

const gbMin = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(g => {
    return {
      group: g,
      min: R.reduce(
        (acc, value) => R.min(acc, value[col]),
        Infinity,
        groupByObj[g]
      ),
    }
  })
  return result
}

const gbMax = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(g => {
    return {
      group: g,
      max: R.reduce(
        (acc, value) => R.max(acc, value[col]),
        -Infinity,
        groupByObj[g]
      ),
    }
  })
  return result
}

const gbDescribe = (col, groupByObj) => {
  const mins = gbMin(col, groupByObj)
  const maxes = gbMax(col, groupByObj)
  const counts = gbCount(col, groupByObj)
  const sums = gbSum(col, groupByObj)
  const means = gbMean(col, groupByObj)
  const stds = gbStd(col, groupByObj)
  const df1 = merge(mins, maxes, "group", "group", "--", "--")
  const df2 = merge(df1, counts, "group", "group", "--", "--")
  const df3 = merge(df2, sums, "group", "group", "--", "--")
  const df4 = merge(df3, means, "group", "group", "--", "--")
  const df5 = merge(df4, stds, "group", "group", "--", "--")
  return df5
}

module.exports = {
  readCSV: readCSV,
  toCSV: toCSV,
  filter: filter,
  parseNums: parseNums,
  pickCols: pickCols,
  getCol: getCol,
  mean: mean,
  median: median,
  std: std,
  pipe: pipe,
  concat: concat,
  groupBy: groupBy,
  slice: slice,
  unique: unique,
  countUnique: countUnique,
  corr: corr,
  min: min,
  max: max,
  getRange: getRange,
  dropCol: dropCol,
  valueCounts: valueCounts,
  addCol: addCol,
  deriveCol: deriveCol,
  print: print,
  head: head,
  tail: tail,
  pctChange: pctChange,
  rolling: rolling,
  parseDates: parseDates,
  sort: sort,
  sortByCol: sortByCol,
  describe: describe,
  merge: merge,
  gbSum: gbSum,
  gbMean: gbMean,
  gbCount: gbCount,
  gbMin: gbMin,
  gbMax: gbMax,
  gbStd: gbStd,
  gbDescribe: gbDescribe,
  cumulative: cumulative,
  sum: sum,
  prod: prod,
  diff: diff,
  skew: skew,
  kurt: kurt,
}
