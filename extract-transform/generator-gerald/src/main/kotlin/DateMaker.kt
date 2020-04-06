package eu.akkalytics.et.gen

import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ThreadLocalRandom

/**
 * Tries to convert a string date with the
 * date format yyyy-MM-dd to a Date obj.
 * @return if not parsable the actual date will be returned.
 */
fun String.toDate(): Date {
    var result = Date()
    /**
     * Regex pattern that checks for the yyyy-MM-dd date format.
     */
    val dateRegex: Regex = """([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))""".toRegex()

    if (dateRegex matches this) {
        try {
            val dateFormat = SimpleDateFormat("yyyy-MM-dd")
            dateFormat.timeZone = TimeZone.getTimeZone("UTC");
            result = dateFormat.parse(this)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
    return result
}

/**
 * Randomly selects a date between the minDate and maxDate.
 * @return the actual date when the params are invalid.
 */
fun makeRandomDateWithinRange(minDate: Date, maxDate: Date): Date {
    var randomDate = Date()
    if (minDate.time < maxDate.time) {
        randomDate = Date(ThreadLocalRandom.current().nextLong(minDate.time, maxDate.time))
    }
    return randomDate
}

/**
 * Retrieves the first day of the actual year as a date.
 * @return the date without a specific time.
 */
fun firstDateOfTheActualYear(): Date {
    val actualYear = Calendar.getInstance().get(Calendar.YEAR)
    val dateString = "$actualYear-01-01"
    return dateString.toDate()
}

/**
 * Retrieves the last day of the actual year as a date.
 * @return the date without a specific time.
 */
fun lastDateOfTheActualYear(): Date {
    val actualYear = Calendar.getInstance().get(Calendar.YEAR)
    val dateString = "$actualYear-12-31"
    return dateString.toDate()
}

/**
 * '201911'
 */
fun periodToDate(date: Int): Date {
    val stringDate = date.toString()
    return if (stringDate.length == 6) {
        val year = stringDate.subSequence(0,4).toString().toInt()
        val month = stringDate.subSequence(4,6).toString().toInt()
        val dateString = "$year-$month-01"
        dateString.toDate()
    } else {
        Date()
    }
}